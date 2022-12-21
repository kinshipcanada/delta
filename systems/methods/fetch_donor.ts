import { KinshipError } from "../classes/errors/KinshipError";
import { donor_details, KinshipPaymentMethod, PaymentMethods } from "../classes/utility_classes";
import { fetch_donor_from_database } from "../helpers/database";
import { fetch_payment_methods, fetch_specific_payment_method } from "../helpers/stripe";

export default async function fetch_donor(donor_id) : Promise<donor_details> {
    try { 
        const donor_response = await fetch_donor_from_database(donor_id)
        const donor = donor_response[0]

        let raw_donor_payment_methods = []

        for (const payment_method of donor.payment_methods) {
            raw_donor_payment_methods.push(fetch_specific_payment_method(payment_method))
        }

        const resolved_donor_payment_methods = await Promise.all(raw_donor_payment_methods)

        let donor_payment_methods = []

        for (const payment_method of resolved_donor_payment_methods) {
            const payment_method_object: KinshipPaymentMethod = {
                type: PaymentMethods.CARD,
                card_brand: payment_method.card.brand,
                card_last_four: payment_method.card.last4,
                card_exp_month: payment_method.card.exp_month,
                card_exp_year: payment_method.card.exp_year,
                created_at: new Date(payment_method.created * 1000),
            }

            donor_payment_methods.push(payment_method_object)
        }

        const donor_details: donor_details = {
            first_name: donor.first_name,
            last_name: donor.last_name,
            stripe_cus_id: donor.stripe_customer_ids[0],
            email: donor.email,
            phone_number: donor.phone_number,
            address: {
                line_address: donor.address_line_address,
                postal_code: donor.address_postal_code,
                city: donor.address_city,
                state: donor.address_state,
                country: donor.address_country,
            },
            payment_methods: donor_payment_methods,
        }

        return donor_details
    } catch (error) {
        new KinshipError(error, "/api/methods/fetch_donor", "fetch_donor")
        throw new Error("Error fetching donor details")
    }
}