import Stripe from 'stripe';
import { DonationSchema } from '../../../lib/classes/donation';
import { createStripeCustomerIfNotExists } from '../../../lib/utils/stripe';
import { convertChildrenToStrings } from '../../../lib/utils/helpers';
import { ObjectIdApiResponse } from '@lib/classes/api';
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    donation: DonationSchema,
})

export type ApiStripeCreatePaymentIntentRequestSchema = z.infer<typeof requestSchema>

/**
 * @description Fetches a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    const parsedRequest = requestSchema.safeParse(req.body);

    if (!parsedRequest.success) {
        const response: ObjectIdApiResponse = { error: 'Invalid payload' }
        return res.status(400).send(response);
    }

    try {

        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        let stripeCustomerId: string;

        if (parsedRequest.data.donation.donor.stripe_customer_ids.length > 0) {
            // Get the first stripe customer id to use for this donor
            stripeCustomerId = parsedRequest.data.donation.donor.stripe_customer_ids[0]
        } else {
            // If there is no created customer_id, see if we can fetch one from stripe, otherwise create one.
            // We have to do this, because we can't attach a billing address or customer objects directly to Stripe payment intents, just the id as a string
            stripeCustomerId = await createStripeCustomerIfNotExists(parsedRequest.data.donation.donor)
        }

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: parseInt(parsedRequest.data.donation.amount_in_cents.toString()),
            // Causes is added here for backwards compatability
            metadata: { ...convertChildrenToStrings({ ...parsedRequest.data.donation }), causes: JSON.stringify([]) },
            customer: stripeCustomerId,
            currency: 'cad',
            receipt_email: parsedRequest.data.donation.donor.email,
            payment_method_types: ['acss_debit', 'card'],
            payment_method_options: {
                acss_debit: {
                    mandate_options: {
                        payment_schedule: 'sporadic',
                        transaction_type: 'personal',
                    },
                },
            },
        });

        if (!paymentIntent.client_secret) {
            throw new Error("No client secret returned")
        }

        const response: ObjectIdApiResponse = {
            data: paymentIntent.client_secret
        }
        res.status(200).send(response);
    } catch (error) {
        // Log error
        console.error(error, "error creating payment intent")
        
        const response: ObjectIdApiResponse = { error: "Sorry, something went wrong on our end" }
        res.status(500).json(response);
    }
}