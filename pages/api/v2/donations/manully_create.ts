import { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { DonationEngine } from "@lib/methods/donations";
import { Donation } from "@prisma/client";

/**
 * @description Allows admin to create a new donation manually
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body.donation as Donation
        const donationEngine = new DonationEngine()
        const donation: Donation = await donationEngine.createDonationManually(payload)
        return res.status(200).send({ data: donation })
    } catch (error) {
        Sentry.captureException(error)
        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
        })
    }
}