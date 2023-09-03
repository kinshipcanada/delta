import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { isDonation } from '../../../system/classes/donation';
import { isDonor } from '../../../system/classes/donor';
import { createStripeCustomerIfNotExists } from '../../../system/utils/stripe';
import { convertChildrenToStrings } from '../../../system/utils/helpers';
import { StripeCreatePaymentIntentResponse } from '../../../system/classes/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
            // Implement save this payment method, and recurring billing
            // setup_future_usage: {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            status: 200,
            clientSecret: paymentIntent.client_secret,
            message: null
        } as StripeCreatePaymentIntentResponse);
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message, clientSecret: null } as StripeCreatePaymentIntentResponse);
    }
}
