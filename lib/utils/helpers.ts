import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js'
import { DonationIdentifiers } from '../classes/utils';
import { validate as verifyUUID } from 'uuid';
import Stripe from "stripe";
import { countries } from "./constants";
import { NextApiResponse } from "next";
import { ZodType, z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)

export function isValidCountryCode(countryCode: string): boolean {
    return countries.some(country => country.value === countryCode);
}

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


export function verifyAllParametersExist(errorMessage: string, ...args: any[]): void {
    for (let i = 0; i < args.length; i++) {
        if (args[i] === null || args[i] === undefined) {
            throw new Error(errorMessage ? errorMessage : `Null parameter at index ${i}`);
        }
    }
}

export function verifyAtLeastOneParametersExists(errorMessage: string, ...args: any[]): void {
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

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function centsToDollars(amount: number | string) {
    if (typeof amount === 'string') {
        amount = parseFloat(amount);
    }

    return (amount / 100).toFixed(2);
}

export function dollarsToCents(amount: number | string): string {
    if (typeof amount === 'string') {
        amount = parseFloat(amount);
    }

    return (amount * 100).toFixed(0);
}

export function calculateStripeFee(amount_in_cents: number) {
    return (amount_in_cents * 0.029) + 30
}

export function parseFrontendDate(date: string | Date) {
    return new Date(Date.parse(date as string)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function isFloatOrInteger(input: any): boolean {
    if (typeof input === 'number') {
        // Check if it's a whole number (integer)
        if (Number.isInteger(input)) {
        return true;
        }
        
        // Check if it's a finite value (not NaN or Infinity)
        if (isFinite(input)) {
        return true;
        }
    } else if (typeof input === 'string') {
        // Use regular expressions to match a valid float or integer
        const floatRegex = /^-?\d+\.\d+$/;
        const integerRegex = /^-?\d+$/;

        if (floatRegex.test(input) || integerRegex.test(input)) {
        return true;
        }
    } else if (typeof input === 'boolean') {
        return true;
    }

    return false;
}

export function convertChildrenToStrings(parentObject: object) {
  const result: Stripe.MetadataParam = {};

  for (const key in parentObject) {
      if (parentObject.hasOwnProperty(key)) {
          let value: any = parentObject[key as keyof typeof parentObject];

          if (typeof value === "object") {
              value = JSON.stringify(value);
          }

          result[key] = value;
      }
  }

  return result;
}


export function extractStripePaymentIntentFromClientSecret(clientSecret: string): string {
    let clientSecretComponents = clientSecret.split("_")
    return `${clientSecretComponents[0]}_${clientSecretComponents[1]}`
}

export function generateZodSchema<T extends Record<string, z.ZodType<any, any, any>>>(obj: T): ZodType<{ [K in keyof T]: z.infer<T[K]> }, any, any> {
    const schemaObject: Record<string, any> = {};
  
    Object.keys(obj).forEach((key) => {
      schemaObject[key] = obj[key];
    });
  
    return z.object(schemaObject) as ZodType<{ [K in keyof T]: z.infer<T[K]> }, any, any>;
}