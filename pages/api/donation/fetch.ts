import { FetchDonationResponse, ErroredResponse } from "../../../system/classes/api";
import { Donation } from "../../../system/classes/donation";
import { DonationIdentifiers } from "../../../system/classes/utils";
import { fetchDonation } from "../../../system/functions/donations";
import { generateIdentifiersFromStrings, verifyAllParametersExist } from "../../../system/utils/helpers";

/**
 * @description Fetches a single donation. To fetch a number of donations, use a donor's email address and the api/donor/donations/fetch endpoint
 */
export default async function handler(req, res) {
    try {
        const { donation_id } = req.body
        
        verifyAllParametersExist(`No donation_id provided. You must pass either a Kinship ID, Stripe charge id, or Stripe payment intent id.`, donation_id)

        const identifiers: DonationIdentifiers = generateIdentifiersFromStrings([donation_id])
        const donation: Donation = await fetchDonation(identifiers)

        return donation ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donation/fetch`,
            donation: donation
        } as FetchDonationResponse) : new Error("Something went wrong creating the donation.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donation/fetch`,
            error: error.message
        } as ErroredResponse);
    }
};