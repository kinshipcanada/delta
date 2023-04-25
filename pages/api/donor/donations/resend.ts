import { ErroredResponse } from "../../../../system/classes/api";
import { DonationIdentifiers } from "../../../../system/classes/utils";
import { fetchAllDonationsForDonor } from "../../../../system/functions/donations";
import { checkAndResendReceipt } from "../../../../system/functions/notifications";

/**
 * @description Resends a donation receipt to a donor, given the donation's identifiers
 */
export default async function handler(req, res) {
    try {
        const { donation_id, stripe_charge_id, stripe_payment_intent_id } = req.body

        if (!donation_id && !stripe_charge_id && !stripe_payment_intent_id) {
            throw new Error("No donation identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.");
        }

        const identifiers: DonationIdentifiers = {
            donation_id: donation_id,
            stripe_charge_id: stripe_charge_id,
            stripe_payment_intent_id: stripe_payment_intent_id
        }

        const receiptResentResponse = await checkAndResendReceipt(identifiers);
        res.status(200).send(receiptResentResponse);
        return;
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/donations/resend`,
            error: "Error resending receipt."
        } as ErroredResponse);
    }
};