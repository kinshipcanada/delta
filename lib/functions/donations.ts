import { v4 as uuidv4 } from 'uuid';
import { Donation } from '../classes/donation';
import { Country, Currency, DonationRegion, DonationStatus, PaymentMethodType, Donation as PrismaDonation, TransactionStatus } from '@prisma/client';
import { UserNotificationType } from "@lib/classes/notifications";
import { DonationIdentifiers } from "@lib/classes/utils";
import { DatabaseTable } from "../utils/constants";
import { DatabaseTypings, fetchAllDonationsForEmail, fetchProofFromDatabase, parameterizedDatabaseQuery, uploadNewDonationToDatabase } from "@lib/utils/database";
import { fetchDonationFromDatabase, uploadDonationToDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase } from "../utils/formatting";
import { validateEmail } from "../utils/helpers";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "@lib/utils/stripe";

export const createDonation2 = async (identifiers: DonationIdentifiers): Promise<PrismaDonation> => {
    const rawStripeData = await fetchFullDonationFromStripe(identifiers)

    if (!rawStripeData.charge_object) {
        throw new Error("missing stripe data")
    }

    const donation: PrismaDonation = {
        id: uuidv4(),
        loggedAt: new Date(),
        status: DonationStatus.PROCESSING,
        donatedAt: new Date(),
        adheringLabels: ["STRIPE_WEBHOOK"],
        allocatedToCauses: 0,
        unallocatedToCauses: 0,
        allocationBreakdown: { v2Causes: [] },
        causeRegion: DonationRegion.ANYWHERE,
        transactionStatus: TransactionStatus.SUCCEEDED,
        amountChargedInCents: rawStripeData.charge_object!.amount,
        amountRefunded: 0,
        amountDonatedInCents: 0,
        feesChargedInCents: rawStripeData.balance_transaction_object!.fee,
        feesDonatedInCents: rawStripeData.charge_object!.metadata ? parseInt(rawStripeData.charge_object!.metadata.fees_covered) : 0,
        currency: Currency.CAD,
        donorFirstName: rawStripeData.charge_object!.metadata.first_name ? rawStripeData.charge_object!.metadata.first_name : rawStripeData.customer!.name!.split(' ')[0] as string,
        donorLastName: rawStripeData.charge_object!.metadata.last_name ? rawStripeData.charge_object!.metadata.last_name : rawStripeData.customer!.name!.split(' ')[1] as string,
        donorEmail: rawStripeData.customer!.email!,
        donorAddressLineAddress: rawStripeData.customer!.address!.line1 as string,
        donorAddressPostalCode: rawStripeData.customer!.address!.postal_code as string,
        donorAddressCity: rawStripeData.customer!.address!.city as string,
        donorAddressState: rawStripeData.customer!.address!.state as string,
        donorAddressCountry: rawStripeData.customer!.address!.country?.toUpperCase() as Country,
        billingAddressPostalCode: rawStripeData.customer!.address!.postal_code as string,
        stripeCustomerId: rawStripeData.customer!.id,
        stripePaymentIntentId: rawStripeData.payment_intent_object!.id,
        stripeChargeId: rawStripeData.charge_object!.id,
        stripePaymentMethodId: rawStripeData.payment_method!.id,
        paymentMethodType: PaymentMethodType.CARD,
        causeName: null,
        donorId: null,
        donorMiddleName: null,
        stripeBalanceTxnId: null,
        pmCardFunding: null,
        pmCardBrand: null,
        pmCardLast4: null,
        pmCardExpMonth: null,
        pmCardExpYear: null,
        legacyIdV0: null,
        legacyIdV1: null
    }

    // email: rawStripeObject.customer!.email!,
    await uploadNewDonationToDatabase(donation)
    return donation
}

// export async function createDonation(identifiers: DonationIdentifiers): Promise<Donation> {
//     const donation = await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers));
//     await uploadDonationToDatabase(donation);
//     await sendNotification(
//         UserNotificationType.DONATION_MADE,
//         donation,
//     )

//     return donation
// }

export async function createManualDonation(donation: Donation): Promise<Donation> {
    const donationId = uuidv4();
    donation.identifiers.donation_id = donationId;
    await uploadDonationToDatabase(donation);
    await sendNotification(
        UserNotificationType.DONATION_MADE,
        donation,
    )
    return donation
}

export async function fetchDonation(identifiers: DonationIdentifiers): Promise<Donation> {
    if (
        identifiers.donation_id == null &&
        identifiers.stripe_charge_id == null &&
        identifiers.stripe_payment_intent_id == null
    ) { throw new Error("No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.") }

    const [donationFromDatabase, proofFromDatabase] = await Promise.all([
        fetchDonationFromDatabase(identifiers),
        fetchProofFromDatabase(identifiers)
    ])
        
    if (donationFromDatabase) { 
        return formatDonationFromDatabase(donationFromDatabase, proofFromDatabase)
    }

    // If the donation already exists in the database, return that, otherwise, fetch it from Stripe
    return await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers))
}

// todo
export async function fetchAllDonationsForDonorWithProof(donorEmail: string): Promise<Donation[]> {
    if (!validateEmail(donorEmail)) {
        throw new Error("Invalid email address provided.");
    }

    const donationsFromDatabase = await fetchAllDonationsForEmail(donorEmail)
    return donationsFromDatabase.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"] & { "proof": string }) => formatDonationFromDatabase(donation, JSON.parse(donation.proof)));
}

export async function fetchAllDonationsForDonor(donorEmail: string): Promise<Donation[]> {
    if (!validateEmail(donorEmail)) {
        throw new Error("Invalid email address provided.");
    }

    const donationsFromDatabase = await parameterizedDatabaseQuery(DatabaseTable.DONATIONS, { donor_contact_email: donorEmail }, false);
    return donationsFromDatabase.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]) => formatDonationFromDatabase(donation));
}
