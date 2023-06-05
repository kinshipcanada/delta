import { ErroredResponse } from "../../../system/classes/api";
/**
 * @description Fetches all donations for a given donor
 */
export default async function handler(req, res) {
    res.status(500).send({
        status: 500,
        endpoint_called: `/api/donation/createManually`,
        error: 'Method has not been implemented yet.'
    } as ErroredResponse);
};