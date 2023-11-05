import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { DonorSchema } from "@lib/classes/donor";
import { createDonor } from "@lib/functions/donor";
import { NoDataApiResponse } from "@lib/classes/api";

const requestSchema = z.object({
    donor: DonorSchema,
})

/**
 * @description Creates a Stripe customer profile, given a donor's details, and setups up their Kinship profile in the database.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success || !parsedRequest.data.donor.donor_id) {
    const response: NoDataApiResponse = { error: "Invalid payload" }
    return res.status(400).send(response);
  }

  try {
    
    const donor = parsedRequest.data.donor

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

    return res.status(200).send({ } as NoDataApiResponse)
  } catch (error) {
    console.error(error)
    // Log error
    
    const response: NoDataApiResponse = { error: "Sorry, something went wrong creating your profile" }
    return res.status(500).send(response)
  }
}