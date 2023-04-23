import { CreateDonationResponse, ErroredResponse, FetchDonationResponse } from "../classes/api";
import { Donation } from "../classes/donation";
import { DeliveryMethod, UserNotificationType } from "../classes/notifications";
import { DonationIdentifiers } from "../classes/utils";
import { fetchDonationFromDatabase, uploadDonationToDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase } from "../utils/formatting";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "../utils/stripe";

export async function createDonation(identifiers: DonationIdentifiers): Promise<CreateDonationResponse | ErroredResponse> {
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
        return {
            status: 500,
            endpoint_called: 'createDonation',
            error: error.message
        }
    }
}

export async function fetchDonation(identifiers: DonationIdentifiers): Promise<FetchDonationResponse | ErroredResponse> {
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
        return {
            status: 500,
            endpoint_called: 'fetchDonation',
            error: error.message
        }
    }
}

