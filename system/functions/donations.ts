import { CreateDonationResponse, ErroredResponse, FetchDonationResponse, FetchGroupOfDonationsResponse } from "../classes/api";
import { Donation } from "../classes/donation";
import { DeliveryMethod, UserNotificationType } from "../classes/notifications";
import { DonationIdentifiers } from "../classes/utils";
import { fetchDonationFromDatabase, uploadDonationToDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase } from "../utils/formatting";
import { validateEmail } from "../utils/helpers";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "../utils/stripe";

export async function createDonation(identifiers: DonationIdentifiers): Promise<CreateDonationResponse> {
    try {
        const donation = await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers));
        await uploadDonationToDatabase(donation);
        await sendNotification(
            UserNotificationType.DONATION_MADE,
            donation,
            DeliveryMethod.EMAIL,
        )

        return {
            status: 200,
            endpoint_called: 'createDonation',
            donation: donation
        }
    } catch (error) {
        throw new Error("Error creating donation");
    }
}

export async function fetchDonation(identifiers: DonationIdentifiers): Promise<FetchDonationResponse> {
    try {
        if (
            identifiers.donation_id == null &&
            identifiers.stripe_charge_id == null &&
            identifiers.stripe_payment_intent_id == null
        ) { throw new Error("No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.") }
    
        const donationFromDatabase = await fetchDonationFromDatabase(identifiers);
    
        if (donationFromDatabase) { 
            return {
                status: 200,
                endpoint_called: 'fetchDonation',
                donation: formatDonationFromDatabase(donationFromDatabase)
            };
        }
    
        // If the donation already exists in the database, return that, otherwise, fetch it from Stripe
        return {
            status: 200,
            endpoint_called: 'fetchDonation',
            donation: await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers))
        }
    } catch (error) {
        throw new Error("Error fetching donation");
    }
}

export async function fetchAllDonationsForDonor(donorEmail: string): Promise<FetchGroupOfDonationsResponse> {
    try {
        if (!validateEmail(donorEmail)) { throw new Error("Invalid email address provided.") }

        throw new Error("Not implemented yet");
    } catch (error) {
        throw new Error("Error fetching all donations for donor");
    }
}
