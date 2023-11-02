import { Donation, DonationSchema } from "@lib/classes/donation";
import { DonationIdentifiers } from "@lib/classes/utils";
import { fetchDonation } from "@lib/functions/donations";
import { generateIdentifiersFromStrings } from "@lib/utils/helpers";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    donation_id: z.string().min(8)
})

export const responseSchema = z.object({
  donation: DonationSchema.optional(),
  error: z.string().optional()
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const response = requestSchema.safeParse(req.body);

  if (!response.success) {
    return res.status(400).send({
        error: 'No donation_id provided. You must pass either a Kinship ID, Stripe charge id, or Stripe payment intent id.',
        donation: undefined
    });
  }

  try {
    const identifiers: DonationIdentifiers = generateIdentifiersFromStrings([response.data.donation_id])
    const donation: Donation = await fetchDonation(identifiers)

    return res.status(200).send({
        donation: donation,
        error: undefined
    })
  } catch (error) {
    // Log error
    
    return res.status(500).send({
        error: "Sorry, something went wrong fetching this donation",
        donation: undefined
    })
  }
}