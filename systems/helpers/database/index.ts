import { KinshipError } from "../../classes/errors/KinshipError";
import { DatabaseDonation, DonationIdentifiers } from "../../classes/utility_classes"

require('dotenv').config();

const database = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
})

export function upload_donation_to_database(donation: DatabaseDonation) : Promise<any> {
    try {
        return database('donations').insert(donation)
    } catch (error) {
        new KinshipError(`Error uploading donation to database: ${error.message}`, "/src/database/index", "upload_donation_to_database")
        return
    }
}

export function fetch_receipt_from_database(donation_identifiers: DonationIdentifiers) : Promise<any> {
    try {
        if (donation_identifiers.kinship_donation_id) {
            return database('donations').where('id', donation_identifiers.kinship_donation_id)
        } else if (donation_identifiers.charge_id) {
            return database('donations').where('stripe_charge_id', donation_identifiers.charge_id)
        } else if (donation_identifiers.payment_intent_id) {
            return database('donations').where('stripe_payment_intent_id', donation_identifiers.payment_intent_id)
        }
    } catch (error) {
        new KinshipError(`Error fetching receipt from database: ${error.message}`, "/src/database/index", "fetch_receipt_from_database")
        return
    }
}

export function fetch_donor_from_database(donor_id: string) : Promise<any> {
    try {
        return database('donor_profiles').where('id', donor_id)
    } catch (error) {
        new KinshipError(`Error fetching donor from database: ${error.message}`, "/src/database/index", "fetch_donor_from_database")
        return
    }
}

export async function fetch_receipts_from_database(params: any) : Promise<any> {

    try {
        const table = 'donations';
        const columns = Object.keys(params);

        const parameterizedQuery = (query) => {
            for (const column of columns) {
                if (params[column] != null) { query.andWhere(`${table}.${column}`, `${params[column]}`); }
            }
        }

        // We currently fetch all donations by email, which is why we require email verification
        return database(table).where(parameterizedQuery)
    } catch (error) {
        new KinshipError(`Error fetching receipt from database: ${error.message}`, "/src/database/index", "fetch_receipts_from_database")
        return
    }
}