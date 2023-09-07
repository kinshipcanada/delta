import { Address } from "../../../system/classes/address";
import { ErroredResponse, MessageResponse } from "../../../system/classes/api";
import { Cart } from "../../../system/classes/cart";
import { Donation } from "../../../system/classes/donation";
import { Donor } from "../../../system/classes/donor";
import { CurrencyList } from "../../../system/classes/utils";
import { createManualDonation } from "../../../system/functions/donations";
import { verifyAllParametersExist } from "../../../system/utils/helpers";

/**
 * @description Creates a new donation. Only to be called by admin panel
 */
export default async function handler(req, res) {
    try {
        const {
            first_name,
            last_name, 
            email,
            address_line_address,
            address_state,
            address_city,
            address_postal_code,
            address_country,
            amount_in_cents,
            date_donated,

            is_imam_donation,
            is_sadat_donation,
            is_sadaqah,
        } = req.body
        
        verifyAllParametersExist(`Please provide all parameters`, first_name, last_name, email, address_line_address, address_state, address_city, address_postal_code, address_country, amount_in_cents, date_donated, is_imam_donation, is_sadat_donation, is_sadaqah)

        const donorAddress: Address = {
            line_address: address_line_address,
            state: address_state,
            city: address_city,
            postal_code: address_postal_code,
            country: address_country
        }

        const donor: Donor = {
            // Todo: implement fetching donor by email
            first_name: first_name,
            last_name: last_name,
            email: email,
            address: donorAddress,
            admin: false,
            stripe_customer_ids: [],
            set_up: true
        }

        const causes: Cart = {
            total_amount_paid_in_cents: amount_in_cents,
            currency: CurrencyList.CAD,
            causes: null,
            is_imam_donation: is_imam_donation,
            is_sadat_donation: is_sadat_donation,
            is_sadaqah: is_sadaqah
        }
        const donation: Donation = {
            identifiers: {},
            donor: donor,
            causes: null,
            live: process.env.NEXT_PUBLIC_LIVEMODE === "true",
            amount_in_cents: amount_in_cents,
            fees_covered: 0,
            fees_charged_by_stripe: 0,
            date_donated: date_donated
        }

        const donationWithId = await createManualDonation(donation)

        return donationWithId ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donation/createManually`,
            message: donation.identifiers.donation_id
        } as MessageResponse) : new Error("Something went wrong creating the donation.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donation/createManually`,
            error: error.message
        } as ErroredResponse);
    }
};