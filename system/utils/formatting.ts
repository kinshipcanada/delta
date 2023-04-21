import { Stripe } from "stripe";
import { Address } from "../classes/address";
import { Cart, CauseMap } from "../classes/cart";
import { Donation } from "../classes/donation";
import { Donor } from "../classes/donor";
import { RawStripeTransactionObject } from "../classes/stripe";
import { CurrencyList } from "../classes/utils";
import { DatabaseTable } from "../utils/constants";
import { parameterizedDatabaseQuery } from "./database";

export function formatDonationForDatabase(donation: Donation): object {
    throw new Error("Not implemented")
}

export function formatCartForDatabase(donation: Donation): object {
    throw new Error("Not implemented")
}

export function formatDonorFromDatabase(donor: any): Donor {
    throw new Error("Not implemented")
}

export function formatDonationFromDatabase(donation: any): Donation {
    return
}

export function formatDonationFromRawStripeObject(stripeObject: RawStripeTransactionObject): Donation {
    throw new Error("Not implemented")
}

export async function buildDonationFromRawStripeData(rawStripeObject: RawStripeTransactionObject): Promise<Donation> {

    const donorFromDatabase = await parameterizedDatabaseQuery(DatabaseTable.DONOR_PROFILES, {
        email: rawStripeObject.customer.email
    }, true); // Fetch donor from database using their email, if it exists.

    const donor: Donor = {
        donor_id: donorFromDatabase ? donorFromDatabase.id : null,
        first_name: rawStripeObject.charge_object.metadata.first_name ? rawStripeObject.charge_object.metadata.first_name : rawStripeObject.customer.name.split(' ')[0] as string,
        last_name: rawStripeObject.charge_object.metadata.last_name ? rawStripeObject.charge_object.metadata.last_name : rawStripeObject.customer.name.split(' ')[1] as string,
        email: rawStripeObject.customer.email,
        phone_number: parseInt(rawStripeObject.customer.phone),
        address: {
            line_address: rawStripeObject.customer.address.line1,
            postal_code: rawStripeObject.customer.address.postal_code,
            city: rawStripeObject.customer.address.city,
            state: rawStripeObject.customer.address.state,
            country: rawStripeObject.customer.address.country
        },
        stripe_customer_ids: [
            rawStripeObject.customer.id
        ]
    }

    const donation: Donation = { 
        identifiers: {
            donation_id: _getDonationIdFromStripeMetadata(rawStripeObject.charge_object),
            donor_id: donor.donor_id,
            stripe_payment_intent_id: rawStripeObject.charge_object.payment_intent as string,
            stripe_charge_id: rawStripeObject.charge_object.id as string,
            stripe_balance_transaction_id: rawStripeObject.charge_object.balance_transaction as string,
            stripe_customer_id: rawStripeObject.customer.id as string,
            stripe_payment_method_id: rawStripeObject.payment_method.id as string
        },
        donor: donor,
        causes: _buildCartFromStripeMetadata(rawStripeObject.charge_object),
        live: rawStripeObject.charge_object.livemode,
        amount_in_cents: rawStripeObject.charge_object.amount_captured,
        fees_covered: rawStripeObject.charge_object.metadata ? parseInt(rawStripeObject.charge_object.metadata.fees_covered) : 0,
        fees_charged_by_stripe: rawStripeObject.balance_transaction_object.fee,
        date_donated: new Date(rawStripeObject.charge_object.created * 1000)
    }

    return donation;

}

function _buildCartFromStripeMetadata(stripeChargeObject: Stripe.Charge): Cart {
    if (stripeChargeObject.metadata === null || stripeChargeObject.metadata === undefined || stripeChargeObject.metadata.causes === undefined || stripeChargeObject.metadata.causes === null) {
        throw new Error("Stripe charge object does not have metadata or metadata.causes");
    }

    let total = 0;
    let causes: CauseMap = {};

    for (const key of Object.keys(stripeChargeObject.metadata.causes)) {
        total += parseInt(stripeChargeObject.metadata.causes[key]);
        causes[key] = parseInt(stripeChargeObject.metadata.causes[key]);
    }

    return {
        total_amount_paid_in_cents: total,
        currency: stripeChargeObject.currency as CurrencyList,
        causes: causes
    }
}

function _getDonationIdFromStripeMetadata(stripeChargeObject: Stripe.Charge) {
    return stripeChargeObject.metadata ? stripeChargeObject.metadata.donation_id : null;
}

export function _convertKinshipAddressToStripeAddress(address: Address): Stripe.Address {
    return {
        city: address.city,
        country: address.country,
        line1: address.line_address,
        line2: null,
        postal_code: address.postal_code,
        state: address.state
    }
}