/**
 * @description Interface representing an uploaded proof of donation. This is currently decoupled, but may be wrapped into the donation interface in the future.
 * @param proof_id - Unique identifier (uuid) for this proof
 * @param uploaded_at - The date this proof was uploaded.
 * @param message_to_donor - (Optional) A message to the donor. Can be a custom message, for example to let the donor know that the recipient wanted to personally thank them. 
 * @param amount_disbursed - the amount this proof shows has been received
 * @param donations[] - a list of IDs of associated donations
*/

import { z } from "zod"
import { Cause, CausesSchema } from "./causes"
import { CountryCode } from "./utils"
import { DonationSchema } from "./donation"

export interface ProofOfDonation {
    proof_id: string
    uploaded_at: Date
    message_to_donor?: string
    amount_disbursed: number
    donations: string[]
    region_distributed: CountryCode
    cause_matches: Cause[]
}

export const ProofSchema = z.object({
    proof_id: z.string().uuid(),
    uploaded_at: z.date().or(z.string()),
    message_to_donor: z.string().optional(),
    amount_disbursed: z.number(),
    donations: z.array(DonationSchema),
    region_distributed: z.string(),
    cause_matches: z.array(CausesSchema)
});