import { Elements } from "@stripe/react-stripe-js";
import { Stripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

const StripeWrapper: React.FC<{ children: ReactNode, stripeClientSecret: string, stripeClientPromise: Stripe | PromiseLike<Stripe> }> = ({ children, stripeClientSecret, stripeClientPromise }) => (
    <Elements options={{
        appearance: { 'theme': 'stripe' },
        clientSecret: stripeClientSecret,
    }} stripe={stripeClientPromise}>
        { children }
    </Elements>
);

export default StripeWrapper