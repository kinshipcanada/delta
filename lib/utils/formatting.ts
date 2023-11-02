import { Stripe } from "stripe";
import { Address } from "../classes/address";
import { Causes, CauseMap } from "@lib/classes/causes";
import { Donation, isDonation } from "../classes/donation";
import { Donor, isDonor } from "../classes/donor";
import { RawStripeTransactionObject, isRawStripeTransactionObject } from "../classes/stripe";
import { CurrencyList, DonationIdentifiers } from "../classes/utils";
import { DatabaseTable } from "./constants";
import { DatabaseTypings, parameterizedDatabaseQuery } from "./database";
import { v4 as uuidv4 } from 'uuid';

/**
 * @description Formats a donation object into one that can be uploaded into the database
 * @param donation The donation to be formatted into a database donation object
 */
export function formatDonationForDatabase(donation: Donation): DatabaseTypings["public"]["Tables"]["donations"]["Row"] {

    if (donation.identifiers.donation_id == null) {
        // We don't just generate one here because if the ID is missing it means something already went wrong in the generation step.
        throw new Error("Donation is missing a valid ID")
    }
    
    return {
        address_city: donation.donor.address.city,
        address_country: "ca",
        address_line_address: donation.donor.address.line_address,
        address_postal_code: donation.donor.address.postal_code,
        address_state: donation.donor.address.state,
        amount_in_cents: donation.amount_in_cents,
        donation_causes: null,
        donation_created: new Date().toDateString(),
        donation_logged: new Date().toDateString(),
        donation_method: "etransfer",
        donor: donation.donor.donor_id ? donation.donor.donor_id : null,
        donor_object: donation.donor,
        email: donation.donor.email,
        fees_charged_by_stripe: donation.fees_charged_by_stripe,
        fees_covered: donation.fees_covered,
        id: donation.identifiers.donation_id,
        livemode: donation.live,
        payment_method: null,
        phone_number: null,
        proof_available: false,
        stripe_balance_transaction_id: null,
        stripe_charge_id: null,
        stripe_customer_id: null,
        stripe_payment_intent_id: null,
        transaction_refunded: false,
        transaction_successful: true
    }
}

/**
 * @description Creates a Kinship Cart object for eTransfer donations
 * @param cart 
 */
export function formatCartForDatabase(donation: Donation): DatabaseTypings["public"]["Tables"]["kinship_carts"]["Row"] {
    // Generate cart id
    const cartId = uuidv4();

    return {
        id: cartId,
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

export function formatCartFromDatabase(cart: DatabaseTypings["public"]["Tables"]["kinship_carts"]["Row"]): Donation {

    if (
        cart.first_name == null || 
        cart.last_name == null || 
        cart.email == null || 
        cart.address_line_address == null || 
        cart.address_city == null || 
        cart.address_state == null || 
        cart.address_country ||
        cart.address_postal_code == null || 
        cart.livemode == null || 
        cart.amount_in_cents == null || 
        cart.donation_logged == null
    ) {
        throw new Error("Fields are missing from cart in database")
    }

    const donor: Donor = {
        donor_id: cart.donor ? cart.donor : undefined,
        first_name: cart.first_name,
        last_name: cart.last_name,
        email: cart.email,
        address: {
            line_address: cart.address_line_address,
            city: cart.address_city,
            state: cart.address_state,
            postal_code: cart.address_postal_code,
            country: cart.address_country
        },
        admin: false,
        set_up: true,
        stripe_customer_ids: []
    }

    const constructedCart: Causes = {
        total_amount_paid_in_cents: 50,
        currency: CurrencyList.CAD,
        is_imam_donation: false, // Implement
        is_sadat_donation: false, // Implement
        is_sadaqah: false // Implement
    }
    
    return {
        identifiers: {
            donation_id: cart.id,
        },
        donor: donor,
        causes: constructedCart,
        live: cart.livemode,
        amount_in_cents: cart.amount_in_cents,
        fees_covered: 0,
        fees_charged_by_stripe: 0,
        date_donated: new Date(cart.donation_logged as string)
    }
}

export function formatDonorFromDatabase(donor: DatabaseTypings["public"]["Tables"]["donor_profiles"]["Row"]): Donor {

    if (donor.set_up == null) {
        throw new Error("Donor is not set up")
    }

    return {
        donor_id: donor.id,
        first_name: donor.first_name!,
        last_name: donor.last_name!,
        email: donor.email!,
        phone_number: donor.phone_number ?? undefined,
        address: {
            line_address: donor.address_line_address,
            city: donor.address_city,
            state: donor.address_state,
            postal_code: donor.address_postal_code,
            country: donor.address_country
        } as Address,
        admin: donor.admin ?? false,
        set_up: donor.set_up,
        stripe_customer_ids: donor.stripe_customer_ids as string[]
    }
}

export function formatDonationFromDatabase(donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]): Donation {

    if (!isDonation(donation) || donation.email == null || donation.donation_created == null) {
        throw new Error("Donation from database is missing fields or improperly formatted")
    }

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
            country: donation.address_country
        } as Address,
        admin: false,
        set_up: true,
        stripe_customer_ids: [ donation.stripe_customer_id as string ]
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
        live: donation.livemode,
        amount_in_cents: donation.amount_in_cents,
        fees_covered: donation.fees_covered,
        fees_charged_by_stripe: donation.fees_charged_by_stripe,
        date_donated: new Date(donation.donation_created),
    } as Donation
}

export async function formatDonationFromRawStripeData(rawStripeObject: RawStripeTransactionObject): Promise<Donation> {

    if (!isRawStripeTransactionObject(rawStripeObject)) {
        throw Error("Raw stripe response is incomplete")
    }

    const donorFromDatabase = await parameterizedDatabaseQuery(DatabaseTable.DONOR_PROFILES, {
        email: rawStripeObject.customer!.email
    }, true); // Fetch donor from database using their email, if it exists.

    const donor: Donor = {
        donor_id: donorFromDatabase ? donorFromDatabase.id : null,
        first_name: rawStripeObject.charge_object!.metadata.first_name ? rawStripeObject.charge_object!.metadata.first_name : rawStripeObject.customer!.name!.split(' ')[0] as string,
        last_name: rawStripeObject.charge_object!.metadata.last_name ? rawStripeObject.charge_object!.metadata.last_name : rawStripeObject.customer!.name!.split(' ')[1] as string,
        email: rawStripeObject.customer!.email!,
        phone_number: rawStripeObject.customer!.phone ? parseInt(rawStripeObject.customer!.phone) : undefined,
        address: {
            line_address: rawStripeObject.customer!.address!.line1 as string,
            postal_code: rawStripeObject.customer!.address!.postal_code as string,
            city: rawStripeObject.customer!.address!.city as string,
            state: rawStripeObject.customer!.address!.state as string,
            country: rawStripeObject.customer!.address!.country as string
        },
        admin: donorFromDatabase.admin,
        set_up: donorFromDatabase.set_up,
        stripe_customer_ids: [
            rawStripeObject.customer!.id
        ]
    }

    const donationIdFromStripeMetadata = _getDonationIdFromStripeMetadata(rawStripeObject.charge_object!)

    const donation: Donation = { 
        identifiers: {
            donation_id: donationIdFromStripeMetadata ? donationIdFromStripeMetadata : undefined,
            donor_id: donor.donor_id,
            stripe_payment_intent_id: rawStripeObject.charge_object!.payment_intent as string,
            stripe_charge_id: rawStripeObject.charge_object!.id as string,
            stripe_balance_transaction_id: rawStripeObject.charge_object!.balance_transaction as string,
            stripe_customer_id: rawStripeObject.customer!.id as string,
            stripe_payment_method_id: rawStripeObject.payment_method!.id as string
        },
        donor: donor,
        causes: _buildCartFromStripeMetadata(rawStripeObject.charge_object!),
        live: rawStripeObject.charge_object!.livemode,
        amount_in_cents: rawStripeObject.charge_object!.amount_captured,
        fees_covered: rawStripeObject.charge_object!.metadata ? parseInt(rawStripeObject.charge_object!.metadata.fees_covered) : 0,
        fees_charged_by_stripe: rawStripeObject.balance_transaction_object!.fee,
        date_donated: new Date(rawStripeObject.charge_object!.created * 1000)
    }

    return donation;

}

function _buildCartFromStripeMetadata(stripeChargeObject: Stripe.Charge): Causes {
    if (stripeChargeObject.metadata === null || stripeChargeObject.metadata === undefined || stripeChargeObject.metadata.causes === undefined || stripeChargeObject.metadata.causes === null) {
        throw new Error("Stripe charge object does not have metadata or metadata.causes");
    }

    let total = 0;
    let causes: CauseMap = {};

    const stripeMetadataCauses = JSON.parse(stripeChargeObject.metadata.causes)

    for (const key of Object.keys(stripeMetadataCauses)) {
        total += parseInt(stripeMetadataCauses[key]);
        causes[key] = parseInt(stripeMetadataCauses[key]);
    }

    return {
        total_amount_paid_in_cents: total,
        currency: stripeChargeObject.currency as CurrencyList,
        is_imam_donation: false, // Implement
        is_sadat_donation: false, // Implement
        is_sadaqah: false // Implement
    }
}

function _getDonationIdFromStripeMetadata(stripeChargeObject: Stripe.Charge) {
    return stripeChargeObject.metadata ? stripeChargeObject.metadata.donation_id : null;
}

export function _convertKinshipAddressToStripeAddress(address: Address): Stripe.AddressParam {
    return {
        city: address.city,
        country: address.country,
        line1: address.line_address,
        postal_code: address.postal_code,
        state: address.state
    }
}