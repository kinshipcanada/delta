import { NoDataApiResponse } from "@lib/classes/api";
import { DonationIdentifiers } from "@lib/classes/utils";
import { checkAndResendReceipt } from "@lib/functions/notifications";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    donation_id: z.string().uuid().optional(),
    stripe_charge_id: z.string().optional(), 
    stripe_payment_intent_id: z.string().optional(),
})

/**
 * @description Resends a donation receipt to a donor, given the donation's identifiers
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedRequest = requestSchema.safeParse(req.body);

  if (!parsedRequest.success || !(parsedRequest.data.donation_id || parsedRequest.data.stripe_charge_id || parsedRequest.data.stripe_payment_intent_id)) {
    const response: NoDataApiResponse = { error: "Invalid payload" }
    return res.status(400).send(response);
  }

  try {
    // To do: update generateIdentifiersFromStrings to include optionals so that we verify by prefix
    const identifiers: DonationIdentifiers = {
        donation_id: parsedRequest.data.donation_id, 
        stripe_charge_id: parsedRequest.data.stripe_charge_id, 
        stripe_payment_intent_id: parsedRequest.data.stripe_payment_intent_id
    }
    
    await checkAndResendReceipt(identifiers)

    return res.status(200).send({} as NoDataApiResponse)
  } catch (error) {
    // Log error
    console.error(error)
    
    const response: NoDataApiResponse = {  error: "Sorry, something went wrong resending this receipt" }
    return res.status(500).send(response)
  }
}