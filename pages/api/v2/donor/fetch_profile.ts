import { NextApiRequest, NextApiResponse } from "next";
import { DonorEngine, FetchDonorProfileProps } from "@lib/methods/donors";
import { posthogLogger } from '@lib/posthog-server';

/**
 * @description Fetch a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    try {
        const payload = req.body as FetchDonorProfileProps
        console.log(`Fetching donor with props: ${payload.id}, ${payload.email}`)
        const donorEngine = new DonorEngine()
        const donor = await donorEngine.fetchDonorProfile(payload)
        return res.status(200).send({ data: donor })
    } catch (error) {
        if (error instanceof Error) {
            posthogLogger(error)
        } else {
            posthogLogger(new Error('An unknown error occurred'))
        }
        console.error(error)
        return res.status(500).send({
            error: "Sorry, something went wrong fetching your donor profile",
        })
    }
}