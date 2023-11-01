import { ErroredResponse, FetchGroupOfDonationsResponse } from "../../../../lib/classes/api";
import { Donation } from "../../../../lib/classes/donation";
import { fetchAllDonationsForDonor } from "../../../../lib/functions/donations";
import { verifyAllParametersExist } from "../../../../lib/utils/helpers";

/**
 * @description Fetches all donations for a given donor
 */
export default async function handler(req, res) {
    try {
        const { donor_email } = req.body

        verifyAllParametersExist("No donor email provided", donor_email)

        const donations: Donation[] = await fetchAllDonationsForDonor(donor_email);

        return donations ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/donations/fetch`,
            donations: donations
        } as FetchGroupOfDonationsResponse) : new Error("Something went wrong fetching your donations.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/donations/fetch`,
            error: error.message
        } as ErroredResponse);
    }
};