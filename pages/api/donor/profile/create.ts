import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { DonorSchema } from "@lib/classes/donor";
import { createDonor } from "@lib/functions/donor";

const requestSchema = z.object({
    donor: DonorSchema,
})

export const responseSchema = z.object({
    error: z.string().optional()
})

/**
 * @description Creates a Stripe customer profile, given a donor's details, and setups up their Kinship profile in the database.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const response = requestSchema.safeParse(req.body);

  if (!response.success || !response.data.donor.donor_id) {
    return res.status(400).send({
        error: 'Invalid payload',
    });
  }

  try {
    
    const donor = response.data.donor

    await createDonor(
        donor.donor_id!,
        donor.first_name,
        donor.last_name,
        donor.email,
        donor.address.line_address,
        donor.address.postal_code,
        donor.address.city,
        donor.address.state,
        donor.address.country
    )

    return res.status(200).send({
        error: undefined
    })
  } catch (error) {
    // Log error
    
    return res.status(500).send({
        error: "Sorry, something went wrong creating your profile",
    })
  }
}