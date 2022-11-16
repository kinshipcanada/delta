import { Donation } from "../classes/donation/Donation";
import { KinshipError } from "../classes/errors/KinshipError";
import { build_donation_from_raw_stripe_data, fetch_donation_from_stripe } from "../helpers/stripe";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { upload_donation_to_database } from "../helpers/database";
import { KinshipNotification } from "../classes/notifications/Notification";
import { NotificationType, DeliveryMethod, StripeTags } from "../classes/utility_classes";

export default async function create_donation( donation_id ) : Promise<Donation> {
    if (donation_id.substring(0, 3) == "ch_") {
        try {
            const tags: StripeTags = {
                charge_id: donation_id
            }
            const raw_stripe_data = await fetch_donation_from_stripe(tags, true)
            const donation = build_donation_from_raw_stripe_data(raw_stripe_data[1])

            await upload_donation_to_database(donation.format_donation_for_upload())
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)

            await notification.send(DeliveryMethod.EMAIL)
            return donation

        } catch (error) {
            new KinshipError(error, "/api/functions/create_donation", "create_donation")
            throw new Error("Invalid charge id")
        }

    } else if (donation_id.substring(0, 9) == "donation_") {

        return null

    } else {

        if (!verify_uuid(donation_id)) {
            new KinshipError(`${donation_id} is not a valid donation_id uuid`, "/api/functions/create_donation", "create_donation")
            throw new Error(`${donation_id} is not a valid donation id`)
        } else {
            return null
        }
    }
    
}