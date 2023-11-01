import { CurrencyList } from "./utils";
import { z } from "zod";

export interface CauseMap {
    [key: string]: number
}

/**
 * @description Represents a cart, with each cause the donor is donating to and the total amount paid in cents (of all causes)
 * @param total_amount_paid_in_cents The total amount paid in cents (in the currency of the cart)
 * @param currency The currency of the cart
 * @param causes A map of causes and the amount paid in cents for each cause
 */
export interface Causes {
    total_amount_paid_in_cents: number
    currency: CurrencyList
    // Kinship specific identifiers for religious obligations
    is_imam_donation: boolean
    is_sadat_donation: boolean
    is_sadaqah: boolean
}

export const CausesSchema = z.object({
    total_amount_paid_in_cents: z.number(),
    currency: z.nativeEnum(CurrencyList),
    is_imam_donation: z.boolean(),
    is_sadat_donation: z.boolean(),
    is_sadaqah: z.boolean(),
});

import { faker } from '@faker-js/faker';

export const generateFakeCauses = (): Causes => {
    const cart: Causes = {
        total_amount_paid_in_cents: Math.floor(parseFloat(faker.finance.amount()) * 100),
        currency: CurrencyList.CAD,
        is_imam_donation: faker.datatype.boolean(),
        is_sadat_donation: faker.datatype.boolean(),
        is_sadaqah: faker.datatype.boolean(),
    }
    
    return cart;
};