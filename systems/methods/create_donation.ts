import { Donation } from "../classes/donation/Donation";
import { KinshipError } from "../classes/errors/KinshipError";
import { DonationIdentifiers, KinshipDonation, NotificationType } from "../classes/utility_classes";
import { _create_donation_from_identifier } from "../functions/donations";
import { notify_about_donation } from "../functions/notifications";

const FILE_NAME = "/systems/methods/create_donation";

export default async function create_donation( donation_id?: string, params?: any ) : Promise<KinshipDonation> {

    const FUNCTION_NAME = "create_donation"

    if (!donation_id && !params) { new KinshipError("You must pass either parameters or a donation id to create a donation", FILE_NAME, FUNCTION_NAME); return; }

    if (donation_id) {
        let identifiers: DonationIdentifiers = {}

        if (donation_id.substring(0, 3) == "ch_") {
            identifiers.stripe_charge_id = donation_id
        } else if (donation_id.substring(0, 3) == "pi_") {
            identifiers.stripe_payment_intent_id = donation_id
        }

        const donation = await _create_donation_from_identifier(identifiers)
        await notify_about_donation(donation, NotificationType.DONATION_MADE)

        return donation.format_donation_for_user()

    } else if (params) {
        return null
    }

    return null
    
}