import { DonationApiResponse } from "@lib/classes/api";
import { Donation } from "@lib/classes/donation";
import { DonationIdentifiers } from "@lib/classes/utils";
import { fetchDonation } from "@lib/functions/donations";
import { generateIdentifiersFromStrings } from "@lib/utils/helpers";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
  donation_id: z.string().min(8)
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    Sentry.captureException("Invalid payload")
    const response: DonationApiResponse = { error: 'No donation_id provided. You must pass either a Kinship ID, Stripe charge id, or Stripe payment intent id.' }
    return res.status(400).send(response);
  }

  try {
    const identifiers: DonationIdentifiers = generateIdentifiersFromStrings([parsedRequest.data.donation_id])
    const donation: Donation = await fetchDonation(identifiers)

    const response: DonationApiResponse = { data: donation }
    return res.status(200).send(response)
  } catch (error) {
    Sentry.captureException(error)
    const response: DonationApiResponse = { error: "Sorry, something went wrong fetching this donation" }
    return res.status(500).send(response)
  }
}