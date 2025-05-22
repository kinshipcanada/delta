import prisma from "@lib/prisma";
import { Country, donation, region_enum, status_enum, PrismaClient } from "@prisma/client";
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


    private async insertDonationObject(donation: donation): Promise<donation> {
        console.log(`[DonationEngine] Inserting donation into database with ID: ${donation.id}`);
        console.log(`[DonationEngine] Donation data:`, JSON.stringify({
            id: donation.id,
            status: donation.status,
            amount_cents: donation.amount_charged_cents
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

        // Log the metadata for debugging
        console.log("[DonationEngine] Charge object metadata:", JSON.stringify(chargeObject.metadata, null, 2));

        const {
            donation_id,
            status,
            amount_donated_cents,
            fees_covered_by_donor,
            donor_first_name,
            donor_last_name,
            donor_email,
            donor_address_line_address,
            donor_address_city,
            donor_address_state,
            donor_address_country,
            donor_address_postal_code,
        } = chargeObject.metadata || {}; // Use default {} to prevent error if metadata itself is null/undefined

        // Validate critical metadata fields
        if (!donation_id) {
            console.error("[DonationEngine] Critical error: 'donation_id' is missing from Stripe charge metadata.");
            throw new Error("'donation_id' is missing from Stripe charge metadata. Cannot create donation.");
        }
        if (typeof donation_id !== 'string') {
            console.error(`[DonationEngine] Critical error: 'donation_id' is not a string. Received: ${donation_id}`);
            throw new Error(`'donation_id' must be a string. Received: ${typeof donation_id}`);
        }

        let parsedAmountDonatedCents: number;
        if (amount_donated_cents === undefined || amount_donated_cents === null) {
            console.error("[DonationEngine] Critical error: 'amount_donated_cents' is missing from Stripe charge metadata.");
            throw new Error("'amount_donated_cents' is missing from Stripe charge metadata.");
        }
        parsedAmountDonatedCents = Number(amount_donated_cents);
        if (isNaN(parsedAmountDonatedCents)) {
            console.error(`[DonationEngine] Critical error: 'amount_donated_cents' from metadata ('${amount_donated_cents}') is not a valid number.`);
            throw new Error(`'amount_donated_cents' ('${amount_donated_cents}') is not a valid number.`);
        }

        let parsedFeesCoveredByDonor: number = 0;
        if (fees_covered_by_donor !== undefined && fees_covered_by_donor !== null) {
            const tempFees = Number(fees_covered_by_donor);
            if (!isNaN(tempFees)) {
                parsedFeesCoveredByDonor = tempFees;
            } else {
                console.warn(`[DonationEngine] Warning: 'fees_covered_by_donor' from metadata ('${fees_covered_by_donor}') is not a valid number. Defaulting to 0.`);
            }
        }

        // Improved donor_name logic
        let determinedDonorName = "Unknown";
        if (donor_first_name && typeof donor_first_name === 'string' && donor_last_name && typeof donor_last_name === 'string') {
            determinedDonorName = `${donor_first_name} ${donor_last_name}`;
        } else if (donor_first_name && typeof donor_first_name === 'string') {
            determinedDonorName = donor_first_name;
        } else if (donor_last_name && typeof donor_last_name === 'string') {
            determinedDonorName = donor_last_name;
        }
        
        // Log status for debugging; Prisma will perform final enum validation
        if (status !== undefined && status !== null) {
            console.log(`[DonationEngine] Received status from metadata: '${status}'. Prisma will validate against enum values.`);
        }

        if (!chargeObject.payment_method_details) {
            console.error("[DonationEngine] Error: No payment method object attached to Stripe charge object");
            throw new Error("No payment method object attached to Stripe charge object")
        }

        const donation: any = {
            id: donation_id, // Validated string
            status: status ? status as status_enum : undefined, // Prisma handles undefined for optional enum; validates value if present
            date: new Date(chargeObject.created * 1000),
            amount_donated_cents: parsedAmountDonatedCents, // Validated number
            amount_charged_cents: chargeObject.amount_captured,
            fee_charged_by_processor: balanceTransactionObject ? balanceTransactionObject.fee : -1,
            fees_covered_by_donor: parsedFeesCoveredByDonor, // Number, defaults to 0
            stripe_customer_id: customerObject.id,
            stripe_charge_id: chargeObject.id,
            stripe_transfer_id: null,
            version: null,
            donor_name: determinedDonorName,
            email: donor_email || customerObject.email || "",
            line_address: donor_address_line_address || "",
            city: donor_address_city || "",
            state: donor_address_state || "",
            country: donor_address_country || "",
            postal_code: donor_address_postal_code || "",
        }

        console.log("[DonationEngine] Constructed donation object for insertion:", JSON.stringify(donation, null, 2));
        return donation as donation
    }

    async saveCauseForDonation(donation_id: string, causeData: any) {
        console.log(`[DonationEngine] Attempting to save cause for donation ID: ${donation_id}. Cause Data: ${JSON.stringify(causeData)}`);

        const dataToCreate: any = {
            id: causeData.id,
            donation_id: donation_id,
            amount_cents: causeData.amountDonatedCents,
            cause: causeData.cause,
        };

        if (causeData.region) {
            dataToCreate.region = causeData.region;
        } else {
            dataToCreate.region = region_enum.ANYWHERE;
        }

        if (causeData.subCause) {
            dataToCreate.subcause = causeData.subCause;
        }

        if (causeData.inHonorOf) {
            dataToCreate.in_honor_of = causeData.inHonorOf;
        }

        console.log(`[DonationEngine] Prepared data for cause insertion for donation ID ${donation_id}:`, JSON.stringify(dataToCreate));

        try {
            const savedCause = await prisma.cause.create({
                data: dataToCreate,
            });
            console.log(`[DonationEngine] Successfully saved cause to database. Donation ID: ${donation_id}, Cause ID: ${savedCause.id}`);
            return savedCause;
        } catch (error) {
            console.error(`[DonationEngine] Error inserting cause into database for donation ID ${donation_id}:`, error);
            console.error(`[DonationEngine] Failed cause data for donation ID ${donation_id}:`, JSON.stringify(causeData));
            throw error;
        }
    }
}