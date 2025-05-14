import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine, FetchDonationProps } from "@lib/methods/donations";
import { Donation } from "@prisma/client";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Allows admin to create a new donation manually
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body as FetchDonationProps
        const donationEngine = new DonationEngine()
        const donation: Donation = await donationEngine.fetchDonation(payload)
        return res.status(200).send({ data: donation })
    } catch (error) {
        posthogLogger(error)
        return res.status(500).send({
            error: "Sorry, something went wrong fetching this donation",
        })
    }
}