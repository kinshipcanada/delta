import { KinshipError } from "../classes/errors/KinshipError";
import { DatabaseDonation } from "./interfaces";

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

export function fetch_receipt_from_database(donation_id?: string, stripe_charge_id?: string, stripe_payment_intent_id?: string) : Promise<any> {
    try {
        if (donation_id) {
            return database('donations').where('id', donation_id)
        } else if (stripe_charge_id) {
            return database('donations').where('stripe_charge_id', stripe_charge_id)
        } else if (stripe_payment_intent_id) {
            return database('donations').where('stripe_payment_intent_id', stripe_payment_intent_id)
        }
    } catch (error) {
        new KinshipError(`Error fetching receipt from database: ${error.message}`, "/src/database/index", "fetch_receipt_from_database")
        return
    }
}