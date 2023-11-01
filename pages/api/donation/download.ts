import { ErroredResponse } from "../../../lib/classes/api";
/**
 * @description Creates a PDF of a donation receipt, and returns it to the frontend
 */
export default async function handler(req, res) {
    res.status(500).send({
        status: 500,
        endpoint_called: `/api/donation/download`,
        error: 'Method has not been implemented yet.'
    } as ErroredResponse);
};