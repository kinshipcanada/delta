import { Donation } from "../classes/donation/Donation";
import { generate_donation_from_database } from "../classes/donation/donation_generators";
import { CountryList } from "../classes/utility_classes/country_list";
import { fetch_receipts_from_database, fetch_receipt_from_database } from "../database";
import { DatabaseDonation } from "../database/interfaces";

export default async function fetch_donations_from_params(
    donation_id?: string, 
    date_start?: Date, 
    date_end?: Date, 
    donor_id?: string, 
    donor_email?: string,
    first_name?: string,
    last_name?: string,
    amount_min_in_cents?: number,
    amount_max_in_cents?: number,
    fees_covered?: boolean,
    address_country?: CountryList,
    stripe_payment_intent_id?: string,
    stripe_charge_id?: string, 
    stripe_balance_transaction_id?: string, 
    stripe_customer_id?: string,
    address_line_address?: string,
    address_state?: string,
    address_city?: string,
    address_postal_code?: string
) : Promise<DatabaseDonation[]> {
    
    const donations_from_database = await fetch_receipts_from_database(donor_email)

    let donations = []

    for (const donation of donations_from_database) {
        donations.push(generate_donation_from_database(donation))
    }

    const resolved_donations = await Promise.all(donations)

    let formatted_donations = []

    for (const donation of resolved_donations) {
        formatted_donations.push(donation.format_donation_for_user())
    }

    return formatted_donations
}