import { fetch_customer_object } from "../../stripe";
import { Donor } from "../donors/Donor";
import { donor_details } from "../donors/donor_details";
import { CountryList } from "../utility_classes/country_list";
import { Donation } from "./Donation";

export async function generate_donation_from_database(donation_object: any) : Promise<Donation> {
    const fetched_donor_from_stripe = await fetch_customer_object(donation_object.stripe_customer_id)
    const generatedDonorDetails: donor_details = {
        first_name: fetched_donor_from_stripe.metadata.first_name,
        last_name: fetched_donor_from_stripe.metadata.last_name,
        stripe_cus_id: fetched_donor_from_stripe.id,
        email: fetched_donor_from_stripe.email,
        address: {
            line_address: fetched_donor_from_stripe.address.line1,
            postal_code: fetched_donor_from_stripe.address.postal_code,
            city: fetched_donor_from_stripe.address.city,
            state: fetched_donor_from_stripe.address.state,
            country: fetched_donor_from_stripe.address.country == "CA" ? CountryList.CANADA : fetched_donor_from_stripe.address.country == "US" ? CountryList.UNITED_STATES : CountryList.UNDEFINED,
        }
    }
    
    const donor = new Donor(generatedDonorDetails, fetched_donor_from_stripe.metadata.user_id)
    const donation_date = new Date(donation_object.donation_created)
    return new Donation(donor, donation_date, donation_object.amount_in_cents, donation_object.native_currency, donation_object.native_amount_in_cents, donation_object.donation_causes, donation_object.fees_covered, donation_object.fees_covered_in_cents, donation_object.fees_charged_by_stripe, donation_object.payment_method, donation_object.stripe_payment_intent_id, donation_object.stripe_charge_id, donation_object.stripe_balance_transaction_id, donation_object.stripe_customer_id, donation_object.proof_available)
}