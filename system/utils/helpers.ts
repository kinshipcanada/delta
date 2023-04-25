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
        console.error(error);
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

    verifyAtLeastOneParametersExists('No valid identifiers provided', identifiers.stripe_payment_intent_id, identifiers.stripe_charge_id, identifiers.donation_id)

    return identifiers;
}

export function isValidCountryCode(countryCode: string): boolean {
    return (Object.values(CountryList) as string[]).includes(countryCode);
}

export function verifyAllParametersExist(errorMessage, ...args: any[]): void {
    for (let i = 0; i < args.length; i++) {
        if (args[i] === null || args[i] === undefined) {
            throw new Error(errorMessage ? errorMessage : `Null parameter at index ${i}`);
        }
    }
}

export function verifyAtLeastOneParametersExists(errorMessage, ...args: any[]): void {
    let allAreNull = true;

    for (let i = 0; i < args.length; i++) {
        if (args[i] !== null && args[i] !== undefined) {
            allAreNull = false;
            break;
        }
    }

    if (allAreNull) {
        throw new Error(errorMessage ? errorMessage : `All parameters are null`);
    }

    return;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
    