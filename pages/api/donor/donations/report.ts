import { KinshipError } from "../../../../systems/classes/errors/KinshipError";
import { DonationSummaryResponse, SimpleMessageResponse } from "../../../../systems/classes/interfaces";
import create_summary_statement from "../../../../systems/functions/create_summary_statement";
import fetch_donations_from_params from "../../../../systems/functions/fetch_donations_from_params";

export default async function handler(req, res) {

    const user_email = req.body.user_email

    try {

        fetch_donations_from_params(false, null, null, null, null, user_email.user_email).then((donations)=>{
            const summary = create_summary_statement(donations)

            const successful_response: DonationSummaryResponse = {
                status: 200,
                endpoint_called: `/donor/donations/report`,
                summary: summary
            }

            return res.status(200).send(successful_response);
        }).catch((error)=>{
            const error_response: SimpleMessageResponse = {
                status: 500,
                endpoint_called: `/donor/donations/report`,
                message: error.message
            }
            return res.status(500).send(error_response);
        })
    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/src/api/router", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};