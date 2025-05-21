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
        console.log(`[DonationEngine] Creating donation from webhook for charge ID: ${stripeChargeId}`);
        try {
            const donation = await this.fetchDonationFromStripe({
                stripeChargeId
            });
            console.log(`[DonationEngine] Successfully fetched donation data from Stripe: ${donation.id}`);

            try {
                const existingDonation = await prisma.donation.findUnique({
                    where: { id: donation.id }
                });
                
                if (existingDonation) {
                    console.log(`[DonationEngine] Donation with ID ${donation.id} already exists, skipping insertion`);
                    return existingDonation;
                }
                
                const savedDonation = await this.insertDonationObject(donation);
                console.log(`[DonationEngine] Successfully saved donation to database: ${savedDonation.id}`);
                return savedDonation;
            } catch (insertError) {
                console.error(`[DonationEngine] Error inserting donation into database:`, insertError);
                throw insertError;
            }
        } catch (fetchError) {
            console.error(`[DonationEngine] Error fetching donation from Stripe:`, fetchError);
            throw fetchError;
        }
    }


    private async insertDonationObject(donation: Donation): Promise<Donation> {
        console.log(`[DonationEngine] Inserting donation into database with ID: ${donation.id}`);
        console.log(`[DonationEngine] Donation data:`, JSON.stringify({
            id: donation.id,
            status: donation.status,
            amount: donation.amountChargedInCents
        }));
        
        try {
            return await prisma.donation.create({
                data: {
                    ...donation,
                }
            });
        } catch (error) {
            console.error(`[DonationEngine] Database error:`, error);
            throw error;
        }
    }

    
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

        const {
            donationId,
            status,
            amountDonatedInCents,
            feesDonatedInCents,
        } = chargeObject.metadata

        if (!chargeObject.payment_method_details) {
            throw new Error("No payment method object attached to Stripe charge object")
        }

        const donation: any = {
            id: donationId,
            status: status as DonationStatus,
            // Remove date field to avoid database error
            date: new Date(chargeObject.created * 1000),
            amountDonatedInCents: Number(amountDonatedInCents),
            amountChargedInCents: chargeObject.amount_captured,
            feesChargedInCents: balanceTransactionObject ? balanceTransactionObject.fee : -1,
            feesDonatedInCents: Number(feesDonatedInCents),
            stripeCustomerId: customerObject.id,
            stripeChargeId: chargeObject.id,
            stripeTransferId: null,
            version: null,
        }

        console.log("[DonationEngine] Created donation object:", JSON.stringify(donation));
        return donation as Donation
    }

    async saveCauseForDonation(donationId: string, causeData: any) {
        return await prisma.cause.create({
            data: {
                id: causeData.id,
                donation_id: donationId,
                region: causeData.region,
                amountDonatedCents: causeData.amountDonatedCents,
                cause: causeData.cause,
                subCause: causeData.subCause,
            },
        });
    }
}