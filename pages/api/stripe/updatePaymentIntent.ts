import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { extractStripePaymentIntentFromClientSecret } from '../../../lib/utils/helpers';
import { posthogLogger } from '@lib/posthog-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        const { clientSecret } = req.body;

        // Extract payment intent id from client secret
        const paymentIntentId = extractStripePaymentIntentFromClientSecret(clientSecret);

        await stripe.paymentIntents.update(
            paymentIntentId,
            { payment_method_options: { 
                card: {
                    setup_future_usage: 'off_session'
                },
                acss_debit: {
                    setup_future_usage: 'off_session'
                }
            }}
        );

        res.send({
            status: 200
        });
    } catch (error) {
        posthogLogger(error)
        res.status(500).json({ status: 500 });
    }
}
