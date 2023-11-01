import { ErroredResponse, FetchDonorResponse } from "../../../../lib/classes/api";
import { fetchDonor } from "../../../../lib/functions/donor";
import { verifyAtLeastOneParametersExists } from "../../../../lib/utils/helpers";

/**
 * @description Fetches a donors profile
 */
export default async function handler(req, res) {
    try {
        const { donor_id, donor_email } = req.body

        verifyAtLeastOneParametersExists("You must provide either a donor_id, donor_email, or both", donor_id, donor_email)

        const donor = await fetchDonor(donor_id, donor_email)

        return donor ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/profile/fetch`,
            donor: donor
        } as FetchDonorResponse) : new Error("Something went wrong fetching your donor profile.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/profile/fetch`,
            error: error.message
        } as ErroredResponse);
    }
};