import { DonationGroupApiResponse } from "@lib/classes/api";
import { Donation } from "@lib/classes/donation";
import { adminFetchDonationsBySpecs, fetchAllDonationsForDonor } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    start_date: z.string().pipe( z.coerce.date() ).optional(),
    end_date: z.string().pipe( z.coerce.date() ).optional(),
    payment_method: z.string().optional(),
    page: z.number().optional(),
    offset: z.number().optional()
})

export type ApiAdminDonationsFetchRequestSchema = z.infer<typeof requestSchema>

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
    const donations: Donation[] = await adminFetchDonationsBySpecs();

    const response: DonationGroupApiResponse = { data: donations }
    return res.status(200).send(response)
  } catch (error) {
    // Log error
    console.error(error)

    const response: DonationGroupApiResponse = { error: 'Sorry, something went wrong fetching your donations' }
    return res.status(500).send(response);
  }
}