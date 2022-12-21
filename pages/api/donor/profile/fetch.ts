import { KinshipError } from "../../../../systems/classes/errors/KinshipError";
import { DonorResponse, SimpleMessageResponse } from "../../../../systems/classes/utility_classes";
import fetch_donor from "../../../../systems/methods/fetch_donor";

export default async function handler(req, res) {
    const user_id = req.body.user_id

    try {
        fetch_donor(user_id).then((donor_object)=>{
            const successful_response: DonorResponse = {
                status: 200,
                endpoint_called: `/donor/profile/fetch`,
                donor: donor_object
            }
            return res.status(200).send(successful_response);
        }).catch((error)=>{
            const error_response: SimpleMessageResponse = {
                status: 500,
                endpoint_called: `/donor/profile/fetch`,
                message: error.message
            }
            return res.status(500).send(error_response);
        })
    } catch (error) {
        new KinshipError(`Error in api request : ${JSON.stringify(error)}`, "/src/api/router", "api_router.get('/fetch_donation')", true)
        res.status(500).send(error.message);
    }
};