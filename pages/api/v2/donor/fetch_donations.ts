import { NextApiRequest, NextApiResponse } from "next";
import { DonorEngine } from "@lib/methods/donors";
import captureException from '@lib/instrumentation';

/**
 * @description Fetch donations for a given donor email
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body.donorEmail as string
        const donorEngine = new DonorEngine()
        const donations = await donorEngine.fetchDonationsForDonor(payload)
        return res.status(200).send({ data: donations })
    } catch (error) {
        captureException(error)
        console.error(error)
        return res.status(500).send({
            error: "Sorry, something went wrong fetching your donations",
        })
    }
}