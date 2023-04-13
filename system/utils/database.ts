const FILE_NAME = '/system/functions/database.ts'

import * as dotenv from 'dotenv'
import { Donation } from '../classes/donation'
import { DonationIdentifiers } from '../classes/utils'
import { formatCartForDatabase, formatDonationForDatabase } from './formatting'
import { logError } from './logger'
import { DatabaseTable } from './constants'

dotenv.config()

const database = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
})

export function uploadDonationToDatabase(donation: Donation): Promise<any> {
    const FUNCTION_NAME = 'uploadDonationToDatabase'

    try {
        return database('donations').insert(formatDonationForDatabase(donation))
    } catch (error) {
        logError(error, FILE_NAME, FUNCTION_NAME)
    }
}

export function fetchDonationFromDatabase(donation_identifiers: DonationIdentifiers): Promise<any> {
    const FUNCTION_NAME = 'fetchDonationFromDatabase'

    try {
        const allowedIdentifiers = ['donation_id', 'stripe_charge_id', 'stripe_payment_intent_id'];

        for (const identifier of allowedIdentifiers) {
            if (donation_identifiers[identifier]) {
                return database('donations').where(identifier, donation_identifiers[identifier]);
            }
        }

        throw new Error('No valid identifiers provided. You must provide at least one of the following: donation_id, stripe_charge_id, stripe_payment_intent_id.')

    } catch (error) {
        logError(error, FILE_NAME, FUNCTION_NAME)
    }
}

export function fetchDonorFromDatabase(donor_id: string): Promise<any> {
    const FUNCTION_NAME = 'fetchDonorFromDatabase'

    try {
        return database('donor_profiles').where('donor_id', donor_id);
    } catch (error) {
        logError(error, FILE_NAME, FUNCTION_NAME)
    }
}

export async function parameterizedDatabaseQuery(table: DatabaseTable, params): Promise<any> {
    const FUNCTION_NAME = 'parameterizedDatabaseQuery'

    const columns = Object.keys(params)

    try {
        const parameterizedQuery = (query) => {
            for (const column of columns) {
                if (params[column] != null) { query.andWhere(`${table}.${column}`, `${params[column]}`); }
            }
        }

        return database(table).where(parameterizedQuery)
    } catch (error) {
        logError(error, FILE_NAME, FUNCTION_NAME)
    }
}

export async function uploadCartToDatabase(donation: Donation): Promise<any> {
    const FUNCTION_NAME = 'uploadCartToDatabase'

    try {
        return database('carts').insert(formatCartForDatabase(donation))
    } catch (error) {
        logError(error, FILE_NAME, FUNCTION_NAME)
    }
}