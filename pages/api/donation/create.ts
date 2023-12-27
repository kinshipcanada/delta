import { ObjectIdApiResponse } from "@lib/classes/api";
import { createDonation2 } from "@lib/functions/donations";
import { Donation } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @description Creates a new donation. Only to be called by Stripe's webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        let event = req.body

        const donation: Donation = await createDonation2({
            stripe_charge_id: event.data.object.id
        })

        const response: ObjectIdApiResponse = { data: donation.id }
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