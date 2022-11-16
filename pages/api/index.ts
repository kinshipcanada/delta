import { SimpleMessageResponse } from "../../systems/classes/interfaces";
import { SimpleMessageResponse } from "../../systems/classes/utility_classes";
export default async function handler(req, res) {
    try {
        const api_response: SimpleMessageResponse = {
            status: 200,
            endpoint_called: "/",
            message: "Welcome to the Kinship Canada API. We're open source, check out our GitHub here: https://github.com/kinshipcanada/systems"
        }
        
        res.status(200).send(api_response);
    } catch (e) {
        res.status(500).send(e.message);
    }
};