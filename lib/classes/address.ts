/**
 * @description Represents a simple address, with a line address, postal code, city, state, and country
 * @param line_address The line address of the address
 */
export interface Address {
    line_address: string;
    postal_code: string;
    city: string;
    state: string;
    country: string;
}

import { z } from "zod"

export const AddressSchema = z.object({
    line_address: z.string(),
    postal_code: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
});