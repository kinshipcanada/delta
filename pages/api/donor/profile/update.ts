import { DonorSchema } from "@lib/classes/donor";
import { updateDonor } from "@lib/functions/donor";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
  existing_donor_object: DonorSchema,
  updated_donor_object: DonorSchema
})

export const responseSchema = z.object({
  error: z.string().optional()
})

/**
 * @description Updates a customers profile. Only intended to be used by the frontend account management page UI
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    Sentry.captureException("Invalid payload")
    return res.status(400).send({
      error: 'Invalid payload',
    });
  }

  try {
    const existing_donor_object = parsedRequest.data.existing_donor_object
    const updated_donor_object = parsedRequest.data.updated_donor_object

    // To do: fix this
    await updateDonor(
        existing_donor_object.donor_id!,
        existing_donor_object,
        updated_donor_object.first_name,
        updated_donor_object.last_name,
        updated_donor_object.email,
        updated_donor_object.address.line_address,
        updated_donor_object.address.postal_code,
        updated_donor_object.address.city,
        updated_donor_object.address.state,
        updated_donor_object.address.country
    )

    return res.status(200).send({
        error: undefined
    })
  } catch (error) {
    Sentry.captureException(error)  
     
    return res.status(500).send({
      error: "Sorry, something went wrong updating your profile",
    })
  }
}