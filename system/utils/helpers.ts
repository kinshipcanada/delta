import { CountryList } from "../classes/utils";
import { createClient } from '@supabase/supabase-js'
import { DonationIdentifiers } from '../classes/utils';
import { isValidUUIDV4 as verifyUUID } from 'is-valid-uuid-v4';

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function callKinshipAPI(url: string, data?: {}) {
    try {
        const response = await fetch(url, {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data || {}), 
        });
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function generateIdentifiersFromStrings(strings: string[]): DonationIdentifiers {

    let identifiers: DonationIdentifiers = {}

    for (const string of strings) {
        if (string.startsWith('pi_')) {
            identifiers.stripe_payment_intent_id = string;
        } else if (string.startsWith('ch_')) {
            identifiers.stripe_charge_id = string;
        } else if (string.startsWith('bt_')) {
            identifiers.stripe_balance_transaction_id = string;
        } else if (string.startsWith('pm_')) {
            identifiers.stripe_payment_method_id = string;
        } else if (string.startsWith('cus_')) {
            identifiers.stripe_customer_id = string;
        } else if (verifyUUID(string)) {
            identifiers.donation_id = string;
        } else { continue; }
    }

    return identifiers;
}

export function isValidCountryCode(countryCode: string): boolean {
    return (Object.values(CountryList) as string[]).includes(countryCode);
}

export function checkForNullParameters(...args: any[]): void {
    for (let i = 0; i < args.length; i++) {
        if (args[i] === null) {
            throw new Error(`Parameter ${i} is null`);
        }
    }
}
    