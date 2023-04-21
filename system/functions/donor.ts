import { Address } from "../classes/address";
import { CreateDonorResponse, ErroredResponse, FetchDonorResponse } from "../classes/api";
import { Donor } from "../classes/donor";
import { CountryList } from "../classes/utils";
import { fetchDonorFromDatabase } from "../utils/database";
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
): Promise<CreateDonorResponse | ErroredResponse> {

    if (!isValidCountryCode(country)) {
        return {
            status: 500,
            endpoint_called: 'createDonor',
            error: 'Invalid country code provided. Please use a valid ISO 3166-1 alpha-2 country code.'
        }
    }
    
    if (!verifyUUID(donorId)) {
        return {
            status: 500,
            endpoint_called: 'createDonor',
            error: 'Invalid donor_id provided. Please provide a valid UUID v4.'
        }
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
        address: address,
        stripe_customer_ids: [
            stripeCustomer.data.user.id
        ]
    }

    return {
        status: 200,
        endpoint_called: 'createDonor',
        donor: donor
    }
}

export async function fetchDonor(donorId?: string, donorEmail?: string): Promise<FetchDonorResponse | ErroredResponse> {
    if (donorId == null && donorEmail == null) {
        return {
            status: 500,
            endpoint_called: 'fetchDonor',
            error: 'No valid identifiers provided. You must provide at least one of the following: donor_id, donor_email.'
        }
    }

    try {
        return {
            status: 200,
            endpoint_called: 'fetchDonor',
            donor: formatDonorFromDatabase(await fetchDonorFromDatabase(donorId, donorEmail))
        }
    } catch (error) {
        return {
            status: 500,
            endpoint_called: 'fetchDonor',
            error: error.message
        }
    }
}