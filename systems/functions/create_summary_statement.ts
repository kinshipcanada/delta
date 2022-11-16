import { Donation } from "../classes/donation/Donation";
import { SummaryStatement } from "../classes/utility_classes/summary_statement";

export default function create_summary_statement(donations: Donation[]) : SummaryStatement {
    /**
     * This function generates a donation summary for a donor. It provides a summary of all donations made by a donor, and
     * the total amount donated.
     * 
     * @param {string} donor_email - The email of the donor
     * @returns {Promise<SummaryStatement>} - A donation summary object
     */

    // Initialize the summary object
    let summary: SummaryStatement = {
        donor_email: donations[0].donor.email,
        total_donated: 0,
        total_eligible_estimate: 0,
        donations: []
    }

    // Iterate through the donations and add them to the summary object
    for (const donation of donations) {
        summary.donations.push(donation.format_donation_for_user())
        summary.total_donated += donation.amount_in_cents
    }

    // Calculate the total eligible estimate
    if (summary.total_donated < 20000) {
        summary.total_eligible_estimate = (summary.total_donated*0.2005)
    } else {
        summary.total_eligible_estimate = (20000*0.2005) + ((summary.total_donated - 20000)*0.4016)
    }

    return summary

}