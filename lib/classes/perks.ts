import { Donation } from "./donation";

// Enums, classes, and interfaces for bonus/helpful features we provide for donors
export interface SummaryStatement {
    /**
     * This interface defines the structure of a donation summary object.
     * 
     * @property {string} donor_email - The email of the donor
     * @property {number} total_donated - The total amount donated by the donor, in CAD cents
     * @property {total_eligible_estimate} total_eligible_estimate - The total amount eligible for tax receipt, in CAD cents
     * @property {donations} donations - An array of donation objects
     **/
    donor_email: string,
    total_donated: number,
    total_eligible_estimate: number,
    donations: Donation[]
}