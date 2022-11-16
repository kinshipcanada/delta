import { SimpleMessageResponse } from "../../../systems/classes/utility_classes";
import resend_receipt, { ResendReceiptResponse } from "../../../systems/functions/resend_receipt";

export default async function handler(req, res) {
    try {
        const donation_id = req.body.donation_id

        if (!donation_id) {
            res.status(500).send("No donation id provided");
            return
        }

        const resend_response: ResendReceiptResponse = await resend_receipt(donation_id)

        const response: SimpleMessageResponse = {
            status: 200,
            endpoint_called: `/backend/admin/resend`,
            message: resend_response.already_existed ? `Receipt already existed, resent to ${resend_response.donation.donor.email}` : "Receipt generated and sent"
        }

        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/backend/admin/resend`,
            message: e.message
        });
    }
};