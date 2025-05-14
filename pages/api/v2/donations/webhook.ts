import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine } from "@lib/methods/donations";
import { Donation } from "@prisma/client";
import { NotificationEngine } from "@lib/methods/notifications";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Creates a new donation. Only to be called by Stripe's webhook
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const donationEngine = new DonationEngine()
        const donation: Donation = await donationEngine.createDonationByWebhook(req.body.data.object.id)
        const notificationEngine = new NotificationEngine()
        await notificationEngine.emailDonationReceipt(donation)
        return res.status(200).send({ data: donation })
    } catch (error) {
        console.error(error)
        posthogLogger(error)
        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
        })
    }
}