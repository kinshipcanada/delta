import { NoDataApiResponse } from "@lib/classes/api";
import { logFeedback } from "@lib/functions/feedback";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
    feedback: z.string(),
    donor_id: z.string().uuid(),
    anonymous: z.boolean().optional()
})

/**
 * @description Submits feedback from the frontend
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    Sentry.captureException("Invalid payload")
    const response: NoDataApiResponse = { error: 'Invalid payload' }
    return res.status(400).send(response);
  }

  try {
    await logFeedback(parsedRequest.data.feedback, parsedRequest.data.donor_id)

    return res.status(200).send({} as NoDataApiResponse)
  } catch (error) {
    Sentry.captureException(error)
    const response: NoDataApiResponse = { error: "Sorry, something went wrong submitting the feedback" }
    return res.status(500).send(response)
  }
}