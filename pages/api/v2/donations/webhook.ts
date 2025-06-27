import { NextApiRequest, NextApiResponse } from "next";
import { DonationEngine } from "@lib/methods/donations";
import { donation, cause } from "@prisma/client";
import { NotificationEngine } from "@lib/methods/notifications";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Creates a new donation. Can be called by Stripe's webhook or directly with donation data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        console.log("Webhook received:", JSON.stringify(req.body, null, 2));
        
        const donationEngine = new DonationEngine();
        let donation: donation | null = null;

        // Handle direct donation data (e-transfer)
        if (req.body.donationData) {
            donation = await donationEngine.insertDonationObject(req.body.donationData);
            
            // Process causes if provided
            if (req.body.causesData && Array.isArray(req.body.causesData)) {
                for (const cause of req.body.causesData) {
                    if (donation && donation.id && cause) {
                        await donationEngine.saveCauseForDonation(donation.id, cause);
                    }
                }

                // Save distribution records for all causes
                if (donation && donation.id) {
                    await donationEngine.saveDistributionForDonation(donation, req.body.causesData);
                }
            }
        } 
        // Handle Stripe webhook data
        else if (req.body.data?.object?.id) {
            donation = await donationEngine.createDonationByWebhook(req.body.data.object.id);
            
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

            // Save distribution records for all causes
            if (donation && donation.id && causesArray.length > 0) {
                await donationEngine.saveDistributionForDonation(donation, causesArray);
            }
        } else {
            return res.status(400).send({
                error: "Invalid request body - missing donation data or Stripe charge ID"
            });
        }

        if (donation) {
            const notificationEngine = new NotificationEngine();
            await notificationEngine.emailDonationReceipt(donation, req.body.data?.object?.metadata || {});
        }
        
        return res.status(200).send({ data: donation });
    } catch (error) {
        console.error(error);
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