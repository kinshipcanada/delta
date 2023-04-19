import { Stripe } from "stripe"

export interface StripeTags {
    payment_intent_id?: string,
    charge_id?: string,
    balance_transaction_id?: string,
    customer_id?: string,
    payment_method_id?: string
}

export interface RawStripeTransactionObject {
    payment_intent_object: Stripe.PaymentIntent,
    charge_object: Stripe.Charge,
    balance_transaction_object: Stripe.BalanceTransaction,
    customer: Stripe.Customer,
    payment_method: Stripe.PaymentMethod
}