import { Stripe } from "stripe"
import { z } from "zod";

export interface StripeTags {
    stripe_payment_intent_id?: string,
    stripe_charge_id?: string,
    stripe_balance_transaction_id?: string,
    stripe_customer_id?: string,
    stripe_payment_method_id?: string
}

export const StripeTagsSchema = z.object({
    stripe_payment_intent_id: z.string().optional(),
    stripe_charge_id: z.string().optional(),
    stripe_balance_transaction_id: z.string().optional(),
    stripe_customer_id: z.string().optional(),
    stripe_payment_method_id: z.string().optional(),
});

export interface RawStripeTransactionObject {
    payment_intent_object?: Stripe.PaymentIntent,
    charge_object?: Stripe.Charge,
    balance_transaction_object?: Stripe.BalanceTransaction,
    customer?: Stripe.Customer,
    payment_method?: Stripe.PaymentMethod
}

export function isRawStripeTransactionObject(obj: any): obj is RawStripeTransactionObject {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      obj.payment_intent_object !== null &&
      obj.charge_object !== null &&
      obj.balance_transaction_object !== null &&
      obj.customer !== null &&
      obj.payment_method !== null
    );
}

export const enum StripeMethods {
    fetchPaymentIntentObject = "fetch_payment_intent_object",
    fetchChargeObject = "fetch_charge_object",
    fetchBalanceTransactionObject = "fetch_balance_transaction_object",
    fetchSpecificPaymentMethod = "fetch_specific_payment_method",
    fetchCustomerObject = "fetch_customer_object"
}