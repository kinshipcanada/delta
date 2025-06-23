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
        this.prismaClient = new PrismaClient()
    }


    public async createDonationByWebhook(stripeChargeId: string) {
        console.log(`[DonationEngine] Creating donation from webhook for charge ID: ${stripeChargeId}`);
        try {
            const donation = await this.fetchDonationFromStripe({
                stripeChargeId
            });
            console.log(`[DonationEngine] Successfully fetched donation data from Stripe: ${donation.id}`);

            try {
                const existingDonation = await this.prismaClient.donation.findUnique({
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
            return await this.prismaClient.donation.create({
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
            id: donation_id,
            status: status ? status as status_enum : undefined,
            date: new Date(chargeObject.created * 1000),
            amount_donated_cents: parsedAmountDonatedCents,
            amount_charged_cents: chargeObject.amount_captured,
            fee_charged_by_processor: balanceTransactionObject ? balanceTransactionObject.fee : -1,
            fees_covered_by_donor: parsedFeesCoveredByDonor,
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

        // Check if cause already exists to prevent duplicate insertion
        try {
            const existingCause = await this.prismaClient.cause.findUnique({
                where: { id: causeData.id }
            });
            
            if (existingCause) {
                console.log(`[DonationEngine] Cause with ID ${causeData.id} already exists, skipping insertion`);
                return existingCause;
            }
        } catch (error) {
            console.error(`[DonationEngine] Error checking for existing cause:`, error);
        }

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
            const savedCause = await this.prismaClient.cause.create({
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

    async saveDistributionForDonation(donationData: donation, causesArray: any[]) {
        console.log(`[DonationEngine] Attempting to save distributions for donation ID: ${donationData.id}. Causes Data: ${JSON.stringify(causesArray)}`);

        try {
            const { v4: uuidv4 } = require('uuid');
            const savedDistributions = [];

            // Constants for distribution IDs
            const INDIA_DISTRIBUTION_ID = '6e56a45b-d36c-4413-93b8-c9820d16462e';
            const IRAQ_DISTRIBUTION_ID = '093c62f1-b17b-46ca-ac52-38ff851768b5';
            const AFRICA_DISTRIBUTION_ID = '1fd2bd8a-e8ac-4520-af67-9ed62d418587';

            // Helper function to get total allocated amount for a distribution
            const getTotalAllocatedAmount = async (distributionId: string) => {
                const allocations = await this.prismaClient.donation_distribution.aggregate({
                    where: { distribution_id: distributionId },
                    _sum: { amount_cents: true }
                });
                return allocations._sum.amount_cents || 0;
            };

            // Helper function to get distribution total amount
            const getDistributionTotalAmount = async (distributionId: string) => {
                const distribution = await this.prismaClient.distribution.findUnique({
                    where: { id: distributionId }
                });
                return distribution?.amount_cents || 0;
            };

            // Helper function to get allocation percentage for a distribution
            const getAllocationPercentage = async (distributionId: string) => {
                const totalAmount = await getDistributionTotalAmount(distributionId);
                const allocatedAmount = await getTotalAllocatedAmount(distributionId);
                return totalAmount > 0 ? (allocatedAmount / totalAmount) * 100 : 0;
            };

            // Helper function to check if a distribution has capacity
            const hasCapacity = async (distributionId: string, amount: number) => {
                const totalAllocated = await getTotalAllocatedAmount(distributionId);
                const distributionTotal = await getDistributionTotalAmount(distributionId);
                return (totalAllocated + amount) <= distributionTotal;
            };

            // Helper function to determine target distribution for shared causes
            const determineSharedCauseDistribution = async (cause: any) => {
                const amount = cause.amountDonatedCents;
                console.log(`[DonationEngine] Determining shared distribution for cause: ${cause.cause} (${amount} cents)`);
                
                const indiaPercentage = await getAllocationPercentage(INDIA_DISTRIBUTION_ID);
                const africaPercentage = await getAllocationPercentage(AFRICA_DISTRIBUTION_ID);

                console.log(`[DonationEngine] Current allocation percentages - India: ${indiaPercentage.toFixed(2)}%, Africa: ${africaPercentage.toFixed(2)}%`);

                // Check capacity first
                const canAddToIndia = await hasCapacity(INDIA_DISTRIBUTION_ID, amount);
                const canAddToAfrica = await hasCapacity(AFRICA_DISTRIBUTION_ID, amount);

                console.log(`[DonationEngine] Capacity check - India: ${canAddToIndia}, Africa: ${canAddToAfrica}`);

                if (!canAddToIndia && !canAddToAfrica) {
                    console.log(`[DonationEngine] Neither distribution has capacity`);
                    return null;
                }

                if (!canAddToIndia) {
                    console.log(`[DonationEngine] India full, using Africa`);
                    return AFRICA_DISTRIBUTION_ID;
                }
                if (!canAddToAfrica) {
                    console.log(`[DonationEngine] Africa full, using India`);
                    return INDIA_DISTRIBUTION_ID;
                }

                // Both have capacity, use percentage-based allocation
                const percentageDifference = Math.abs(indiaPercentage - africaPercentage);
                if (percentageDifference > 5) {
                    const selectedId = indiaPercentage < africaPercentage ? INDIA_DISTRIBUTION_ID : AFRICA_DISTRIBUTION_ID;
                    console.log(`[DonationEngine] Selected ${selectedId} based on percentage difference of ${percentageDifference.toFixed(2)}%`);
                    return selectedId;
                }

                // If percentages are close, alternate based on timestamp
                const selectedId = Date.now() % 2 === 0 ? INDIA_DISTRIBUTION_ID : AFRICA_DISTRIBUTION_ID;
                console.log(`[DonationEngine] Percentages close, alternating to: ${selectedId}`);
                return selectedId;
            };

            for (const cause of causesArray) {
                console.log(`\n[DonationEngine] Processing cause: ${cause.cause} for donation ID: ${donationData.id}`);
                console.log(`[DonationEngine] Cause details:`, JSON.stringify(cause, null, 2));
                
                const causeLower = cause.cause.toLowerCase();
                const region = cause.region?.toUpperCase();
                let targetDistributionId = null;

                // Handle causes that go to India distribution if capacity available
                if (
                    causeLower === "vision kinship" ||
                    (causeLower === "orphans" && (region === "INDIA" || region === "ANYWHERE")) ||
                    causeLower === "medical aid" ||
                    causeLower === "housing" ||
                    causeLower === "widows" ||
                    causeLower === "fidya" ||
                    causeLower === "quran" ||
                    causeLower === "sehme sadat"
                ) {
                    console.log(`[DonationEngine] Cause matches India-specific criteria`);
                    if (await hasCapacity(INDIA_DISTRIBUTION_ID, cause.amountDonatedCents)) {
                        targetDistributionId = INDIA_DISTRIBUTION_ID;
                    } else {
                        console.log(`[DonationEngine] India distribution at capacity. Skipping distribution linking for cause: ${cause.cause}`);
                        continue;
                    }
                }
                // Handle Iraq-specific causes
                else if (
                    region === "IRAQ" ||
                    (causeLower === "orphans" && region === "IRAQ") ||
                    causeLower === "sehme imam"
                ) {
                    console.log(`[DonationEngine] Cause matches Iraq-specific criteria`);
                    targetDistributionId = IRAQ_DISTRIBUTION_ID;
                }
                // Handle Education, Poverty Relief, and Where Most Needed with balanced allocation
                else if (causeLower === "education" || causeLower === "poverty relief" || causeLower === "where most needed") {
                    console.log(`[DonationEngine] Cause qualifies for balanced allocation`);
                    targetDistributionId = await determineSharedCauseDistribution(cause);
                    if (!targetDistributionId) {
                        console.log(`[DonationEngine] Both India and Africa distributions at capacity. Skipping distribution linking for cause: ${cause.cause}`);
                        continue;
                    }
                    console.log(`[DonationEngine] Selected ${targetDistributionId === INDIA_DISTRIBUTION_ID ? 'India' : 'Africa'} distribution for ${cause.cause} based on balanced allocation`);
                } else {
                    console.log(`[DonationEngine] Cause ${cause.cause} doesn't match any distribution criteria`);
                }

                if (targetDistributionId) {
                    try {
                        console.log(`[DonationEngine] Creating donation_distribution record for distribution: ${targetDistributionId}`);
                        const donationDistribution = await this.prismaClient.donation_distribution.create({
                            data: {
                                id: uuidv4(),
                                donation_id: donationData.id,
                                distribution_id: targetDistributionId,
                                cause_id: cause.id,
                                amount_cents: cause.amountDonatedCents
                            }
                        });

                        console.log(`[DonationEngine] Successfully created donation_distribution record:`, JSON.stringify(donationDistribution, null, 2));
                        savedDistributions.push(donationDistribution);
                    } catch (error) {
                        console.error(`[DonationEngine] Error creating donation_distribution for cause ${cause.cause}:`, error);
                        throw error;
                    }
                } else {
                    console.log(`[DonationEngine] No matching distribution found for cause: ${cause.cause}`);
                }
            }
            
            console.log(`[DonationEngine] Successfully processed ${savedDistributions.length} distribution records for donation ID: ${donationData.id}`);
            return savedDistributions;
        } catch (error) {
            console.error(`[DonationEngine] Error processing distributions for donation ID ${donationData.id}:`, error);
            throw error;
        }
    }
}