import { logFeedback } from "@lib/functions/feedback";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    feedback: z.string(),
    donor_id: z.string().uuid(),
    anonymous: z.boolean().optional()
})

export const responseSchema = z.object({
    error: z.string().optional()
})

/**
 * @description Submits feedback from the frontend
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const response = requestSchema.safeParse(req.body);

  if (!response.success) {
    return res.status(400).send({
        error: 'Invalid payload',
    });
  }

  try {
    await logFeedback(response.data.feedback, response.data.donor_id)

    return res.status(200).send({
        error: undefined
    })
  } catch (error) {
    // Log error
    
    return res.status(500).send({
        error: "Sorry, something went wrong submitting the feedback",
    })
  }
}