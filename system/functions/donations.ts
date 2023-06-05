import { CreateDonationResponse, ErroredResponse, FetchDonationResponse, FetchGroupOfDonationsResponse } from "../classes/api";
import { Donation } from "../classes/donation";
import { DeliveryMethod, UserNotificationType } from "../classes/notifications";
import { DonationIdentifiers } from "../classes/utils";
import { DatabaseTable } from "../utils/constants";
import { parameterizedDatabaseQuery } from "../utils/database";
import { fetchDonationFromDatabase, uploadDonationToDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase, formatCartFromDatabase } from "../utils/formatting";
import { validateEmail } from "../utils/helpers";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "../utils/stripe";

export async function createDonation(identifiers: DonationIdentifiers): Promise<Donation> {
    try {
        const donation = await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers));
        await uploadDonationToDatabase(donation);
        await sendNotification(
            UserNotificationType.DONATION_MADE,
            donation,
            DeliveryMethod.EMAIL,
        )

        return donation
    } catch (error) {
        throw new Error("Error creating donation");
    }
}

export async function fetchDonation(identifiers: DonationIdentifiers): Promise<Donation> {
    try {
        if (
            identifiers.donation_id == null &&
            identifiers.stripe_charge_id == null &&
            identifiers.stripe_payment_intent_id == null
        ) { throw new Error("No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.") }
    
        const donationFromDatabase = await fetchDonationFromDatabase(identifiers);
    
        if (donationFromDatabase) { 
            return formatDonationFromDatabase(donationFromDatabase)
        }
    
        // If the donation already exists in the database, return that, otherwise, fetch it from Stripe
        return await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers))
    } catch (error) {
        throw new Error("Error fetching donation");
    }
}

export async function fetchAllDonationsForDonor(donorEmail: string): Promise<Donation[]> {
    try {
        if (!validateEmail(donorEmail)) { throw new Error("Invalid email address provided.") }
        return (await parameterizedDatabaseQuery(DatabaseTable.DONATIONS, { email: donorEmail }, false)).map(donation => formatDonationFromDatabase(donation));
    }    catch (error) {
        throw new Error(error.message);
    }
}

export async function fetchKinshipCart(cartId: string): Promise<Donation> {
    try {
        const cart =  formatCartFromDatabase(await parameterizedDatabaseQuery(DatabaseTable.KINSHIP_CARTS, { id: cartId }, true));
        return cart
    } catch (error) {
        throw new Error(error.message);
    }
}