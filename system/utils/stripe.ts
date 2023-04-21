import { Stripe } from "stripe";
import { Cart } from "../classes/cart";
import { Donation } from "../classes/donation";
import { Donor } from "../classes/donor";
import { DeliveryMethod, UserNotificationType } from "../classes/notifications";
import { CountryList, DonationIdentifiers } from "../classes/utils";
import { RawStripeTransactionObject, StripeMethods, StripeTags } from "../classes/stripe";
import { Address } from "../classes/address";
import { _convertKinshipAddressToStripeAddress } from "./formatting";

const StripeClient = require('stripe');
const dotenv = require('dotenv')
dotenv.config();

const stripe_client = StripeClient(process.env.STRIPE_SECRET_KEY);

/**
 * 
 * @section functions to fetch data from stripe
 */

export async function fetchStripeObject(identifier: string, method: StripeMethods): Promise<any> {
    switch (method) {
        case StripeMethods.fetchPaymentIntentObject:
            return fetchStripePaymentIntentObject(identifier);
        case StripeMethods.fetchChargeObject:
            return fetchStripeChargeObject(identifier);
        case StripeMethods.fetchBalanceTransactionObject:
            return fetchStripeBalanceTransactionObject(identifier);
        case StripeMethods.fetchSpecificPaymentMethod:
            return fetchSpecificStripePaymentMethod(identifier);
        case StripeMethods.fetchCustomerObject:
            return fetchStripeCustomerObject(identifier);
        default:
            throw new Error('Invalid method provided to fetchStripeObject');
    }
}

export async function fetchStripeChargeObject(charge_id: string) : Promise<Stripe.Charge> {
    return stripe_client.charges.retrieve(charge_id)
}

export async function fetchStripePaymentIntentObject(payment_intent_id: string) : Promise<Stripe.PaymentIntent> {
    return stripe_client.paymentIntents.retrieve(payment_intent_id)
}

export async function fetchStripeBalanceTransactionObject(balance_transaction_id: string) : Promise<Stripe.BalanceTransaction>  {
    return stripe_client.balanceTransactions.retrieve(balance_transaction_id)
}

export async function fetchStripeCustomerObject(stripe_customer_id: string) : Promise<Stripe.Customer> {
    return stripe_client.customers.retrieve(stripe_customer_id) as Promise<Stripe.Customer>
}

export async function fetchSpecificStripePaymentMethod(payment_method_id: string) : Promise<Stripe.PaymentMethod>  {
    return stripe_client.paymentMethods.retrieve(payment_method_id) as Promise<Stripe.PaymentMethod>
}

export async function fetchStripeCustomerPaymentMethods(stripe_customer_id: string) {
    return stripe_client.paymentMethods.list(
        stripe_customer_id,
    )
}

export async function fetchFullDonationFromStripe(identifiers: DonationIdentifiers): Promise<RawStripeTransactionObject> {
    let rawStripeTransactionObject: RawStripeTransactionObject = {
        payment_intent_object: null,
        charge_object: null,
        balance_transaction_object: null,
        customer: null,
        payment_method: null
    }

    let stripePromises = []
    let { stripe_payment_intent_id, stripe_charge_id } = identifiers

    if (!stripe_payment_intent_id && !stripe_charge_id) {
        throw new Error('No payment intent or charge id provided to fetchFullDonationFromStripe')
    }

    if (stripe_payment_intent_id) {
        rawStripeTransactionObject.payment_intent_object = await fetchStripePaymentIntentObject(stripe_payment_intent_id)
        rawStripeTransactionObject.charge_object = await fetchStripeChargeObject(rawStripeTransactionObject.payment_intent_object.charges.data[0].id)
    } else {
        rawStripeTransactionObject.charge_object = await fetchStripeChargeObject(stripe_charge_id)
        rawStripeTransactionObject.payment_intent_object = await fetchStripePaymentIntentObject(rawStripeTransactionObject.charge_object.payment_intent as string)
    }

    console.log(rawStripeTransactionObject)



    return 
}

export async function createStripeCustomer(
    email: string,
    donorId: string,
    firstName: string,
    lastName: string,
    address: Address,
) {
    return await stripe_client.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: {
            user_id: donorId,
            first_name: firstName,
            last_name: lastName,
        },
        address: _convertKinshipAddressToStripeAddress(address)
    })
}

