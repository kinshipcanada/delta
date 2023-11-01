import { DonationSchema } from "@lib/classes/donation";
import { createManualDonation } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    donation: DonationSchema
})

export const responseSchema = z.object({
    error: z.string().optional()
})

/**
 * @description Creates a new donation. Only to be called by admin panel
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    const response = requestSchema.safeParse(req.body);

    if (!response.success) {
        return res.status(400).send({
            error: undefined,
        });
    }

    try {
        await createManualDonation(response.data.donation)

        return res.status(200).send({
            error: null
        })
    } catch (error) {
        // Log error

        return res.status(500).send({
            error: "Sorry, something went wrong creating this donation",
        })
    }
}