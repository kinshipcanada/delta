import { CountryList } from "./utils";

/**
 * @description Represents a simple address, with a line address, postal code, city, state, and country
 * @param line_address The line address of the address
 */
export interface Address {
    line_address: string;
    postal_code: string;
    city: string;
    state: string;
    country: CountryList | string;
}