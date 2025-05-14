import { NextApiRequest, NextApiResponse } from "next";
import { DonorEngine } from "@lib/methods/donors";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Creates a new donor profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body.email as string
        const donorEngine = new DonorEngine()
        const donorExists = await donorEngine.checkIfDonorExists(payload)
        return res.status(200).send({ data: donorExists })
    } catch (error) {
        posthogLogger(error)
        console.error(`Error calling api/v2/donor/create: ${error}`)
        return res.status(500).send({
            error: "Sorry, something went wrong checking this donor profile",
        })
    }
}