import { Donor } from "../donors/Donor";
import { donor_details } from "../donors/donor_details";
import { Donation } from "./Donation";

export function generate_donation_from_database(donation_object: any) : Donation {
    return new Donation(donation_object.donor, donation_object.amount_in_cents, donation_object.native_currency, donation_object.native_amount_in_cents, donation_object.donation_causes, donation_object.fees_covered, donation_object.fees_covered_in_cents, donation_object.fees_charged_by_stripe, donation_object.payment_method, donation_object.stripe_payment_intent_id, donation_object.stripe_charge_id, donation_object.stripe_balance_transaction_id, donation_object.stripe_customer_id)
}