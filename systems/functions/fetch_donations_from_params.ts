import { Donation } from "../classes/donation/Donation";
import { CountryList } from "../classes/utility_classes/country_list";

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
) : Promise<Donation[]> {
    
    return null
}