import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine } from "@lib/methods/donations";
import { Donation } from "@prisma/client";
import { NotificationEngine } from "@lib/methods/notifications";
import { captureServerException } from '@lib/posthog-server';

/**`
 * @description Allows admin to create a new donation manually
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body.donation as Donation
        console.log("Received payload: ")
        console.log(payload)
        const donationEngine = new DonationEngine()
        const donation: Donation = await donationEngine.createDonationManually(payload)
        const notificationEngine = new NotificationEngine()
        await notificationEngine.emailDonationReceipt(donation)
        return res.status(200).send({ data: donation })
    } catch (error) {
        console.error(error)
        captureServerException(error)
        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
        })
    }
}