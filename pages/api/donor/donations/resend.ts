import { KinshipError } from "../../../../systems/classes/errors/KinshipError";
import { DonationResponse, SimpleMessageResponse } from "../../../../systems/classes/utility_classes";
import fetch_donation from "../../../../systems/functions/fetch_donation";

export default async function handler(req, res) {
    const donation_id = req.body.donation_id

    try {
        fetch_donation(donation_id).then((donation_object)=>{
            const successful_response: DonationResponse = {
                status: 200,
                endpoint_called: `/backend/donation/${donation_id}`,
                donation: donation_object
            }
            return res.status(200).send(successful_response);
        }).catch((error)=>{
            const error_response: SimpleMessageResponse = {
                status: 500,
                endpoint_called: `/backend/donation/${donation_id}`,
                message: error.message
            }
            return res.status(500).send(error_response);
        })
    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/src/api/router", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};