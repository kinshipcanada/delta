import { Cause } from "@lib/classes/causes"
import { Donation } from "@lib/classes/donation"
import { ProofOfDonation } from "@lib/classes/proof"
import { CountryCode } from "@lib/classes/utils"
import { DatabaseTypings, fetchOpenProofFromDatabase, updateDonationDistributed } from "@lib/utils/database"
import { formatDonationFromDatabase } from "@lib/utils/formatting"

export const isOpen = (causes: Cause[]) => {
    let isOpen = true

    for (const cause of causes) {
        if (cause.one_way === true) {
            isOpen = false
        }
    }

    return isOpen
}

export const allocateProof = async (
    proof_id: string,
    amount_disbursed: number,
    region_distributed: CountryCode,
    causes: Cause[],
    message_to_donor?: string, 
) => {
    console.log("causes received", causes)
    // take in proof, consider amount and directions
    if (!isOpen(causes)) {
        // Query specifically for closed donations
        throw new Error("method not implemented, can only allocate open proof")
    }

    // Query for open donations
    const donationsFromDatabase = await fetchOpenProofFromDatabase(amount_disbursed)
    const donations: Donation[] = donationsFromDatabase.rows.map((donation: DatabaseTypings["public"]["Tables"]["donations"]["Row"]) => formatDonationFromDatabase(donation)); // get the first n donations where amount_donated - amount_distributed_in_cents < total_amount
    
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
    
    if (distributed > amount_disbursed) {
        throw Error("Total distribution is greater than amount actually distributed")
    }

    // update the donation amount_distributed accordingly
    await Promise.all(updatePromises)

    // create object and notify donors
    let proof: ProofOfDonation = {
        amount_distributed_in_cents: amount_disbursed,
        proof_id: proof_id,
        uploaded_at: new Date(),
        message_to_donor: message_to_donor,
        donations: donations,
        region_distributed: region_distributed,
        cause_matches: causes
    }

    await Promise.all(donations.map(donation => generateProofEmail(donation, proof)))

    return proof
}

const generateProofEmail = (donation: Donation, proofOfDonation: ProofOfDonation) => {
    console.log(`Dear ${donation.donor.first_name}, your proof (${proofOfDonation.proof_id}) is available.`)
}

const generateCoverLetterUrl = (proof: ProofOfDonation) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/coverletters/${proof.proof_id}`
const generateProofAttachmentUrl = (proof: ProofOfDonation) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/proof/${proof.proof_id}`

const generateCoverLetter = () => {
    // storage proof/cover_letters/proof_id/donation_uuid
    // generate cover letter and upload to storage
    return
}