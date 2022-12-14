import { CountryList, DatabaseDonation, DonationIdentifiers, donor_details, KinshipDonation } from "../classes/utility_classes";
import { Donation } from "../classes/donation/Donation";
import { KinshipError } from "../classes/errors/KinshipError";
import { build_donation_from_raw_stripe_data, fetch_customer_object, fetch_donation_from_stripe } from "./stripe";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { upload_donation_to_database, fetch_receipt_from_database } from "./database";
import { StripeTags } from "../classes/utility_classes";
import { Donor } from "../classes/donors/Donor";
import { Cart } from "../classes/cart/Cart";

const FILE_NAME = "/systems/functions/donations";

// Formatters
export async function _create_pdf_from_donation(donation?: Donation) {
    const FUNCTION_NAME = "_create_pdf_from_donation"

    return null
}

export async function _format_donation_from_database(donation_object: any) {
    const FUNCTION_NAME = "_format_donation_from_database" 

    try {
        const fetched_donor_from_stripe = await fetch_customer_object(donation_object.stripe_customer_id)
        console.log(fetched_donor_from_stripe)
        const generatedDonorDetails: donor_details = {
            first_name: fetched_donor_from_stripe.metadata.first_name ? fetched_donor_from_stripe.metadata.first_name : fetched_donor_from_stripe.name.split(' ')[0],
            last_name: fetched_donor_from_stripe.metadata.last_name ? fetched_donor_from_stripe.metadata.last_name : fetched_donor_from_stripe.name.split(' ')[1],
            stripe_cus_id: fetched_donor_from_stripe.id,
            email: fetched_donor_from_stripe.email,
            address: {
                line_address: fetched_donor_from_stripe.address.line1,
                postal_code: fetched_donor_from_stripe.address.postal_code,
                city: fetched_donor_from_stripe.address.city,
                state: fetched_donor_from_stripe.address.state,
                country: fetched_donor_from_stripe.address.country.toLowerCase(),
            }
        }
        
        const donor = new Donor(generatedDonorDetails, fetched_donor_from_stripe.metadata.user_id)
        const donation_date = new Date(donation_object.donation_created)
        const cart = new Cart(donation_object.donation_causes.causes, donation_object.donation_causes.total_amount_paid_in_cents, donation_object.fees_covered == 0 ? false : true)
        return new Donation(donor, donation_object.livemode, donation_date, donation_object.amount_in_cents, cart, donation_object.fees_covered, donation_object.fees_charged_by_stripe, donation_object.payment_method, donation_object.stripe_payment_intent_id, donation_object.stripe_charge_id, donation_object.stripe_balance_transaction_id, donation_object.stripe_customer_id, donation_object.proof_available, donation_object.id)
    } catch (error) {
        throw new KinshipError(error.message, FILE_NAME, FUNCTION_NAME)
        return null
    }
}

// Create donations
export async function _create_donation_from_identifier(donation_identifiers: DonationIdentifiers) : Promise<Donation> {
    
    const FUNCTION_NAME = "_create_donation_from_identifier"

    if (donation_identifiers.stripe_charge_id || donation_identifiers.stripe_payment_intent_id) {
        try {
            const tags: StripeTags = {
                charge_id: donation_identifiers.stripe_charge_id,
                payment_intent_id: donation_identifiers.stripe_payment_intent_id
            }

            const raw_stripe_data = await fetch_donation_from_stripe(tags, true)
            const donation = build_donation_from_raw_stripe_data(raw_stripe_data[1])

            await upload_donation_to_database(donation.format_donation_for_upload())

            return donation
        } catch (error) {
            new KinshipError(error, FILE_NAME, FUNCTION_NAME)
            return null
        }
    } else {
        // No identifier was provided, so we throw an error.
        new KinshipError("No stripe charge ID or payment intent ID provided, perhaps you meant to call the _create_donation_from_parameters() function?", FILE_NAME, FUNCTION_NAME)
    }
}

export async function _create_donation_from_parameters(parameters: DatabaseDonation) {}

// Fetch donations
export async function _fetch_donation_from_identifier(donation_identifiers: DonationIdentifiers) {

    const FUNCTION_NAME = "_fetch_donation_from_identifier"

    if (donation_identifiers.stripe_charge_id || donation_identifiers.stripe_payment_intent_id) {
        try {
            // Check first to see if the donation exists in the database
            const donation_in_database = await fetch_receipt_from_database(donation_identifiers)

            if (donation_in_database.length > 0) {
                const donation = await _format_donation_from_database(donation_in_database[0])
                return donation 
            }
            
            // If it doesn't, build the donation from stripe
            const tags: StripeTags = {
                charge_id: donation_identifiers.stripe_charge_id,
                payment_intent_id: donation_identifiers.stripe_payment_intent_id
            }

            const raw_stripe_data = await fetch_donation_from_stripe(tags, true)

            // Then, build and return the donation
            const donation = build_donation_from_raw_stripe_data(raw_stripe_data[1])
            return donation
        } catch (error) {
            new KinshipError(error.message, FILE_NAME, FUNCTION_NAME)
            return null
        }

    }

    if (!verify_uuid(donation_identifiers.kinship_donation_id)) {
        new KinshipError(`${donation_identifiers.kinship_donation_id} is not a valid donation_id uuid`, FILE_NAME, FUNCTION_NAME)
        return null
    } else {
        const donations_from_database = await fetch_receipt_from_database(donation_identifiers)
        const donation = await _format_donation_from_database(donations_from_database[0])

        return donation
    }

}