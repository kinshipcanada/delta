import { DonorApiResponse } from "@lib/classes/api";
import { fetchDonor } from "@lib/functions/donor";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
    donor_id: z.string().uuid().optional(),
    donor_email: z.string().email().optional()
})

/**
 * @description Fetches a donors profile
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    const parsedRequest = requestSchema.safeParse(req.body);

    if (!parsedRequest.success || !(parsedRequest.data.donor_id || parsedRequest.data.donor_email)) {
        Sentry.captureException("Invalid payload");
        const response: DonorApiResponse = { error: 'Invalid payload' }
        return res.status(400).send(response);
    }

    try {
        const donor = await fetchDonor(parsedRequest.data.donor_id, parsedRequest.data.donor_email)
        const response: DonorApiResponse = { data: donor }
        return res.status(200).send(response)
    } catch (error) {
        Sentry.captureException(error);
        const response: DonorApiResponse = { error: "Sorry, something went wrong fetching this donor" }
        return res.status(500).send(response)
    }
}

