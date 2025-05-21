import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine } from "@lib/methods/donations";
import { Donation, Cause } from "@prisma/client";
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
        console.log("Webhook received:", JSON.stringify(req.body, null, 2));
        
        const donationEngine = new DonationEngine()
        const donation: Donation = await donationEngine.createDonationByWebhook(req.body.data.object.id)
        
        const metadata = req.body.data.object.metadata || {};
        const causesString = metadata.causes;
        let causesArray: any[] = [];

        if (causesString && typeof causesString === 'string') {
            try {
                causesArray = JSON.parse(causesString);
            } catch (parseError) {
                console.error("Error parsing causesData from metadata:", parseError);
            }
        }
        
        for (const cause of causesArray) {
            if (donation && donation.id && cause) {
                await donationEngine.saveCauseForDonation(donation.id, cause);
            }
        }
        
        const notificationEngine = new NotificationEngine()
        
        await notificationEngine.emailDonationReceipt(donation, req.body.data.object.metadata || {})
        
        return res.status(200).send({ data: donation })
    } catch (error) {
        console.error(error)
        if (error instanceof Error) {
            console.error("Error stack:", error.stack);
            posthogLogger(error);
        } else {
            posthogLogger(new Error('An unknown error occurred'));
        }
        
        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
        });
    }
}