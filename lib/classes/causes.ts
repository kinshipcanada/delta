import { z } from "zod";
import { CountryCode } from "./utils";

/**
 * @description Represents a cart, with each cause the donor is donating to and the total amount paid in cents (of all causes)
 * @param total_amount_paid_in_cents The total amount paid in cents (in the currency of the cart)
 * @param currency The currency of the cart
 * @param causes A map of causes and the amount paid in cents for each cause
 */

// causes: Cause[]

// Anywhere: region: none, label: anywhere, one_way false
// sehme_imam: region: "ir", label: Sehme Imam, one_way true
// sadaqah: region: none, label: Sadaqah, one_way false

export interface Cause {
    one_way: boolean // can this donation only match things in the smae cateogry? vision kinship is a one way donation, an anywhere donation is not
    label: string // e.g. Anywhere
    region?: CountryCode // countrycode
}

export const CausesSchema = z.object({
    region: z.string().optional(),
    one_way: z.boolean(),
    label: z.string()
});

import { faker } from '@faker-js/faker';

export const generateFakeCauses = (): Cause => {
    const cause: Cause = {
        region: "ca",
        one_way: faker.datatype.boolean(),
        label: "My Fake Cause"
    }
    
    return cause;
};