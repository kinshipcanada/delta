import { KinshipError } from "../../../../systems/classes/errors/KinshipError";
import { BatchedSimpleDonationResponse, SimpleMessageResponse } from "../../../../systems/classes/utility_classes";
import fetch_donations_from_params from "../../../../systems/functions/fetch_donations_from_params";

export default async function handler(req, res) {

    const user_email = req.body.user_email

    try {
        fetch_donations_from_params(true, null, null, null, null, user_email).then((donations)=>{
            const successful_response: BatchedSimpleDonationResponse = {
                status: 200,
                endpoint_called: `/donor/donations/fetch`,
                donations: donations
            }

            return res.status(200).send(successful_response);
        }).catch((error)=>{
            const error_response: SimpleMessageResponse = {
                status: 500,
                endpoint_called: `/donor/donations/fetch`,
                message: error.message
            }
            return res.status(500).send(error_response);
        })
    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/src/api/router", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};