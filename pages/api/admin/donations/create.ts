import { NoDataApiResponse } from "@lib/classes/api";
import { DonationSchema } from "@lib/classes/donation";
import { createManualDonation } from "@lib/functions/donations";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const requestSchema = z.object({
    donation: DonationSchema
})

// TODO: this is not used anywhere, we should remove it
export type ApiAdminDonationsCreateRequestSchema = z.infer<typeof requestSchema>

/**
 * @description Creates a new donation. Only to be called by admin panel
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    const parsedRequest = requestSchema.safeParse(req.body);

    if (!parsedRequest.success) {
        Sentry.captureException("Invalid payload")
        return res.status(400).send({
            error: "Invalid payload",
        } as NoDataApiResponse);
    }

    try {
        await createManualDonation(parsedRequest.data.donation)

        return res.status(200).send({} as NoDataApiResponse)
    } catch (error) {
        Sentry.captureException(error)
        const response: NoDataApiResponse = { error: "Sorry, something went wrong creating this donation" }
        return res.status(500).send(response)
    }
}