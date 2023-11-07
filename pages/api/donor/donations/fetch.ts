import { DonationGroupApiResponse } from "@lib/classes/api";
import { Donation } from "@lib/classes/donation";
import { fetchAllDonationsForDonor } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
  donor_email: z.string().email()
})

/**
 * @description Fetches all donations for a given donor
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const response: DonationGroupApiResponse = { error: 'No donor email provided' }
    return res.status(400).send(response);
  }

  try {
    const donations: Donation[] = await fetchAllDonationsForDonor(parsedRequest.data.donor_email);

    const response: DonationGroupApiResponse = { data: donations }
    return res.status(200).send(response)
  } catch (error) {
    Sentry.captureException(error)
    const response: DonationGroupApiResponse = { error: 'Sorry, something went wrong fetching your donations' }
    return res.status(500).send(response);
  }
}