import { Address } from "../classes/address";
import { Donor } from "../classes/donor";
import { setupDonorInDatabase, updateDonorInDatabase } from "../utils/database";
import { validate as verifyUUID } from 'uuid';
import { createStripeCustomer } from "../utils/stripe";
import { CountryCode } from "@lib/classes/utils";

export async function createDonor(
    donorId: string,
    firstName: string,
    lastName: string,
    email: string,
    lineAddress: string,
    postalCode: string,
    city: string,
    state: string,
    country: CountryCode
): Promise<Donor> {
    
    if (!verifyUUID(donorId)) {
        throw new Error("Invalid donor_id provided. Please provide a valid UUID v4.")
    }

    const address: Address = {
        line_address: lineAddress,
        postal_code: postalCode,
        city: city,
        state: state,
        country: country
    }

    const stripeCustomer = await createStripeCustomer(email, firstName, lastName, address, donorId);
    await setupDonorInDatabase(
        donorId,
        firstName, 
        lastName, 
        lineAddress,
        postalCode,
        city,
        state,
        country,
        stripeCustomer.id
    )

    const donor: Donor = {
        donor_id: donorId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        admin: false,
        address: address,
        set_up: true,
        stripe_customer_ids: [
            stripeCustomer.id
        ]
    }

    return donor
}

/**
 * @description Updates a donors profile. 
 * @param donorId 
 * @param existingDonorObject We take this in to do validation and not update fields if they are the same.
 * @param firstName 
 * @param lastName 
 * @param email 
 * @returns 
 */
export async function updateDonor(
    donorId: string,
    existingDonorObject: Donor,
    firstName: string,
    lastName: string,
    email: string,
    address_line_address: string,
    address_postal_code: string,
    address_city: string,
    address_state: string,
    address_country: CountryCode
): Promise<Donor> {
    if (!verifyUUID(donorId)) {
        throw new Error("Invalid donor_id provided. Please provide a valid UUID v4.")
    }

    if (existingDonorObject.first_name === firstName 
        && existingDonorObject.last_name === lastName 
        && existingDonorObject.email === email 
        && existingDonorObject.address.line_address === address_line_address 
        && existingDonorObject.address.postal_code === address_postal_code 
        && existingDonorObject.address.city === address_city 
        && existingDonorObject.address.state === address_state 
        && existingDonorObject.address.country === address_country
    ) {
        throw new Error("No changes detected. Please provide at least one field to update.")
    }

    const address: Address = {
        line_address: address_line_address,
        postal_code: address_postal_code,
        city: address_city,
        state: address_state,
        country: address_country
    }
        
    const updatedDonor: Donor = {
        donor_id: donorId,
        first_name: firstName,
        middle_name: existingDonorObject.middle_name,
        last_name: lastName,
        email: email,
        admin: existingDonorObject.admin,
        address: address,
        set_up: existingDonorObject.set_up,
        stripe_customer_ids: existingDonorObject.stripe_customer_ids
    }

    await updateDonorInDatabase(
        donorId,
        firstName,
        lastName,
        email,
        address_line_address,
        address_postal_code,
        address_city,
        address_state,
        address_country
    )

    return updatedDonor

}
