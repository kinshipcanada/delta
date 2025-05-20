import { NextApiRequest, NextApiResponse } from "next";
import { DonorEngine } from "@lib/methods/donors";
import { Donor } from "@prisma/client";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Creates a new donor profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body.donor as Donor
        const donorEngine = new DonorEngine()
        const profile = await donorEngine.createDonorProfile(payload)
        return res.status(200).send({ data: profile })
    } catch (error) {
        if (error instanceof Error) {
            posthogLogger(error);
        } else {
            posthogLogger(new Error('An unknown error occurred'));
        }
        console.error(`Error calling api/v2/donor/create: ${error}`)
        return res.status(500).send({
            error: "Sorry, something went wrong creating your donor profile",
        })
    }
}