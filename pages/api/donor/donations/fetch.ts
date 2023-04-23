import { ErroredResponse } from "../../../../system/classes/api";
import { fetchAllDonationsForDonor } from "../../../../system/functions/donations";

/**
 * @description Fetches all donations for a given donor
 */
export default async function handler(req, res) {
    try {

        const { donorEmail } = req.body

        if (!donorEmail) {
            throw new Error("No donor email provided");
        }

        const donations = await fetchAllDonationsForDonor(donorEmail);
        return donations ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/donations/fetch`,
            donations: donations
        }) : new Error("Something went wrong fetching your donations.");

    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/donations/fetch`,
            error: error.message
        } as ErroredResponse);
    }
};