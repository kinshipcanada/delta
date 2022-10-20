import { Donation } from "../classes/donation/Donation";
import { isValidUUIDV4 as verify_uuid } from 'is-valid-uuid-v4';
import { KinshipError } from "../classes/errors/KinshipError";
import { fetch_receipt_from_database } from "../database";

export default async function resend_receipt( donation_id: string ) : Promise<Donation> {

    if (donation_id.substring(0, 3) == "ch_") {
        // Check if the charge ID has already been logged to database
        const donation_from_database = await fetch_receipt_from_database(null, donation_id, null)

        if (donation_from_database) {
            // If it has, send the receipt email and return the donation object
            console.log(donation_from_database)
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