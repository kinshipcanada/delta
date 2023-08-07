
import { ErroredResponse } from "../../../../system/classes/api";
import { createStripeCustomer } from "../../../../system/utils/stripe";
import { Address } from "../../../../system/classes/address";
import { CountryList } from "../../../../system/classes/utils";
import { verifyAllParametersExist } from "../../../../system/utils/helpers";
import { MessageResponse } from "../../../../system/classes/api"; 
import { createDonor } from "../../../../system/functions/donor";

/**
 * @description Creates a Stripe customer profile, given a donor's details, and setups up their Kinship profile in the database.
 */
export default async function handler(req, res) {
    try {
        const { email, donor_id, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country } = req.body

        verifyAllParametersExist("Not all parameters provided. You must provide an email, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country", email, donor_id, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country);

        const completedDonorProfile = await createDonor(
            donor_id,
            first_name,
            last_name,
            email,
            address_line_address,
            address_postal_code,
            address_city,
            address_state,
            address_country
        )

        return completedDonorProfile ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/profile/create`,
        } as MessageResponse) : new Error("Something went wrong creating your donor profile");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/profile/create`,
            error: error.message
        } as ErroredResponse);
    }
};
