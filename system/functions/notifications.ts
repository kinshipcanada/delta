import { ErroredResponse, MessageResponse } from "../classes/api";
import { DeliveryMethod, UserNotificationType } from "../classes/notifications";
import { DonationIdentifiers } from "../classes/utils";
import { fetchDonationFromDatabase } from "../utils/database";
import { formatDonationFromRawStripeData, formatDonationFromDatabase } from "../utils/formatting";
import { sendNotification } from "../utils/notifications";
import { fetchFullDonationFromStripe } from "../utils/stripe";

export async function checkAndResendReceipt(identifiers: DonationIdentifiers): Promise<MessageResponse> {
    if (
        identifiers.donation_id == null &&
        identifiers.stripe_charge_id == null &&
        identifiers.stripe_payment_intent_id == null
    ) {
        throw new Error("No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.")
    }

    try {
        const donation = formatDonationFromDatabase(await fetchDonationFromDatabase(identifiers))

        if (donation) {
            await sendNotification(
                UserNotificationType.DONATION_MADE,
                donation,
                DeliveryMethod.EMAIL,
            )

            return {
                status: 200,
                endpoint_called: 'checkAndResendReceipt',
                message: `Successfully resent receipt of donation to ${donation.donor.email}`
            }
        } else {
            const donation = await formatDonationFromRawStripeData(await fetchFullDonationFromStripe(identifiers))
            await sendNotification(
                UserNotificationType.DONATION_MADE,
                donation,
                DeliveryMethod.EMAIL,
            )

            return {
                status: 200,
                endpoint_called: 'checkAndResendReceipt',
                message: `Successfully generated and sent receipt of donation to ${donation.donor.email}`
            }
        }
    } catch (error) {
        throw new Error(error);
    }
}

