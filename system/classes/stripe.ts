import { Stripe } from "stripe"

export interface StripeTags {
    stripe_payment_intent_id?: string,
    stripe_charge_id?: string,
    stripe_balance_transaction_id?: string,
    stripe_customer_id?: string,
    stripe_payment_method_id?: string
}

export interface RawStripeTransactionObject {
    payment_intent_object: Stripe.PaymentIntent,
    charge_object: Stripe.Charge,
    balance_transaction_object: Stripe.BalanceTransaction,
    customer: Stripe.Customer,
    payment_method: Stripe.PaymentMethod
}