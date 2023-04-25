import { ErroredResponse } from "../../../../system/classes/api";
import { DonationIdentifiers } from "../../../../system/classes/utils";
import { checkAndResendReceipt } from "../../../../system/functions/notifications";
import { verifyAtLeastOneParametersExists } from "../../../../system/utils/helpers";
import { SimpleMessageResponse } from "../../../../systems/classes/utility_classes";

/**
 * @description Resends a donation receipt to a donor, given the donation's identifiers
 */
export default async function handler(req, res) {
    try {
        const { donation_id, stripe_charge_id, stripe_payment_intent_id } = req.body

        verifyAtLeastOneParametersExists("No donation identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.", donation_id, stripe_charge_id, stripe_payment_intent_id)

        const identifiers: DonationIdentifiers = {
            donation_id: donation_id,
            stripe_charge_id: stripe_charge_id,
            stripe_payment_intent_id: stripe_payment_intent_id
        }

        const receiptResentResponse = await checkAndResendReceipt(identifiers);
        res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/donations/resend`,
            message: receiptResentResponse
        } as SimpleMessageResponse);
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/donations/resend`,
            error: "Error resending receipt."
        } as ErroredResponse);
    }
};