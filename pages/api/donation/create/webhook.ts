import { Donation } from "@lib/classes/donation";
import { createDonation } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { z } from "zod";

export const responseSchema = z.object({
    donation_id: z.string().optional(),
    error: z.string().optional()
})

/**
 * @description Creates a new donation. Only to be called by Stripe's webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const endpointSecret = process.env.STRIPE_CREATE_DONATION_ENDPOINT_SECRET

        if (!endpointSecret) {
            return res.status(400).send({
                error: 'Internal error: No webhook secret',
                donation_id: undefined
            });
        }

        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        const signature = req.headers['stripe-signature'] as string;

        let event = req.body
        
        try {
            event = stripeClient.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            return res.status(400).send({
                error: 'Internal error: invalid webhook signature',
                donation_id: undefined
            });
        }

        const donation: Donation = await createDonation({
            stripe_charge_id: event.data.object.id
        })

        return res.status(200).send({
            donation_id: donation.identifiers.donation_id,
            error: undefined
        })
    } catch (error) {
        // Log error

        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
            donation: undefined
        })
    }
}