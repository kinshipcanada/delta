import { Address } from "./address";

/**
 * @description Interface representing a donor. Supports logged in and anonymous donors.
 * @param donor_id - The Kinship Id of the donor. If the donor is anonymous/not logged in, this will be null.
 * @param first_name - The first name of the donor.
 * @param middle_name - The middle name of the donor. Optional.
 * @param last_name - The last name of the donor.
 * @param email - The email of the donor.
 * @param phone_number - The phone number of the donor.
 * @param address - The address of the donor, as an Address object.
 * @param stripe_customer_ids - An array of Stripe customer ids associated with the donor.
 */

export interface Donor {
    donor_id?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone_number?: number;
    address: Address;
    stripe_customer_ids: string[];
}