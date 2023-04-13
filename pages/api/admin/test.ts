import { SimpleMessageResponse } from "../../../systems/classes/utility_classes";
import resend_receipt, { ResendReceiptResponse } from "../../../systems/methods/resend_receipt";

export default async function handler(req, res) {
    try {
        const charge_id = req.body.charge_id

        if (!charge_id) {
            
            res.status(500).send("No charge id provided");
            return
        }

        const resend_response: ResendReceiptResponse = await resend_receipt(charge_id)

        const response: SimpleMessageResponse = {
            status: 200,
            endpoint_called: `/api/admin/resend`,
            message: resend_response.already_existed ? `Receipt already existed, resent to ${resend_response.donation.donor.email}` : "Receipt generated and sent"
        }

        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/admin/resend`,
            message: e.message
        });
    }
};