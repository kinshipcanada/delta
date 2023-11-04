import { Cause } from "@lib/classes/causes"
import { ProofOfDonation } from "@lib/classes/proof"
import { v4 as uuidv4 } from "uuid"

const allocateProof = (
    amount_disbursed: number,
    message_to_donor: string, 
    causes: Cause[]
) => {
    const proofId = uuidv4()
    // take in proof, consider amount and directions
    let proof: ProofOfDonation = {
        amount_disbursed: amount_disbursed,
        proof_id: proofId,
        uploaded_at: new Date(),
        message_to_donor: message_to_donor,
        donations: [],
        region_distributed: "ca",
        cause_matches: causes
    }

    // given list of existing donations, find nearest unfilled match, stopping once sum(match_balance) > proof amount 

    // Keep track of existing allocations

    // create object and notify donors
    return
}

const generateCoverLetterUrl = (proof: ProofOfDonation) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/coverletters/${proof.proof_id}`
const generateProofAttachmentUrl = (proof: ProofOfDonation) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/proof/${proof.proof_id}`

const verifyProofInLimit = () => {
    // helper function to make sure the sum of allocations is not greater than the donations
}

const generateCoverLetter = () => {
    // storage proof/cover_letters/proof_id/donation_uuid
    // generate cover letter and upload to storage
    return
}

const notifyOfProof = () => {
    return
}