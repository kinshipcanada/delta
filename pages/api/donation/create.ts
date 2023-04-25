import { CreateDonationResponse, ErroredResponse } from "../../../system/classes/api";
import { DonationIdentifiers } from "../../../system/classes/utils";
import { createDonation } from "../../../system/functions/donations";
import { verifyAllParametersExist } from "../../../system/utils/helpers";

/**
 * @description Creates a new donation. Only to be called by Stripe's webhook
 */
export default async function handler(req, res) {
    try {
        const stripe_charge_id = req.body.data.object.id
        
        verifyAllParametersExist(`No stripe charge id provided. Object given was ${JSON.stringify(req.body.data.object)}`, stripe_charge_id)

        const donation = await createDonation({
            stripe_charge_id: stripe_charge_id
        } as DonationIdentifiers)

        return donation ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donation/create`,
            donation: donation
        } as CreateDonationResponse) : new Error("Something went wrong creating the donation.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donation/create`,
            error: error.message
        } as ErroredResponse);
    }
};