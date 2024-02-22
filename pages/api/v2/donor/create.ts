import { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { DonorEngine } from "@lib/methods/donors";
import { Donor } from "@prisma/client";

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
        return res.status(200).send({ profile })
    } catch (error) {
        Sentry.captureException(error)
        console.error(`Error calling api/v2/donor/create: ${error}`)
        return res.status(500).send({
            error: "Sorry, something went wrong creating your donor profile",
        })
    }
}