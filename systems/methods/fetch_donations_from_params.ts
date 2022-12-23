import { _format_donation_from_database, _create_pdf_from_donation } from "../functions/donations";
import { fetch_receipts_from_database } from "../functions/database";
import { DatabaseDonation } from "../classes/utility_classes";

export default async function fetch_donations_from_params(
    format_for_user: boolean = false,
    donation: DatabaseDonation
) : Promise<any> {

    const donations_from_database = await fetch_receipts_from_database(donation)
    let donations = donations_from_database.map(_format_donation_from_database)

    const resolved_donations = await Promise.all(donations)

    if (format_for_user) {
        let formatted_donations = resolved_donations.map(donation => donation.format_donation_for_user());
        return formatted_donations
    } else {
        return resolved_donations
    }
}