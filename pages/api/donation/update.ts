import { ErroredResponse } from "../../../system/classes/api";
/**
 * @description Updates a donations details. Heavily restricted, and only to be used by the admin panel.
 */
export default async function handler(req, res) {
    res.status(500).send({
        status: 500,
        endpoint_called: `/api/donation/update`,
        error: 'Method has not been implemented yet.'
    } as ErroredResponse);
};