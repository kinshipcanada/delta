import { ObjectIdApiResponse } from "@lib/classes/api";
import { Donation } from "@lib/classes/donation";
import { createDonation } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

/**
 * @description Creates a new donation. Only to be called by Stripe's webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        let event = req.body

        console.log('creating donation')
        const donation: Donation = await createDonation({
            stripe_charge_id: event.data.object.id
        })
        console.log('created donation successfully')

        const response: ObjectIdApiResponse = { data: donation.identifiers.donation_id }
        return res.status(200).send(response)
    } catch (error) {
        // Log error
        console.error('error creating donation', error)

        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
            donation: undefined
        })
    }
}