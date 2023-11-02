import { BaseApiResponseSchema } from "@lib/classes/api";
import { DonorSchema } from "@lib/classes/donor";
import { fetchDonor } from "@lib/functions/donor";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

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
    const response = requestSchema.safeParse(req.body);

    if (!response.success || !(response.data.donor_id || response.data.donor_email)) {
        return res.status(400).send({
            error: 'Invalid payload',
        });
    }

    try {
        const donor = await fetchDonor(response.data.donor_id, response.data.donor_email)

        return res.status(200).send({
            donor: donor
        })
    } catch (error) {
        // Log error
        console.error(error)
        
        return res.status(500).send({
            error: "Sorry, something went wrong fetching this donor",
        })
    }
}

