import { Donation } from "../classes/donation/Donation";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { KinshipError } from "../classes/errors/KinshipError";
import { fetch_receipt_from_database, upload_donation_to_database } from "../functions/database";
import { _format_donation_from_database } from "../functions/donations";
import { KinshipNotification } from "../classes/notifications/Notification";
import { NotificationType, DeliveryMethod } from "../classes/utility_classes";
import { StripeTags } from "../classes/utility_classes";
import { build_donation_from_raw_stripe_data, fetch_donation_from_stripe } from "../functions/stripe";

export default async function check_and_resend_receipt( donation_id: string ) : Promise<ResendReceiptResponse> {

    if (donation_id.substring(0, 3) == "ch_") {
        // Check if the charge ID has already been logged to database
        const donation_from_database = await fetch_receipt_from_database({ stripe_charge_id: donation_id })

        if (donation_from_database.length > 0) {
            // If it has, send the receipt email and return the donation object
            const donation = await _format_donation_from_database(donation_from_database[0])
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)
            await notification.send(DeliveryMethod.EMAIL)
            
            return {
                donation: donation,
                already_existed: true
            }
        } else {
            // Otherwise, build and upload a donation object, and then send the donation
            const tags: StripeTags = {
                charge_id: donation_id
            }
            const raw_stripe_data = await fetch_donation_from_stripe(tags, true)
            const donation = build_donation_from_raw_stripe_data(raw_stripe_data[1])

            await upload_donation_to_database(donation.format_donation_for_upload())
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)

            await notification.send(DeliveryMethod.EMAIL)

            return {
                donation: donation,
                already_existed: false
            }
        }

    } else if (donation_id.substring(0, 3) == "pi_") {
        // Check if the payment intent ID has already been logged to database
        const donation_from_database = await fetch_receipt_from_database({ stripe_payment_intent_id: donation_id })

        if (donation_from_database.length > 0) {
            // If it has, send the receipt email and return the donation object
            const donation = await _format_donation_from_database(donation_from_database[0])
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)
            await notification.send(DeliveryMethod.EMAIL)
            
            return {
                donation: donation,
                already_existed: true
            }
        } else {
            // Otherwise, build and upload a donation object, and then send the donation
            const tags: StripeTags = {
                payment_intent_id: donation_id
            }
            const raw_stripe_data = await fetch_donation_from_stripe(tags, true)
            const donation = build_donation_from_raw_stripe_data(raw_stripe_data[1])

            await upload_donation_to_database(donation.format_donation_for_upload())
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)

            await notification.send(DeliveryMethod.EMAIL)

            return {
                donation: donation,
                already_existed: false
            }
        }

    } else if (verify_uuid(donation_id)) {
        const donation_from_database = await fetch_receipt_from_database({ kinship_donation_id: donation_id })

        if (donation_from_database.length > 0) {
            // If it has, send the receipt email and return the donation object
            const donation = await _format_donation_from_database(donation_from_database[0])
            const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)
            await notification.send(DeliveryMethod.EMAIL)
            
            return {
                donation: donation,
                already_existed: true
            }
        } else {
            new KinshipError(`${donation_id} is not a valid donation_id uuid`, "/api/methods/resend_receipt", "resend_receipt")
        }
    } else {
        throw new KinshipError(`${donation_id} is not a valid donation_id uuid`, "/api/methods/resend_receipt", "resend_receipt")
    }

}

export interface ResendReceiptResponse {
    donation: Donation,
    already_existed: boolean
}