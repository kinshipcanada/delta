import Stripe from 'stripe';
import { ObjectIdApiResponse } from '@lib/classes/api';
import { NextApiRequest, NextApiResponse } from "next";
import { Country, Donation, DonationStatus } from '@prisma/client';
import { DonorEngine } from '@lib/methods/donors';
import { posthogLogger } from '@lib/posthog-server';

// TODO: update after authentication is removed
const createDonationMetadata = (donation: Donation, donorInfo: { [key: string]: string }, causesData: any[]) => {
    return {
        donationId: donation.id,
        date: new Date().toDateString(),
        syncStatus: "unsynced",
        status: DonationStatus.PROCESSING,
        amountDonatedInCents: donation.amountDonatedInCents,
        feesDonatedInCents: donation.feesDonatedInCents,
        donorFirstName: donorInfo.firstName,
        donorMiddleName: donorInfo.middleName,
        donorLastName: donorInfo.lastName,
        donorEmail: donorInfo.email,
        donorAddressLineAddress: donorInfo.lineAddress,
        donorAddressCity: donorInfo.city,
        donorAddressState: donorInfo.state,
        donorAddressCountry: donorInfo.country as Country,
        donorAddressPostalCode: donorInfo.postalCode,
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

    const donation: Donation = req.body.donation
    const donorInfo: { [key: string]: string } = req.body.donorInfo
    const causesData: any[] = req.body.causesData || [];

    try {

        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2023-08-16"
        })

        let stripeCustomerId: string;

        const donorEngine = new DonorEngine()
        stripeCustomerId = await donorEngine.createStripeProfile({
            donorFirstName: donorInfo.firstName,
            donorMiddleName: donorInfo.middleName,
            donorLastName: donorInfo.lastName,
            donorEmail: donorInfo.email,
            donorAddressLineAddress: donorInfo.lineAddress,
            donorAddressCity: donorInfo.city,
            donorAddressState: donorInfo.state,
            donorAddressCountry: donorInfo.country as Country,
            donorAddressPostalCode: donorInfo.postalCode,
            stripeCustomerIds: []
        })

        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: donation.amountChargedInCents,
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