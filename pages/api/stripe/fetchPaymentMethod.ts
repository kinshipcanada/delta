import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        const { paymentMethodId } = req.body;

        // Extract payment intent id from client secret
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

        res.send({
            status: 200,
            payment_method: paymentMethod
        });
    } catch (error) {
        console.error(error)
        // Implement: log error here
        res.status(500).json({ status: 500 });
    }
}
