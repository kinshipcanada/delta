import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { isDonation } from '../../../lib/classes/donation';
import { isDonor } from '../../../lib/classes/donor';
import { createStripeCustomerIfNotExists } from '../../../lib/utils/stripe';
import { convertChildrenToStrings } from '../../../lib/utils/helpers';
import { StripeCreatePaymentIntentResponse } from '../../../lib/classes/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        const { donation } = req.body;

        if (!isDonation(donation)) {
            throw new Error("Invalid donation object");
        }

        if (!donation.donor || !isDonor(donation.donor)) {
            throw new Error("Invalid donor object attached to donation object")
        }

        let stripeCustomerId: string;

        if (donation.donor.stripe_customer_ids.length > 0) {
            // Get the first stripe customer id to use for this donor
            stripeCustomerId = donation.donor.stripe_customer_ids[0]
        } else {
            // If there is no created customer_id, see if we can fetch one from stripe, otherwise create one.
            // We have to do this, because we can't attach a billing address or customer objects directly to Stripe payment intents, just the id as a string
            stripeCustomerId = await createStripeCustomerIfNotExists(donation.donor)
        }


        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(donation.amount_in_cents.toString()),
            // Causes is added here for backwards compatability
            metadata: { ...convertChildrenToStrings({ ...donation }), causes: JSON.stringify([]) },
            customer: stripeCustomerId,
            currency: 'cad',
            receipt_email: donation.donor.email,
            payment_method_types: ['acss_debit', 'card'],
            payment_method_options: {
                acss_debit: {
                    mandate_options: {
                        // IMPLEMENT: UPDAET THIS IF SAVE PAYMNET METHOD
                        payment_schedule: 'sporadic',
                        transaction_type: 'personal',
                    },
                },
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            message: undefined
        } as StripeCreatePaymentIntentResponse);
    } catch (error) {
        console.error(error)
        // Log error
        res.status(500).json({ message: "Sorry, something went wrong on our end", clientSecret: undefined } as StripeCreatePaymentIntentResponse);
    }
}
