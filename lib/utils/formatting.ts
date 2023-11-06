import { Stripe } from "stripe";
import { Address } from "../classes/address";
import { Donation, isDonation } from "../classes/donation";
import { Donor, isDonor } from "../classes/donor";
import { RawStripeTransactionObject, isRawStripeTransactionObject } from "../classes/stripe";
import { CountryCode, DonationIdentifiers } from "../classes/utils";
import { DatabaseTable, causes } from "./constants";
import { DatabaseTypings, Json, parameterizedDatabaseQuery } from "./database";
import { v4 as uuidv4 } from 'uuid';
import { ProofOfDonation } from "@lib/classes/proof";
import { Cause } from "@lib/classes/causes";
import { isOpen } from "@lib/functions/proof";

/**
 * @description Formats a donation object into one that can be uploaded into the database
 * @param donation The donation to be formatted into a database donation object
 */

export function formatCauseForDatabase(causes: Cause[]) {
    return JSON.stringify(causes)
}

//todo
export function formatCauseFromDatabase(causes: any) {
    return
}

export function formatDonationForDatabase(donation: Donation): DatabaseTypings["public"]["Tables"]["donations"]["Row"] {

    if (donation.identifiers.donation_id == null) {
        // We don't just generate one here because if the ID is missing it means something already went wrong in the generation step.
        throw new Error("Donation is missing a valid ID")
    }
    
    // todo: get the uid already created from stripe

    const donationReadyForUpload: DatabaseTypings["public"]["Tables"]["donations"]["Row"] = {
        detail_causes: formatCauseForDatabase(donation.causes),
        // todo: will this throw? fix zod ffs.
        detail_date_donated: donation.date_donated instanceof Date ? donation.date_donated.toDateString() : donation.date_donated,
        detail_date_logged: (new Date().toDateString)(),
        donor_address_city: donation.donor.address.city,
        donor_address_country: donation.donor.address.country.toLowerCase() as DatabaseTypings["public"]["Enums"]["country"],
        donor_address_line1: donation.donor.address.line_address,
        donor_address_state: donation.donor.address.state,
        donor_address_zip: donation.donor.address.postal_code,
        donor_contact_email: donation.donor.email,
        donor_contact_first_name: donation.donor.first_name,
        donor_contact_last_name: donation.donor.last_name,
        id_donation_id: donation.identifiers.donation_id ? donation.identifiers.donation_id : uuidv4(),
        id_donor_id: donation.identifiers.donor_id ? donation.identifiers.donor_id : null,
        id_stripe_balance_transaction: donation.identifiers.stripe_balance_transaction_id ? donation.identifiers.stripe_balance_transaction_id : null,
        id_stripe_charge: donation.identifiers.stripe_charge_id ? donation.identifiers.stripe_charge_id : null,
        id_stripe_customer: donation.identifiers.stripe_customer_id ? donation.identifiers.stripe_customer_id : null,
        id_stripe_payment_intent: donation.identifiers.stripe_payment_intent_id ? donation.identifiers.stripe_payment_intent_id : null,
        id_stripe_payment_method: donation.identifiers.stripe_payment_method_id ? donation.identifiers.stripe_payment_method_id : null,
        // todo: fetch from stripe
        txn_amount_charged_cents: donation.amount_in_cents,
        txn_amount_donated_cents: donation.amount_in_cents,
        // todo
        txn_currency: "cad",
        // todo
        txn_payment_method: "cash",
        txn_processing_fee_cents: donation.fees_charged_by_stripe,
        // todo
        txn_status: "succeeded",
        // todo
        detail_distribution_status: "processing",
        details_amount_distributed: 0,
        details_distribution_restricted: isOpen(donation.causes)
    }

    return donationReadyForUpload
}

export function formatDonorFromDatabase(donor: DatabaseTypings["public"]["Tables"]["donors"]["Row"]): Donor {
    if (donor.set_up == null) {
        throw new Error("Donor is not set up")
    }

    return {
        donor_id: donor.id,
        first_name: donor.first_name!,
        last_name: donor.last_name!,
        email: donor.email!,
        address: {
            line_address: donor.address_line1,
            city: donor.address_city,
            state: donor.address_state,
            postal_code: donor.address_zip,
            country: donor.address_country
        } as Address,
        admin: donor.is_admin ?? false,
        set_up: donor.set_up,
        stripe_customer_ids: []
        // todo
        // stripe_customer_ids: donor.stripe_customer_ids as string[]
    }
}

export function formatProofFromDatabase(proof: DatabaseTypings["public"]["Tables"]["proof"]["Row"]): ProofOfDonation {
    // todo implement admin function that populates the many to many relation
    const formattedProof: ProofOfDonation = {
        proof_id: proof.id,
        uploaded_at: new Date(proof.uploaded_at),
        message_to_donor: proof.message_to_donor ?? undefined,
        amount_distributed_in_cents: proof.amount_distributed_in_cents, // todo update types,
        donations: [],
        region_distributed: proof.region_distributed as CountryCode,
        cause_matches: []
    }

    return formattedProof
}

export function formatDonationFromDatabase(
    donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"],
    listOfProof?: DatabaseTypings["public"]["Tables"]["proof"]["Row"][],
): Donation {

    const donor: Donor = {
        donor_id: donation.id_donor_id ?? undefined,
        first_name: donation.donor_contact_first_name,
        last_name: donation.donor_contact_last_name,
        email: donation.donor_contact_email,
        address: {
            line_address: donation.donor_address_line1,
            postal_code: donation.donor_address_zip,
            city: donation.donor_address_city,
            state: donation.donor_address_state,
            country: donation.donor_address_country
        } as Address,
        admin: false,
        set_up: true,
        stripe_customer_ids: donation.id_stripe_customer ? [donation.id_stripe_customer] : []
    }

    const formattedDonation: Donation = {
        identifiers: {
            donation_id: donation.id_donation_id,
            donor_id: donation.id_donor_id,
            stripe_payment_intent_id: donation.id_stripe_payment_intent,
            stripe_charge_id: donation.id_stripe_charge,
            stripe_balance_transaction_id: donation.id_stripe_balance_transaction,
            stripe_customer_id: donation.id_stripe_customer,
        } as DonationIdentifiers,
        donor: donor,
        amount_in_cents: donation.txn_amount_donated_cents ?? 0,
        fees_covered: donation.txn_amount_charged_cents ? donation.txn_amount_charged_cents - donation.txn_amount_donated_cents : 0,
        fees_charged_by_stripe: donation.txn_processing_fee_cents ?? 0,
        date_donated: new Date(donation.detail_date_donated),
        causes: [causes[0]],
        status: donation.detail_distribution_status,
        donation_details: {
            status: donation.detail_distribution_status,
            distribution_restricted: donation.details_distribution_restricted,
            amount_distributed_in_cents: donation.details_amount_distributed,
            // todo
            causes: [],
            // todo
            proof: [],
            date_donated: new Date(donation.detail_date_donated),
            date_logged: new Date(donation.detail_date_donated)
        },
        transaction_details: {
            status: donation.txn_status,
            currency: donation.txn_currency,
            amount_donated_in_cents: donation.txn_amount_donated_cents,
            amount_charged_in_cents: donation.txn_amount_charged_cents,
            fee_charged_by_payment_processor: (donation.txn_payment_method == "card" || donation.txn_payment_method == "acss_debit") && donation.txn_processing_fee_cents ? donation.txn_processing_fee_cents : 0 // todo: wire transfer logging?
        },
        proof: []
        // proof: listOfProof ? listOfProof.map(proof => formatProofFromDatabase(proof)) : []
    }

    return formattedDonation
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
        address: {
            line_address: rawStripeObject.customer!.address!.line1 as string,
            postal_code: rawStripeObject.customer!.address!.postal_code as string,
            city: rawStripeObject.customer!.address!.city as string,
            state: rawStripeObject.customer!.address!.state as string,
            country: rawStripeObject.customer!.address!.country as CountryCode
        },
        admin: donorFromDatabase.is_admin,
        set_up: donorFromDatabase.set_up,
        stripe_customer_ids: [
            rawStripeObject.customer!.id
        ]
    }

    const donationIdFromStripeMetadata = _getDonationIdFromStripeMetadata(rawStripeObject.charge_object!)

    const donation: Donation = { 
        identifiers: {
            donation_id: donationIdFromStripeMetadata ? donationIdFromStripeMetadata : uuidv4(),
            donor_id: donor.donor_id,
            stripe_payment_intent_id: rawStripeObject.charge_object!.payment_intent as string,
            stripe_charge_id: rawStripeObject.charge_object!.id as string,
            stripe_balance_transaction_id: rawStripeObject.charge_object!.balance_transaction as string,
            stripe_customer_id: rawStripeObject.customer!.id as string,
            stripe_payment_method_id: rawStripeObject.payment_method!.id as string
        },
        donor: donor,
        causes: _buildCausesFromStripeMetadata(rawStripeObject.charge_object!.metadata),
        amount_in_cents: rawStripeObject.charge_object!.amount_captured,
        fees_covered: rawStripeObject.charge_object!.metadata ? parseInt(rawStripeObject.charge_object!.metadata.fees_covered) : 0,
        fees_charged_by_stripe: rawStripeObject.balance_transaction_object!.fee,
        date_donated: new Date(rawStripeObject.charge_object!.created * 1000),
        proof: []
    }

    return donation;

}

function _buildCausesFromStripeMetadata(metadata: Stripe.Metadata): Cause[] {
    if (!metadata.causes) {
        return []
    }
    
    const causes = JSON.parse(metadata.causes)
    let formattedCauses: Cause[] = []

    for (const cause of causes) {
        formattedCauses.push({
            one_way: cause.one_way,
            label: cause.label,
            region: cause.region ? cause.region : undefined
        })
    }

    return formattedCauses
}
// todo
// function _buildCartFromStripeMetadata(stripeChargeObject: Stripe.Charge): Causes {
//     if (stripeChargeObject.metadata === null || stripeChargeObject.metadata === undefined || stripeChargeObject.metadata.causes === undefined || stripeChargeObject.metadata.causes === null) {
//         throw new Error("Stripe charge object does not have metadata or metadata.causes");
//     }

//     let total = 0;
//     let causes: CauseMap = {};

//     const stripeMetadataCauses = JSON.parse(stripeChargeObject.metadata.causes)

//     for (const key of Object.keys(stripeMetadataCauses)) {
//         total += parseInt(stripeMetadataCauses[key]);
//         causes[key] = parseInt(stripeMetadataCauses[key]);
//     }

//     return {
//         total_amount_paid_in_cents: total,
//         currency: stripeChargeObject.currency as CurrencyList,
//         is_imam_donation: false, // Implement
//         is_sadat_donation: false, // Implement
//         is_sadaqah: false // Implement
//     }
// }

function _getDonationIdFromStripeMetadata(stripeChargeObject: Stripe.Charge) {
    return stripeChargeObject.metadata ? JSON.parse(stripeChargeObject.metadata.identifiers).donation_id : null;
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