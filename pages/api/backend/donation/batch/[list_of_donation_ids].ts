import { KinshipError } from "../../../../../systems/classes/errors/KinshipError"
import { BatchedDonationResponse, SimpleMessageResponse } from "../../../../../systems/classes/interfaces"
import fetch_donation from "../../../../../systems/functions/fetch_donation"

export default async function handler(req, res) {
    const { list_of_donation_ids } = req.query.split(',')

    try {

        let donations = []

        for (const donation_id of list_of_donation_ids) {
            donations.push(fetch_donation(donation_id))
        }

        await Promise.all(donations).then((donations_object)=>{
            const successful_response: BatchedDonationResponse = {
                status: 200,
                endpoint_called: `/donation/batch/${req.params.list_of_donation_ids}`,
                donations: donations_object
            }
            return res.status(200).send(successful_response);
        }).catch((error)=>{
            const error_response: SimpleMessageResponse = {
                status: 500,
                endpoint_called: `/donation/batch/${req.params.list_of_donation_ids}`,
                message: error.message
            }
            return res.status(500).send(error_response);
        })

    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/src/api/router", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};