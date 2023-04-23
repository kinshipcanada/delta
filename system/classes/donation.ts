import { Cart } from "./cart";
import { Donor } from "./donor";
import { DonationIdentifiers } from "./utils";

/**
 * @description Represents a donation object
 * @param identifiers The identifiers of the donation, including Kinship identifers and Stripe identifiers
 * @param donor The donor of the donation, as a Donor object
 * @param causes The causes the donor is donating to, as a Cart object
 * @param live Whether the donation was made in live mode or test mode
 * @param amount_in_cents The amount of the donation in cents
 * @param fees_covered The amount of fees covered by the donor in cents
 * @param fees_charged_by_stripe The amount of fees charged by Stripe in cents
 * @param date_donated The date the donation was made
 */

export interface Donation {
    identifiers: DonationIdentifiers;
    donor: Donor;
    causes: Cart;
    live: boolean;
    amount_in_cents: number;
    fees_covered: number;
    fees_charged_by_stripe: number;
    date_donated: Date;
}