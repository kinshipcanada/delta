import prisma from "@lib/prisma";
import { Country, Donation, DonationStatus, PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import Stripe from "stripe"

interface BuildDonationFromStripeProps {
    stripePaymentIntentId?: string
    stripeChargeId?: string
}

export interface FetchDonationProps extends BuildDonationFromStripeProps {
    donationId: string
}

export class DonationEngine {
    readonly stripeClient: Stripe;
    readonly prismaClient: PrismaClient

    constructor() {
        const stripePrivateKey = process.env.STRIPE_SECRET_KEY;
        if (!stripePrivateKey) {
            throw new Error("Stripe private key is not set in environment variables.");
        }
        this.stripeClient = new Stripe(stripePrivateKey, {
            apiVersion: "2023-08-16"
        })
        this.prismaClient = prisma
    }

    public async createDonationByWebhook(stripeChargeId: string) {
        const donation = await this.fetchDonationFromStripe({
            stripeChargeId
        })

        return await this.insertDonationObject(donation)
    }

    private async insertDonationObject(donation: Donation): Promise<Donation> {
        return await prisma.donation.create({
            data: {
                ...donation,
            }
        })
    }

    public async createDonationManually(donation: Donation) {
        // to do: backend validation of manual donation creation
        if (donation.amountDonatedInCents == 0) {
            throw new Error("Amount donated must be greater than 0")
        }

        return await this.insertDonationObject(donation)
    }

    public async fetchDonation(props: FetchDonationProps): Promise<Donation> {
        if (!(props.donationId || props.stripeChargeId || props.stripePaymentIntentId)) {
            throw new Error("One of a donation id, stripe charge id, or stripe payment intent id must be provided to fetch a donation")
        }

        if (props.donationId) {
            return await prisma.donation.findFirstOrThrow({
                where: {
                    id: props.donationId
                }
            })
        } else {
            return await this.fetchDonationFromStripe(props)
        }
    }

    // Syncing functions
    private async syncStripeInstance(donationId: string, metadata?: Stripe.MetadataParam) {
        const donation = await this.fetchDonation({ donationId })

        if (!donation.stripeChargeId) {
            throw new Error("Donation is missing a Stripe charge ID")
        }

        if (metadata) {
            this.stripeClient.charges.update(donation.stripeChargeId, {
                metadata
            })
        } else {
            const metadataParam: Stripe.MetadataParam = {
                "donationId": donation.id,
                "status": donation.status,
                "amountDonatedInCents": donation.amountDonatedInCents,
                "feesDonatedInCents": donation.feesDonatedInCents,
                // "donorFirstName": donation.donorFirstName,
                // "donorMiddleName": donation.donorMiddleName,
                // "donorLastName": donation.donorLastName,
                // "donorEmail": donation.donorEmail,
                // "donorAddressLineAddress": donation.donorAddressLineAddress,
                // "donorAddressCity": donation.donorAddressCity,
                // "donorAddressState": donation.donorAddressState,
                // "donorAddressCountry": donation.donorAddressCountry,
                // "donorAddressPostalCode": donation.donorAddressPostalCode,
                "donorFirstName": "John",
                "donorLastName": "Doe",
                "donorEmail": "john@doe.com",
                "donorAddressLineAddress": "123 Main St",
                "donorAddressCity": "Toronto",
                "donorAddressState": "ON",
                "donorAddressCountry": "CA",
                "donorAddressPostalCode": "M5A 1A1",
                "syncStatus": "synced"
            }
            
            this.stripeClient.charges.update(donation.stripeChargeId, {
                metadata: metadataParam
            })
        }
    }

    // private async syncDatabaseInstance(donationId?: string, donation?: Donation) {
    //     if (!donationId && !donation) {
    //         throw new Error("One of a donation id or donation must be provided to sync the database instance")
    //     }

    //     let donationObject: Donation;

    //     if (donation) {
    //         donationObject = donation
    //     } else {
    //         donationObject = await prisma.donation.findFirstOrThrow({
    //             where: {
    //                 id: donationId
    //             }
    //         })
    //     }

    //     const stripeObject = await this.fetchDonationFromStripe({
    //         stripePaymentIntentId: donationObject.stripePaymentIntentId as string,
    //         stripeChargeId: donationObject.stripeChargeId as string,
    //     })

    //     await prisma.donation.update({
    //         where: {
    //             id: donationObject.id
    //         },
    //         data: {
    //             stripeBalanceTxnId: stripeObject.stripeBalanceTxnId,
    //             transactionStatus: stripeObject.transactionStatus
    //         }
    //     })
    // }

    private async fetchDonationFromStripe(props: BuildDonationFromStripeProps) {
        let paymentIntentObject: Stripe.PaymentIntent
        let chargeObject: Stripe.Charge
        let balanceTransactionObject: Stripe.BalanceTransaction | undefined = undefined
        let customerObject: Stripe.Customer

        if (props.stripePaymentIntentId && props.stripeChargeId) {
            [paymentIntentObject, chargeObject] = await Promise.all([
                this.stripeClient.paymentIntents.retrieve(props.stripePaymentIntentId),
                this.stripeClient.charges.retrieve(props.stripeChargeId)
            ])
        } else if (props.stripeChargeId) {
            chargeObject = await this.stripeClient.charges.retrieve(props.stripeChargeId)
            
            if (!chargeObject.payment_intent) {
                throw new Error("Stripe charge object has empty payment intent field")
            }

            if (typeof chargeObject.payment_intent == "string") {
                paymentIntentObject = await this.stripeClient.paymentIntents.retrieve(chargeObject.payment_intent)
            } else {
                paymentIntentObject = chargeObject.payment_intent
            }
        } else if (props.stripePaymentIntentId) {
            paymentIntentObject = await this.stripeClient.paymentIntents.retrieve(props.stripePaymentIntentId)
            
            if (!paymentIntentObject.latest_charge) {
                throw new Error("Stripe charge object has empty payment intent field")
            }

            if (typeof paymentIntentObject.latest_charge == "string") {
                chargeObject = await this.stripeClient.charges.retrieve(paymentIntentObject.latest_charge)
            } else {
                chargeObject = paymentIntentObject.latest_charge
            }
        } else {
            throw new Error("One of stripePaymentIntentId or stripeChargeId must be provided to fetch the donation")
        }

        if (!chargeObject.customer) {
            throw new Error("Missing customer on stripe charge object")
        }

        if (typeof chargeObject.customer === "string") {
            const retrievedCustomer = await this.stripeClient.customers.retrieve(chargeObject.customer);
            if ("deleted" in retrievedCustomer) {
                throw new Error("Donor stripe customer object has been deleted");
            } else {
                customerObject = retrievedCustomer;
            }
        } else {
            if ("deleted" in chargeObject.customer) {
                throw new Error("Donor stripe customer object has been deleted");
            } else {
                customerObject = chargeObject.customer;
            }
        }

        if (chargeObject.balance_transaction) {
            balanceTransactionObject = 
                (typeof chargeObject.balance_transaction == "string") ? await this.stripeClient.balanceTransactions.retrieve(chargeObject.balance_transaction) 
                : chargeObject.balance_transaction
        }

        const metadataObject = chargeObject.metadata

        const {
            donationId,
            loggedAt,
            syncStatus,
            allocationBreakdown,
            status,
            adheringLabels,
            allocatedToCauses,
            unallocatedToCauses,
            causeName,
            causeRegion,
            amountDonatedInCents,
            feesDonatedInCents,
            donorFirstName,
            donorMiddleName,
            donorLastName,
            donorEmail,
            donorAddressLineAddress,
            donorAddressCity,
            donorAddressState,
            donorAddressCountry,
            donorAddressPostalCode,
        } = chargeObject.metadata

        if (!chargeObject.payment_method_details) {
            throw new Error("No payment method object attached to Stripe charge object")
        }

        const cardPaymentMethodDetails: Stripe.Charge.PaymentMethodDetails.Card | undefined = chargeObject.payment_method_details.card

        const donation: Donation = {
            id: donationId,
            status: status as DonationStatus,
            date: new Date(chargeObject.created * 1000),
            amountDonatedInCents: Number(amountDonatedInCents),
            amountChargedInCents: chargeObject.amount_captured,
            feesChargedInCents: balanceTransactionObject ? balanceTransactionObject.fee : -1,
            feesDonatedInCents: Number(feesDonatedInCents),
            stripeCustomerId: customerObject.id,
            stripeChargeId: chargeObject.id,
            donorId: null,
            stripeTransferId: null,
            version: null,
        }

        return donation
    }
}