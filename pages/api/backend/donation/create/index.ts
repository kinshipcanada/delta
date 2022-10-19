import { SimpleMessageResponse } from "../../../../../systems/classes/interfaces";

export default async function handler(req, res) {
    try {
        const api_response: SimpleMessageResponse = {
            status: 200,
            endpoint_called: "/api/backend/donation/create",
            message: "Please provide a donation id to create a donation. The correct path is /api/backend/donation/create/[donation_id]."
        }
        
        res.status(200).send(api_response);
    } catch (e) {
        res.status(500).send(e.message);
    }
};