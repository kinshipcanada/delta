import { KinshipError } from "../../../systems/classes/errors/KinshipError";
import { DonationResponse, BatchedDonationResponse, SimpleMessageResponse } from "../../../systems/classes/utility_classes";
import fetch_donation from "../../../systems/methods/fetch_donation";

export default async function handler(req, res) {
    const donation_id = req.body.donation_id
    const donation_ids = req.body.donation_ids

    if (!donation_id && !donation_ids) {
        const error_response: SimpleMessageResponse = {
            status: 500,
            endpoint_called: `/donation/fetch`,
            message: "No donation_id or donation_ids provided"
        }
        return res.status(500).send(error_response);
    }

    try {
        if (donation_id) {
            fetch_donation(donation_id).then((donation_object)=>{
                const successful_response: DonationResponse = {
                    status: 200,
                    endpoint_called: `/donation/fetch`,
                    donation: donation_object
                }
                return res.status(200).send(successful_response);
            }).catch((error)=>{
                const error_response: SimpleMessageResponse = {
                    status: 500,
                    endpoint_called: `/donation/fetch`,
                    message: error.message
                }
                return res.status(500).send(error_response);
            })
        } else {
            let donation_promises = []

            for (const donation_id of donation_ids) {
                donation_promises.push(fetch_donation(donation_id))
            }

            Promise.all(donation_promises).then((donation_objects)=>{
                const successful_response: BatchedDonationResponse = {
                    status: 200,
                    endpoint_called: `/donation/fetch`,
                    donations: donation_objects
                }

                return res.status(200).send(successful_response);
            }).catch((error)=>{
                const error_response: SimpleMessageResponse = {
                    status: 500,
                    endpoint_called: `/donation/fetch`,
                    message: error.message
                }
                return res.status(500).send(error_response);
            })
        }
    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/pages/api/donation/fetch.ts", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};