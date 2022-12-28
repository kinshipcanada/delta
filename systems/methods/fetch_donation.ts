import { Donation } from "../classes/donation/Donation";
import { DonationIdentifiers } from "../classes/utility_classes";
import { _fetch_donation_from_identifier } from "../functions/donations";

export default async function fetch_donation( donation_id : string ) : Promise<Donation> {
    
    let donation_identifiers: DonationIdentifiers = {}

    if (donation_id.substring(0, 3) == "pi_") {
        donation_identifiers.stripe_payment_intent_id = donation_id
    } else if (donation_id.substring(0, 3) == "ch_") {
        donation_identifiers.stripe_charge_id = donation_id
    } else {
        donation_identifiers.kinship_donation_id = donation_id
    }

    return await _fetch_donation_from_identifier(donation_identifiers)
}