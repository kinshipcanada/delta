import Stripe from 'stripe';
import { ObjectIdApiResponse } from '@lib/classes/api';
import { NextApiRequest, NextApiResponse } from "next";
import { Country, donation, status_enum } from '@prisma/client';
import { DonorEngine } from '@lib/methods/donors';
import { posthogLogger } from '@lib/posthog-server';

// TODO: update after authentication is removed
const createDonationMetadata = (donation: donation, donorInfo: { [key: string]: string }, causesData: any[]) => {
    return {
        donation_id: donation.id,
        date: new Date().toDateString(),
        sync_status: "unsynced",
        status: status_enum.PROCESSING,
        amount_donated_cents: donation.amount_donated_cents,
        fees_covered_by_donor: donation.fees_covered_by_donor,
        donor_first_name: donorInfo.firstName,
        donor_middle_name: donorInfo.middleName,
        donor_last_name: donorInfo.lastName,
        donor_email: donorInfo.email,
        donor_address_line_address: donorInfo.lineAddress,
        donor_address_city: donorInfo.city,
        donor_address_state: donorInfo.state,
        donor_address_country: donorInfo.country as Country,
        donor_address_postal_code: donorInfo.postalCode,
        causes: JSON.stringify(causesData)
    }
}

/**
 * @description Fetches a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

    const donation: donation = req.body.donation
    const donorInfo: { [key: string]: string } = req.body.donorInfo
    const causesData: any[] = req.body.causesData || [];

    try {

        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        let stripeCustomerId: string;

        const donorEngine = new DonorEngine()
        stripeCustomerId = await donorEngine.createStripeProfile({
            donor_first_name: donorInfo.firstName,
            donor_middle_name: donorInfo.middleName,
            donor_last_name: donorInfo.lastName,
            donor_email: donorInfo.email,
            donor_address_line_address: donorInfo.lineAddress,
            donor_address_city: donorInfo.city,
            donor_address_state: donorInfo.state,
            donor_address_country: donorInfo.country as Country,
            donor_address_postal_code: donorInfo.postalCode,
            stripe_customer_ids: []
        })

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: donation.amount_charged_cents,
            metadata: createDonationMetadata(donation, donorInfo, causesData),
            customer: stripeCustomerId,
            currency: 'cad',
            receipt_email: donorInfo.email,
            payment_method_types: ['acss_debit', 'card'],
            payment_method_options: {
                acss_debit: {
                    mandate_options: {
                        payment_schedule: 'sporadic',
                        transaction_type: 'personal',
                    },
                },
            },
        });

        if (!paymentIntent.client_secret) {
            throw new Error("No client secret returned")
        }

        const response: ObjectIdApiResponse = {
            data: paymentIntent.client_secret
        }
        res.status(200).send(response);
    } catch (error) {
        console.error(`Error creating Stripe Payment Intent for donation: ${error}`)
        posthogLogger(error as Error)
        const response: ObjectIdApiResponse = { error: "Sorry, something went wrong on our end" }
        res.status(500).json(response);
    }
}