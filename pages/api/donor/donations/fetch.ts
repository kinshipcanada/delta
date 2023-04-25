import { ErroredResponse, FetchGroupOfDonationsResponse } from "../../../../system/classes/api";
import { Donation } from "../../../../system/classes/donation";
import { fetchAllDonationsForDonor } from "../../../../system/functions/donations";
import { verifyAllParametersExist } from "../../../../system/utils/helpers";

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