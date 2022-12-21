import { Donation } from "../classes/donation/Donation";
import { KinshipError } from "../classes/errors/KinshipError";
import { build_donation_from_raw_stripe_data, fetch_donation_from_stripe } from "../helpers/stripe";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { upload_donation_to_database } from "../helpers/database";
import { KinshipNotification } from "../classes/notifications/Notification";
import { NotificationType, DeliveryMethod, StripeTags, DonationIdentifiers } from "../classes/utility_classes";
import { _create_donation_from_identifier } from "../functions/donations";

const FILE_NAME = "/systems/methods/create_donation";

export default async function create_donation( donation_id?: string, params?: any ) : Promise<Donation> {

    const FUNCTION_NAME = "create_donation"

    if (!donation_id && !params) { new KinshipError("You must pass either parameters or a donation id to create a donation", FILE_NAME, FUNCTION_NAME); return; }

    if (donation_id) {
        let identifiers: DonationIdentifiers = {}

        if (donation_id.substring(0, 3) == "ch_") {
            identifiers.charge_id = donation_id
        } else if (donation_id.substring(0, 3) == "pi_") {
            identifiers.payment_intent_id = donation_id
        }

        return _create_donation_from_identifier(identifiers)
    } else if (params) {
        return null
    }

    return null
    
}