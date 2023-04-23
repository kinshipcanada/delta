import { Stripe } from "stripe";
import { Address } from "../classes/address";
import { Cart, CauseMap } from "../classes/cart";
import { Donation } from "../classes/donation";
import { Donor } from "../classes/donor";
import { RawStripeTransactionObject } from "../classes/stripe";
import { CountryList, CurrencyList, DonationIdentifiers } from "../classes/utils";
import { DatabaseTable } from "../utils/constants";
import { DatabaseTypings, parameterizedDatabaseQuery } from "./database";

/**
 * @description Formats a donation object into one that can be uploaded into the database
 * @param donation The donation to be formatted into a database donation object
 */
export function formatDonationForDatabase(donation: Donation): DatabaseTypings["public"]["Tables"]["donor_profiles"]["Row"] {
    throw new Error("Not implemented")
}

/**
 * @description Creates a Kinship Cart object for eTransfer donations
 * @param cart 
 */
export function formatCartForDatabase(donation: Donation): DatabaseTypings["public"]["Tables"]["kinship_carts"]["Row"] {
    return {
        id: null,
        address_city: donation.donor.address.city,
        address_country: donation.donor.address.country,
        address_line_address: donation.donor.address.line_address,
        address_postal_code: donation.donor.address.postal_code,
        address_state: donation.donor.address.state,
        amount_in_cents: donation.amount_in_cents,
        donation_causes: donation.causes,
        donation_created: new Date().toDateString(),
        donation_logged: new Date().toDateString(),
        donor: donation.donor.donor_id,
        email: donation.donor.email,
        first_name: donation.donor.first_name,
        last_name: donation.donor.first_name,
        livemode: donation.live,
        phone_number: donation.donor.phone_number
    } as DatabaseTypings["public"]["Tables"]["kinship_carts"]["Row"]
}

export function formatDonorFromDatabase(donor: DatabaseTypings["public"]["Tables"]["donor_profiles"]["Row"]): Donor {
    return {
        donor_id: donor.id,
        first_name: donor.first_name,
        last_name: donor.last_name,
        email: donor.email,
        phone_number: donor.phone_number,
        address: {
            line_address: donor.address_line_address,
            city: donor.address_city,
            state: donor.address_state,
            postal_code: donor.address_postal_code,
            country: donor.address_country as CountryList
        } as Address,
        stripe_customer_ids: donor.stripe_customer_ids as string[]
    } as Donor
}

export function formatDonationFromDatabase(donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]): Donation {
    const donor: Donor = {
        donor_id: donation.donor,
        first_name: donation.donor_object.first_name,
        last_name: donation.donor_object.last_name,
        email: donation.email,
        address: {
            line_address: donation.address_line_address,
            postal_code: donation.address_postal_code,
            city: donation.address_city,
            state: donation.address_state,
            country: donation.address_country as CountryList
        } as Address,
        stripe_customer_ids: [ donation.stripe_customer_id as string ]
    }
    const cart: Cart = {
        causes: donation.donation_causes.causes as CauseMap,
        // This is a bad implementation, needs to be fixed immediately
        currency: donation.address_country as CurrencyList,
        total_amount_paid_in_cents: donation.donation_causes.total_amount_paid_in_cents as number
    }

    return {
        identifiers: {
            donation_id: donation.id,
            donor_id: donation.donor,
            stripe_payment_intent_id: donation.stripe_payment_intent_id,
            stripe_charge_id: donation.stripe_charge_id,
            stripe_balance_transaction_id: donation.stripe_balance_transaction_id,
            stripe_customer_id: donation.stripe_customer_id,
        } as DonationIdentifiers,
        donor: donor,
        causes: cart,
        live: donation.livemode,
        amount_in_cents: donation.amount_in_cents,
        fees_covered: donation.fees_covered,
        fees_charged_by_stripe: donation.fees_charged_by_stripe,
        date_donated: new Date(donation.donation_created),
    } as Donation
}

export async function formatDonationFromRawStripeData(rawStripeObject: RawStripeTransactionObject): Promise<Donation> {

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