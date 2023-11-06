import { v4 as uuidv4 } from 'uuid';
import { Donation } from '../classes/donation';
import { UserNotificationType } from "@lib/classes/notifications";
import { DonationIdentifiers } from "@lib/classes/utils";
import { DatabaseTable } from "../utils/constants";
import { DatabaseTypings, fetchAllDonationsForEmail, fetchProofFromDatabase, parameterizedDatabaseQuery } from "@lib/utils/database";
import { fetchDonationFromDatabase, uploadDonationToDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase } from "../utils/formatting";
import { validateEmail } from "../utils/helpers";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "@lib/utils/stripe";

export async function createDonation(identifiers: DonationIdentifiers): Promise<Donation> {
    try {
        const donation = await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers));
        await uploadDonationToDatabase(donation);
        await sendNotification(
            UserNotificationType.DONATION_MADE,
            donation,
        )

        return donation
    } catch (error) {
        throw error
    }
}

export async function createManualDonation(donation: Donation): Promise<Donation> {
    try {
        const donationId = uuidv4();
        donation.identifiers.donation_id = donationId;
        await uploadDonationToDatabase(donation);
        await sendNotification(
            UserNotificationType.DONATION_MADE,
            donation,
        )
        return donation
    } catch (error) {
        throw error
    }
}

export async function fetchDonation(identifiers: DonationIdentifiers): Promise<Donation> {
    try {
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
    } catch (error) {
        throw error
    }
}

// todo
export async function fetchAllDonationsForDonorWithProof(donorEmail: string): Promise<Donation[]> {
    try {
        if (!validateEmail(donorEmail)) {
            throw new Error("Invalid email address provided.");
        }

        const donationsFromDatabase = await fetchAllDonationsForEmail(donorEmail)
        return donationsFromDatabase.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"] & { "proof": string }) => formatDonationFromDatabase(donation, JSON.parse(donation.proof)));
    } catch (error) {
        console.error(error)
        throw error;
    }
}

export async function fetchAllDonationsForDonor(donorEmail: string): Promise<Donation[]> {
    try {
        if (!validateEmail(donorEmail)) {
            throw new Error("Invalid email address provided.");
        }

        const donationsFromDatabase = await parameterizedDatabaseQuery(DatabaseTable.DONATIONS, { donor_contact_email: donorEmail }, false);
        return donationsFromDatabase.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]) => formatDonationFromDatabase(donation));
    } catch (error) {
        throw error;
    }
}

export async function adminFetchDonationsBySpecs(
    start_date?: Date,
    end_date?: Date,
    payment_method?: Date,
    page?: Date,
    offset?: Date
) {
    const donationsFromDatabase = await parameterizedDatabaseQuery(DatabaseTable.DONATIONS, { donor_contact_email: "hobbleabbas@gmail.com" }, false);
    return donationsFromDatabase.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]) => formatDonationFromDatabase(donation));
}