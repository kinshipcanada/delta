import { DonationIdentifiers } from "@lib/classes/utils";
import { checkAndResendReceipt } from "@lib/functions/notifications";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
    donation_id: z.string().uuid().optional(),
    stripe_charge_id: z.string().optional(), 
    stripe_payment_intent_id: z.string().optional(),
})

export const responseSchema = z.object({
    error: z.string().optional()
})

/**
 * @description Resends a donation receipt to a donor, given the donation's identifiers
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const response = requestSchema.safeParse(req.body);

  if (!response.success || !(response.data.donation_id || response.data.stripe_charge_id || response.data.stripe_payment_intent_id)) {
    return res.status(400).send({
        error: 'Invalid payload',
    });
  }

  try {
    // To do: update generateIdentifiersFromStrings to include optionals so that we verify by prefix
    const identifiers: DonationIdentifiers = {
        donation_id: response.data.donation_id, 
        stripe_charge_id: response.data.stripe_charge_id, 
        stripe_payment_intent_id: response.data.stripe_payment_intent_id
    }
    
    await checkAndResendReceipt(identifiers)

    return res.status(200).send({
        error: undefined
    })
  } catch (error) {
    // Log error
    
    return res.status(500).send({
        error: "Sorry, something went wrong resending this receipt",
    })
  }
}