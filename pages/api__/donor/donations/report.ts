import { Donor } from "../../../../systems/classes/donors/Donor";
import { KinshipError } from "../../../../systems/classes/errors/KinshipError";
import { DonationSummaryResponse, SimpleMessageResponse, NotificationType } from "../../../../systems/classes/utility_classes";
import { KinshipNotification } from "../../../../systems/classes/notifications/Notification";
import create_summary_statement from "../../../../systems/methods/create_summary_statement";
import fetch_donations_from_params from "../../../../systems/methods/fetch_donations_from_params";

export default async function handler(req, res) {

    const user_email = req.body.user_email
    const send_as_email = req.body.send_as_email

    try {

        fetch_donations_from_params(false, { email: user_email.user_email }).then((donations)=>{
            const summary = create_summary_statement(donations)

            const successful_response: DonationSummaryResponse = {
                status: 200,
                endpoint_called: `/donor/donations/report`,
                summary: summary
            }

            if (send_as_email) {
                // const donor = new Donor()
                // const notification = new KinshipNotification(NotificationType.REPORT_GENERATED, )
                console.log("to implement")
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