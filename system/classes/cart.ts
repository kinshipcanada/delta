import { CountryList } from "./utils";

export interface CauseMap {
    [key: string]: number
}

/**
 * @description Represents a cart, with each cause the donor is donating to and the total amount paid in cents (of all causes)
 * @param total_amount_paid_in_cents The total amount paid in cents (in the currency of the cart)
 * @param currency The currency of the cart
 * @param causes A map of causes and the amount paid in cents for each cause
 */
export interface Cart {
    total_amount_paid_in_cents: number
    currency: CountryList
    causes: CauseMap
}