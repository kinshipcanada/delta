import { Donation } from "../classes/donation/Donation";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { KinshipError } from "../classes/errors/KinshipError";
import { fetch_receipt_from_database } from "../database";
import { generate_donation_from_database } from "../classes/donation/donation_generators";
import { KinshipNotification } from "../classes/notifications/Notification";
import { NotificationType } from "../classes/notifications/notification_types";
import { DeliveryMethod } from "../classes/notifications/delivery_methods";

export default async function check_and_resend_receipt( donation_id: string ) : Promise<ResendReceiptResponse> {

    if (donation_id.substring(0, 3) == "ch_") {
        // Check if the charge ID has already been logged to database
        const donation_from_database = await fetch_receipt_from_database(null, donation_id, null)

        if (donation_from_database.length > 0) {
            // If it has, send the receipt email and return the donation object
            const donation = await generate_donation_from_database(donation_from_database[0])
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)
            await notification.send(DeliveryMethod.EMAIL)
            
            return {
                donation: donation,
                already_existed: true
            }
        }

        return null 
    } else if (donation_id.substring(0, 3) == "pi_") {
        return null
    } else if (verify_uuid(donation_id)) {
        return null
    } else {
        throw new KinshipError(`${donation_id} is not a valid donation_id uuid`, "/api/functions/resend_receipt", "resend_receipt")
    }

}

export interface ResendReceiptResponse {
    donation: Donation,
    already_existed: boolean
}
