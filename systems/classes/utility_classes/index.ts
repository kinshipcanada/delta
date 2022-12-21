import { Donation } from "../donation/Donation";
import { Stripe } from "stripe"

export interface KinshipPaymentMethod {
    type: PaymentMethods,
    card_brand?: string,
    card_last_four?: string,
    card_exp_month?: number,
    card_exp_year?: number,
    created_at?: Date,
    checks?: {
        address_line1_check_passed: boolean,
        address_postal_code_check_passed: boolean,
        cvc_check_passed: boolean
    }
}

export const enum DeliveryMethod {
    EMAIL,
    PHONE
}

export interface donor_details {
    first_name: string,
    last_name: string,
    stripe_cus_id: string,
    email: string,
    phone_number?: number
    address: {
        line_address: string,
        postal_code: string,
        city: string,
        state: string,
        country: CountryList,
    },
    payment_methods?: any[],
}

export interface CartInterface {
    regions: any,
    causes: any
}

export const enum EventTypes {
    REPORT_GENERATED,
    NOTIFICATION,
    DONATION,
    RECEIPT_ISSUED,
    USER_UPDATED,
    INTERNAL_ERROR,
    STRIPE_CUSTOMER_CREATED,
    STRIPE_PAYMENT_METHOD_ATTACHED,
}

export const enum NotificationType {
    PROOF_AVAILABLE,
    DONATION_MADE,
    REFUND_PROCESSING,
    REFUND_ISSUED,
    REPORT_GENERATED,
    DONATION_SENT
}

export const enum CountryList {
    CANADA = 'ca',
    UNITED_STATES = 'us',
    UNDEFINED = 'null'
}

export const enum CurrencyList {
    CANADIAN_DOLLAR = 'cad',
    UNITED_STATES_DOLLAR = 'usd'
}

export const enum RegionList {
    AFRICA = "AF",
    INDIA = "IN",
    MIDDLE_EAST = "ME",
    CANADA = "CA"
}

export const enum STATE_LIST {
    AB = "Alberta",
    BC = "British Columbia",
    MB = "Manitoba",
    NB = "New Brunswick",
    NL = "Newfoundland and Labrador",
    NT = "Northwest Territories",
    NS = "Nova Scotia",
    NU = "Nunavut",
    ON = "Ontario",
    PE = "Prince Edward Island",
    QC = "Quebec",
    SK = "Saskatchewan",
    YT = "Yukon"
}

export type AmountForRegion = {
    [region_id in RegionList] : number
}

export interface Cause {
    cause: string,
    amount_in_cents: number,
    region: RegionList,
    recurring: boolean
}


export interface BaseApiResponse {
    status: 200 | 400 | 500,
    endpoint_called: string
}

export interface SimpleMessageResponse extends BaseApiResponse {
    message: string
}

export interface DonorResponse extends BaseApiResponse {
    donor: donor_details
}

export interface DonationResponse extends BaseApiResponse {
    donation: Donation
}

export interface BatchedDonationResponse extends BaseApiResponse {
    donations: Donation[]
}

export interface BatchedSimpleDonationResponse extends BaseApiResponse {
    donations: any[]
}

export interface DonationSummaryResponse extends BaseApiResponse {
    summary: SummaryStatement
}

export interface CartInterface {
    regions: any,
    causes: any
}

export interface SummaryStatement {
    /**
     * This interface defines the structure of a donation summary object.
     * 
     * @property {string} donor_email - The email of the donor
     * @property {number} total_donated - The total amount donated by the donor, in CAD cents
     * @property {total_eligible_estimate} total_eligible_estimate - The total amount eligible for tax receipt, in CAD cents
     * @property {donations} donations - An array of donation objects
     **/
    donor_email: string,
    total_donated: number,
    total_eligible_estimate: number,
    donations: UserFormattedDonation[]
}

export interface DonorAddress {
    line_address: string,
    state: string,
    city: string,
    postal_code: string,
    country: CountryList
}

export interface DatabaseDonation {
    donation_created?: string,
    donor?: string | null,
    email?: string,
    phone_number?: number,
    amount_in_cents?: number,
    native_currency?: CurrencyList,
    fees_covered?: number,
    fees_charged_by_stripe?: number,
    transaction_successful?: boolean,
    transaction_refunded?: boolean,
    payment_method?: KinshipPaymentMethod,
    donation_causes?: CartInterface,
    stripe_payment_intent_id?: string,
    stripe_charge_id?: string,
    stripe_balance_transaction_id?: string,
    stripe_customer_id?: string,
    livemode?: boolean,
    address_line_address?: DonorAddress["line_address"],
    address_country?: DonorAddress["country"],
    address_postal_code?: DonorAddress["postal_code"],
    address_city?: DonorAddress["city"],
    address_state?: DonorAddress["state"]
}

export interface UserFormattedDonation {
    id: string,
    donation_created: string,
    // Update this
    donor: string | null,
    email: string,
    phone_number: number,
    amount_in_cents: number,
    native_currency: CurrencyList,
    fees_covered: number,
    fees_charged_by_stripe: number,
    // Hardcoding true for now, later we will log attempted txns too
    transaction_successful: true,
    // Need to add this
    transaction_refunded: false,
    address_line_address: string,
    address_country: CountryList,
    address_postal_code: string,
    address_city: string,
    address_state: string,
    proof_available: boolean,
    livemode: boolean,
}

export const enum PaymentMethods {
    CARD = 'card',
    AFFIRM = 'affirm',
    ACSS_DEBIT = 'acss_debit',
    CUSTOMER_BALANCE = 'customer_balance'
}

/**
 * @section interfaces: these form templates for responses from stripe
 */
export interface StripeTags {
    payment_intent_id?: string,
    charge_id?: string,
    balance_transaction_id?: string,
    customer_id?: string,
    payment_method_id?: string
}


export interface raw_stripe_transaction_object {
    payment_intent_object: Stripe.PaymentIntent,
    charge_object: Stripe.Charge,
    balance_transaction_object: Stripe.BalanceTransaction,
    customer: Stripe.Customer,
    payment_method: Stripe.PaymentMethod
}

export interface DonationIdentifiers {
    payment_intent_id?: string,
    charge_id?: string,
    kinship_donation_id?: string
}