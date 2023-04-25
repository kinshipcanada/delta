
import { ErroredResponse } from "../../../../system/classes/api";
import { createStripeCustomer } from "../../../../system/utils/stripe";
import { Address } from "../../../../system/classes/address";
import { CountryList } from "../../../../system/classes/utils";
import { verifyAllParametersExist } from "../../../../system/utils/helpers";
import { SimpleMessageResponse } from "../../../../systems/classes/utility_classes";

/**
 * @description Creates a Stripe customer profile, given a donor's details
 */
export default async function handler(req, res) {
    try {
        const { email, donor_id, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country } = req.body

        verifyAllParametersExist("Not all parameters provided. You must provide an email, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country", email, donor_id, first_name, last_name, address_line_address, address_postal_code, address_city, address_state, address_country);

        const address: Address = {
            line_address: address_line_address,
            postal_code: address_postal_code,
            city: address_city,
            state: address_state,
            country: address_country as CountryList
        }

        const stripeCustomer = await createStripeCustomer(
            email,
            donor_id,
            first_name,
            last_name,
            address,
        );

        return stripeCustomer ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/profile/create`,
        } as SimpleMessageResponse) : new Error("Something went wrong creating your donor profile");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/profile/create`,
            error: error.message
        } as ErroredResponse);
    }
};
