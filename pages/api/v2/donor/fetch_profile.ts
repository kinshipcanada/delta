import { NextApiRequest, NextApiResponse } from "next";
import * as Sentry from "@sentry/nextjs";
import { DonorEngine, FetchDonorProfileProps } from "@lib/methods/donors";

/**
 * @description Fetch a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body as FetchDonorProfileProps
        const donorEngine = new DonorEngine()
        const donor = await donorEngine.fetchDonorProfile(payload)
        return res.status(200).send(donor)
    } catch (error) {
        Sentry.captureException(error)
        console.error(error)
        return res.status(500).send({
            error: "Sorry, something went wrong fetching your donor profile",
        })
    }
}