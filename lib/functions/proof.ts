import { Cause } from "@lib/classes/causes"
import { Donation } from "@lib/classes/donation"
import { ProofOfDonation } from "@lib/classes/proof"
import { CountryCode } from "@lib/classes/utils"
import { v4 as uuidv4 } from "uuid"

const isOpen = (causes: Cause[]) => {
    let isOpen = true

    for (const cause of causes) {
        if (cause.one_way === false) {
            isOpen = false
        }
    }

    return isOpen
}

const allocateProof = async (
    amount_disbursed: number,
    message_to_donor: string, 
    region_distributed: CountryCode,
    causes: Cause[]
) => {
    const proofId = uuidv4()

    // take in proof, consider amount and directions
    if (!isOpen(causes)) {
        // Query specifically for closed donations
        throw new Error("method not implemented, can only allocate open proof")
    }

    // Query for open donations
    const runningTotalCTEQuery = `
        WITH RunningTotalCTE AS (
            SELECT
                id_donation_id,
                txn_amount_donated_cents,
                amount_distributed_in_cents,
                detail_date_donated,
                SUM(txn_amount_donated_cents - amount_distributed_in_cents) OVER (ORDER BY detail_date_donated) AS running_total
            FROM
                donations
            WHERE
                distribution_restricted = false
        )
        SELECT *
        FROM RunningTotalCTE
        WHERE running_total <= ${amount_disbursed}
        ORDER BY
            detail_date_donated;
    `
    
    const donations: Donation[] = [] // get the first n donations where amount_donated - amount_distributed_in_cents < total_amount
    let distributed = 0

    let updatePromises = []

    // add to the junction table, filling up chronologically
    for (const donation of donations) {
        if (!donation.transaction_details || !donation.donation_details || !donation.identifiers.donation_id) {
            throw new Error("Missing details")
        }
        const amount_not_yet_distributed = donation.transaction_details.amount_donated_in_cents - donation.donation_details.amount_distributed_in_cents
        let amount_being_distributed = 0
        if (distributed + amount_not_yet_distributed > amount_disbursed) {
            amount_being_distributed = amount_disbursed - distributed
        } else {
            amount_being_distributed = amount_not_yet_distributed
        }

        donation.donation_details.amount_distributed_in_cents = donation.donation_details.amount_distributed_in_cents + amount_being_distributed

        updatePromises.push(updateDonationDistributed(donation.identifiers.donation_id, donation.donation_details.amount_distributed_in_cents))
    }
    
    // update the donation amount_distributed accordingly
    await Promise.all(updatePromises)

    // create object and notify donors
    let proof: ProofOfDonation = {
        amount_distributed_in_cents: amount_disbursed,
        proof_id: proofId,
        uploaded_at: new Date(),
        message_to_donor: message_to_donor,
        donations: donations,
        region_distributed: region_distributed,
        cause_matches: causes
    }

    return proof
}

const updateDonationDistributed = async (donationId: string, amount_distributed_in_cents: number) => {}

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