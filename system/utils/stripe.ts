import { Stripe } from "stripe";
import { DonationIdentifiers } from "../classes/utils";
import { RawStripeTransactionObject, StripeMethods } from "../classes/stripe";
import { Address } from "../classes/address";
import { _convertKinshipAddressToStripeAddress } from "./formatting";
import { Donor } from "../classes/donor";

const dotenv = require('dotenv')
dotenv.config();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16"
})

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
    return stripeClient.charges.retrieve(charge_id)
}

export async function fetchStripePaymentIntentObject(payment_intent_id: string) : Promise<Stripe.PaymentIntent> {
    return stripeClient.paymentIntents.retrieve(payment_intent_id)
}

export async function fetchStripeBalanceTransactionObject(balance_transaction_id: string) : Promise<Stripe.BalanceTransaction>  {
    return stripeClient.balanceTransactions.retrieve(balance_transaction_id)
}

export async function fetchStripeCustomerObject(stripe_customer_id: string) : Promise<Stripe.Customer> {
    return stripeClient.customers.retrieve(stripe_customer_id) as Promise<Stripe.Customer>
}

export async function fetchSpecificStripePaymentMethod(payment_method_id: string) : Promise<Stripe.PaymentMethod>  {
    return stripeClient.paymentMethods.retrieve(payment_method_id) as Promise<Stripe.PaymentMethod>
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
        rawStripeTransactionObject.charge_object = await fetchStripeChargeObject(typeof (rawStripeTransactionObject.payment_intent_object.latest_charge) == "string" ? rawStripeTransactionObject.payment_intent_object.latest_charge : rawStripeTransactionObject.payment_intent_object.latest_charge.id)
    } else {
        rawStripeTransactionObject.charge_object = await fetchStripeChargeObject(stripe_charge_id)
        rawStripeTransactionObject.payment_intent_object = await fetchStripePaymentIntentObject(rawStripeTransactionObject.charge_object.payment_intent as string)
    }

    identifiers.stripe_balance_transaction_id = rawStripeTransactionObject.charge_object.balance_transaction as string
    identifiers.stripe_customer_id = rawStripeTransactionObject.charge_object.customer as string
    identifiers.stripe_payment_method_id = rawStripeTransactionObject.charge_object.payment_method as string

    stripePromises.push(fetchStripeBalanceTransactionObject(rawStripeTransactionObject.charge_object.balance_transaction as string))
    stripePromises.push(fetchSpecificStripePaymentMethod(rawStripeTransactionObject.charge_object.payment_method as string))
    stripePromises.push(fetchStripeCustomerObject(rawStripeTransactionObject.charge_object.customer as string))
    

    const stripeResults = await Promise.all(stripePromises)

    for (const result of stripeResults) {
        if (result.object == 'balance_transaction') {
            rawStripeTransactionObject.balance_transaction_object = result
        }

        if (result.object == 'customer') {
            rawStripeTransactionObject.customer = result
        }

        if (result.object == 'payment_method') {
            rawStripeTransactionObject.payment_method = result
        }
    }

    return rawStripeTransactionObject
}

export async function createStripeCustomer(
    email: string,
    donorId: string,
    firstName: string,
    lastName: string,
    address: Address,
): Promise<Stripe.Customer> {
    return await stripeClient.customers.create({
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

export async function fetchStripeCustomerFromEmail(email: string) {
    const donors = await stripeClient.customers.list({
        limit: 1,
        email: email.toLowerCase()
    });

    const [firstAvailableStripeProfile] = donors.data

    return firstAvailableStripeProfile
}

// Implement
export async function updateStripeCustomerWithId() {}

export async function createStripeCustomerIfNotExists(donor: Donor): Promise<string> {
    const existingProfile = await fetchStripeCustomerFromEmail(donor.email)

    if (existingProfile) { 
        return existingProfile.id;
    }

    // Create a new profile from the donor if there is none
    const createdStripeCustomer = await createStripeCustomer(donor.email, donor.donor_id, donor.first_name, donor.last_name, donor.address)

    return createdStripeCustomer.id
}