import { Donation } from "../../../systems/classes/donation/Donation";
import { Donor } from "../../../systems/classes/donors/Donor";
import { DatabaseDonation, FormattedCart, NotificationType, donor_details } from "../../../systems/classes/utility_classes";
import { KinshipPaymentMethod } from "../../../systems/classes/utility_classes";
import { EventTypes, SimpleMessageResponse } from "../../../systems/classes/utility_classes";
import { upload_donation_to_database, upload_event_to_database } from "../../../systems/functions/database";
import { KinshipLogger } from "../../../systems/functions/logger";
import { notify_about_donation } from "../../../systems/functions/notifications";
import resend_receipt, { ResendReceiptResponse } from "../../../systems/methods/resend_receipt";

export default async function handler(req, res) {
    try {
        const {
            donation_created,
            email,
            amount_in_cents,
            fees_covered,
            payment_method,
            donation_causes,
            address_line_address,
            address_state,
            address_city,
            address_postal_code,
            address_country,
            donation_method,
            donor_object,
        } = req.body

        if (
            donation_created == null || donation_created == undefined || 
            email == null || email == undefined || 
            amount_in_cents == null || amount_in_cents == undefined || 
            fees_covered == null || fees_covered == undefined || 
            payment_method == null || payment_method == undefined || 
            donation_causes == null || donation_causes == undefined || 
            address_line_address == null || address_line_address == undefined || 
            address_state == null || address_state == undefined || 
            address_city == null || address_city == undefined || 
            address_postal_code == null || address_postal_code == undefined || 
            address_country == null || address_country == undefined || 
            donation_method == null || donation_method == undefined ||
            donor_object == null || donor_object == undefined
        ) {
            res.status(500).send({
                status: 500,
                message: 'Missing required fields',
                endpoint_called: '/api/admin/manual'
            });
            return
        }
        const formattedPaymentMethod = payment_method as KinshipPaymentMethod
        const formattedCart = donation_causes as FormattedCart

        const formatted_donation: DatabaseDonation = {
            donation_created: new Date(donation_created).toDateString(),
            email: email,
            amount_in_cents: amount_in_cents,
            fees_covered: fees_covered,
            fees_charged_by_stripe: 0,
            transaction_successful: true,
            transaction_refunded: false,
            payment_method: formattedPaymentMethod,
            donation_causes: formattedCart,
            livemode: process.env.LIVEMODE === "true" ? true : false,
            address_line_address: address_line_address,
            address_country: address_country,
            address_postal_code: address_postal_code,
            address_city: address_city,
            address_state: address_state,
            donor_object: donor_object,
        }

        await upload_donation_to_database(formatted_donation)
        await KinshipLogger(EventTypes.DONATION_MADE, "Manually generated receipt uploaded successfully", [formatted_donation.email])

        // This is spagetti, I'm gonna refactor the whole codebase today
        const donorDetails: donor_details = {
            first_name: donor_object.first_name,
            last_name: donor_object.last_name,
            stripe_cus_id: 'none',
            email: email,
            address: {
                line_address: address_line_address,
                postal_code: address_postal_code,
                city: address_city,
                state: address_state,
                country: address_country,
            },
            payment_methods: [
                donation_method
            ],
        }
        const donorObject = new Donor(
            donorDetails,
            null
        )
        const donationObject = new Donation(
            donorObject,
            process.env.LIVEMODE === "true" ? true : false,
            new Date(formatted_donation.donation_created),
            formatted_donation.amount_in_cents,
            null,
            formatted_donation.fees_covered,
            formatted_donation.fees_charged_by_stripe,
            formatted_donation.payment_method,
            null,
            null,
            null,
            null,
            false,
        )
        await notify_about_donation(donationObject, NotificationType.DONATION_MADE)

        const response: SimpleMessageResponse = {
            status: 200,
            endpoint_called: `/api/admin/manual`,
            message: "Receipt successfully generated and sent"
        }

        res.status(200).send(response);

    } catch (e) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/admin/resend`,
            message: e.message
        });
    }
};