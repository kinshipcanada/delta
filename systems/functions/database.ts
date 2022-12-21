import { DatabaseDonation, DonationIdentifiers } from "../classes/utility_classes"
import { KinshipError } from "../classes/errors/KinshipError"

require('dotenv').config();

const FILE_NAME = "/systems/functions/database"

const database = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
})

export function upload_donation_to_database(donation: DatabaseDonation) : Promise<any> {
    const FUNCTION_NAME = "upload_donation_to_database"
    
    try {
        return database('donations').insert(donation)
    } catch (error) {
        new KinshipError(`Error uploading donation to database: ${error.message}`, FILE_NAME, FUNCTION_NAME)
        return
    }
}

export function fetch_receipt_from_database(donation_identifiers: DonationIdentifiers) : Promise<any> {
    const FUNCTION_NAME = "fetch_receipt_from_database"
    try {
        if (donation_identifiers.kinship_donation_id) {
            return database('donations').where('id', donation_identifiers.kinship_donation_id)
        } else if (donation_identifiers.charge_id) {
            return database('donations').where('stripe_charge_id', donation_identifiers.charge_id)
        } else if (donation_identifiers.payment_intent_id) {
            return database('donations').where('stripe_payment_intent_id', donation_identifiers.payment_intent_id)
        }
    } catch (error) {
        new KinshipError(`Error fetching receipt from database: ${error.message}`, FILE_NAME, FUNCTION_NAME)
        return
    }
}

export function fetch_donor_from_database(donor_id: string) : Promise<any> {
    const FUNCTION_NAME = "fetch_donor_from_database"

    try {
        return database('donor_profiles').where('id', donor_id)
    } catch (error) {
        new KinshipError(`Error fetching donor from database: ${error.message}`, FILE_NAME, FUNCTION_NAME)
        return
    }
}

export async function fetch_receipts_from_database(params: any) : Promise<any> {
    const FUNCTION_NAME = "fetch_receipts_from_database"

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
        new KinshipError(`Error fetching receipt from database: ${error.message}`, FILE_NAME, FUNCTION_NAME)
        return
    }
}