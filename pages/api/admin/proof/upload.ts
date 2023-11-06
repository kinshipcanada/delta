import { NoDataApiResponse } from "@lib/classes/api";
import { CausesSchema } from "@lib/classes/causes";
import { allocateProof } from "@lib/functions/proof";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
  proof_id: z.string().uuid(),
  amount_disbursed: z.number(),
  message_to_donor: z.string().optional(),
  region_distributed: z.string(),
  causes: z.array(CausesSchema)
})

export type ApiAdminProofUploadRequestSchema = z.infer<typeof requestSchema>

/**
 * @description Uploads proof of donation, finds matching donors, and notifies them
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const response: NoDataApiResponse = { error: 'Invalid payload' }
    return res.status(400).send(response);
  }

  try {
    await allocateProof(
      parsedRequest.data.proof_id,
      parsedRequest.data.amount_disbursed,
      parsedRequest.data.region_distributed,
      parsedRequest.data.causes,
      parsedRequest.data.message_to_donor
    )
    const response: NoDataApiResponse = { }
    return res.status(200).send(response);

  } catch (error) {
    console.error(error)

    const response: NoDataApiResponse = { error: "Sorry, something went wrong uploading the proof" }
    return res.status(500).send(response);
  }
  
}