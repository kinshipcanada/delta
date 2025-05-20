import Stripe from 'stripe';
import { ObjectIdApiResponse } from '@lib/classes/api';
import { NextApiRequest, NextApiResponse } from "next";
import { Donation, DonationStatus } from '@prisma/client';
import { DonorEngine } from '@lib/methods/donors';
import { posthogLogger } from '@lib/posthog-server';

// TODO: update after authentication is removed
const createDonationMetadata = (donation: Donation) => {
    return {
        donationId: donation.id,
        date: new Date().toDateString(),
        syncStatus: "unsynced",
        status: DonationStatus.PROCESSING,
        amountDonatedInCents: donation.amountDonatedInCents,
        feesDonatedInCents: donation.feesDonatedInCents,
        // TODO: remove after authentication is removed
        // donorFirstName: donation.donorFirstName,
        // donorMiddleName: donation.donorMiddleName,
        // donorLastName: donation.donorLastName,
        // donorEmail: donation.donorEmail,
        // donorAddressLineAddress: donation.donorAddressLineAddress,
        // donorAddressCity: donation.donorAddressCity,
        // donorAddressState: donation.donorAddressState,
        // donorAddressCountry: donation.donorAddressCountry,
        // donorAddressPostalCode: donation.donorAddressPostalCode,
        donorFirstName: "firstName",
        donorMiddleName: "middleName",
        donorLastName: "lastName",
        donorEmail: "zaltaf@gmail.com",
        donorAddressLineAddress: "address",
        donorAddressCity: "city",
        donorAddressState: "state",
        donorAddressCountry: "country",
        donorAddressPostalCode: "postalCode",
    }
}

/**
 * @description Fetches a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

    const donation: Donation = req.body.donation

    try {

        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        let stripeCustomerId: string;

        if (donation.stripeCustomerId) {
            // Get the first stripe customer id to use for this donor
            stripeCustomerId = donation.stripeCustomerId
        } else {
            // If there is no created customer_id, see if we can fetch one from stripe, otherwise create one.
            // We have to do this, because we can't attach a billing address or customer objects directly to Stripe payment intents, just the id as a string
            const donorEngine = new DonorEngine()
            stripeCustomerId = await donorEngine.createStripeProfile({
                // donorFirstName: donation.donorFirstName,
                // donorMiddleName: donation.donorMiddleName,
                // donorLastName: donation.donorLastName,
                // donorEmail: donation.donorEmail,
                // donorAddressLineAddress: donation.donorAddressLineAddress,
                // donorAddressCity: donation.donorAddressCity,
                // donorAddressState: donation.donorAddressState,
                // donorAddressCountry: donation.donorAddressCountry,
                // donorAddressPostalCode: donation.donorAddressPostalCode,
                // TODO: remove after authentication is removed
                donorFirstName: "firstName",
                donorMiddleName: "middleName",
                donorLastName: "lastName",
                donorEmail: "zaltaf@gmail.com",
                donorAddressLineAddress: "address",
                donorAddressCity: "city",
                donorAddressState: "state",
                donorAddressCountry: "CA",
                donorAddressPostalCode: "M4A 0J5",
                stripeCustomerIds: []
            })
        }

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: donation.amountChargedInCents,
            // Causes is added here for backwards compatability
            metadata: createDonationMetadata(donation),
            customer: stripeCustomerId,
            currency: 'cad',
            // TODO: remove after authentication is removed
            // receipt_email: donation.donorEmail,
            receipt_email: "zaltaf@gmail.com",
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