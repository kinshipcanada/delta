import { Address } from "../classes/address";
import { Donor } from "../classes/donor";
import { CountryList } from "../classes/utils";
import { fetchDonorFromDatabase, updateDonorInDatabase } from "../utils/database";
import { formatDonorFromDatabase } from "../utils/formatting";
import { isValidCountryCode } from "../utils/helpers";
import { isValidUUIDV4 as verifyUUID } from 'is-valid-uuid-v4';
import { createStripeCustomer } from "../utils/stripe";

export async function createDonor(
    donorId: string,
    firstName: string,
    middleName: string | null,
    lastName: string,
    email: string,
    phoneNumber: number | null,
    lineAddress: string,
    postalCode: string,
    city: string,
    state: string,
    country: string
): Promise<Donor> {

    if (!isValidCountryCode(country)) {
        throw new Error("Invalid country code provided. Please use a valid ISO 3166-1 alpha-2 country code.")
    }
    
    if (!verifyUUID(donorId)) {
        throw new Error("Invalid donor_id provided. Please provide a valid UUID v4.")
    }

    const address: Address = {
        line_address: lineAddress,
        postal_code: postalCode,
        city: city,
        state: state,
        country: country as CountryList
    }

    const stripeCustomer = await createStripeCustomer(email, donorId, firstName, lastName, address);
    
    const donor: Donor = {
        donor_id: donorId,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        admin: false,
        address: address,
        stripe_customer_ids: [
            stripeCustomer.data.user.id
        ]
    }

    return donor
}

export async function fetchDonor(donorId?: string, donorEmail?: string): Promise<Donor> {
    if (donorId == null && donorEmail == null) {
        throw new Error('No valid identifiers provided. You must provide at least one of the following: donor_id, donor_email.')
    }

    try {
        return formatDonorFromDatabase(await fetchDonorFromDatabase(donorId, donorEmail))
    } catch (error) {
        // We should internally log the error here. Not passing it to the client.
        throw new Error("Error fetching donor from database.")
    }
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
    address_country: string
): Promise<Donor> {
    if (!verifyUUID(donorId)) {
        throw new Error("Invalid donor_id provided. Please provide a valid UUID v4.")
    }

    try {
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
            country: address_country as CountryList
        }
            
        const updatedDonor: Donor = {
            donor_id: donorId,
            first_name: firstName,
            middle_name: existingDonorObject.middle_name,
            last_name: lastName,
            email: email,
            phone_number: existingDonorObject.phone_number,
            admin: existingDonorObject.admin,
            address: address,
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
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}