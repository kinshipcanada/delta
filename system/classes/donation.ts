import { Cart } from "./cart";
import { Donor } from "./donor";
import { DonationIdentifiers } from "./utils";

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