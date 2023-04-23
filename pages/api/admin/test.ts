import { ErroredResponse, FetchDonorResponse } from "../../../system/classes/api";
import { fetchDonor } from "../../../system/functions/donor";
import { fetchFullDonationFromStripe } from "../../../system/utils/stripe";
import { DonorResponse, SimpleMessageResponse } from "../../../systems/classes/utility_classes";
import resend_receipt, { ResendReceiptResponse } from "../../../systems/methods/resend_receipt";

export default async function handler(req, res) {
    try {
        const donor_id = req.body.donor_id

        if (!donor_id) {
            res.status(500).send("No donor id provided");
            return
        }

        const donorResponse: FetchDonorResponse | ErroredResponse = await fetchDonor(donor_id);

        res.status(200).send(donorResponse);
    } catch (e) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/admin/resend`,
            message: e.message
        });
    }
};