import { Address, AddressSchema } from "./address";
import { z } from "zod";
import { faker } from '@faker-js/faker';

/**
 * @description Interface representing a donor. Supports logged in and anonymous donors.
 * @param donor_id - The Kinship Id of the donor. If the donor is anonymous/not logged in, this will be null.
 * @param first_name - The first name of the donor.
 * @param middle_name - The middle name of the donor. Optional.
 * @param last_name - The last name of the donor.
 * @param email - The email of the donor.
 * @param address - The address of the donor, as an Address object.
 * @param stripe_customer_ids - An array of Stripe customer ids associated with the donor.
 */

export interface Donor {
    donor_id?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    address: Address;
    admin: boolean;
    set_up: boolean;
    stripe_customer_ids: string[];
}

export const DonorSchema = z.object({
    donor_id: z.string().uuid().optional(),
    first_name: z.string().min(1),
    middle_name: z.string().min(1).optional(),
    last_name: z.string().min(1),
    email: z.string().email(),
    address: AddressSchema,
    admin: z.boolean(),
    set_up: z.boolean(),
    stripe_customer_ids: z.array(z.string())
});

export const DonorResponseSchema = z.object({
    donor: DonorSchema
})

export function isDonor(obj: any): obj is Donor {
    return (
        typeof obj === 'object' &&
        'first_name' in obj &&
        'last_name' in obj &&
        'email' in obj &&
        'address' in obj &&
        'admin' in obj &&
        'set_up' in obj &&
        'stripe_customer_ids' in obj &&
        obj.first_name !== null &&
        obj.last_name !== null &&
        obj.email !== null &&
        obj.address !== null &&
        typeof obj.admin === 'boolean' &&
        typeof obj.set_up === 'boolean' &&
        Array.isArray(obj.stripe_customer_ids) &&
        obj.stripe_customer_ids.every((id: any) => typeof id === 'string')
    );
}

export const generateFakeDonor = (): Donor => {
    const donor: Donor = {
        donor_id: faker.string.uuid(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        address: {
          line_address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: "ON",
          postal_code: faker.location.zipCode(),
          country: "ca"
        },
        admin: false,
        set_up: faker.datatype.boolean(),
        stripe_customer_ids: [],
    }
    
    return donor;
};