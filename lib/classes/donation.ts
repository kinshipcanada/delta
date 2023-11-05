import { z } from "zod";
import { calculateStripeFee } from "../utils/helpers";
import { Cause, CausesSchema, generateFakeCauses } from "./causes";
import { Donor, DonorSchema, generateFakeDonor } from "./donor";
import { Currencies, DonationIdentifiers, DonationIdentifiersSchema } from "./utils";

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

export type DonationStatus = "processing" | "delivered_to_partners" | "partially_distributed" | "fully_distributed"

export interface PaymentMethod {
  type: PaymentMethodType
  card?: Stripe.PaymentMethod.Card
  acss_debit?: Stripe.PaymentMethod.AcssDebit
}

export interface TransactionDetails {
  stripe_identifiers: StripeTags
  currency: Currencies
  amount_donated_in_cents: number
  amount_charged_in_cents: number
  fee_charged_by_payment_processor?: number
  payment_method: PaymentMethod
}

export interface DonationDetails {
  causes: Cause[]
  proof: ProofOfDonation[]
  date_donated: Date | string
  date_logged: Date | string
}

export interface Donation2 {
  identifiers: DonationIdentifiers,
  donor: Donor
  transaction_details: TransactionDetails
  donation_details: DonationDetails
}

export interface Donation {
  identifiers: DonationIdentifiers;
  donor: Donor;
  causes: Cause[];
  amount_in_cents: number;
  fees_covered: number;
  fees_charged_by_stripe: number;
  date_donated: Date | string;
  proof: ProofOfDonation[]
  status?: DonationStatus,
  currency?: Currencies,
  transaction_details?: TransactionDetails
  donation_details?: DonationDetails
}

export const DonationSchema = z.object({
  identifiers: DonationIdentifiersSchema,
  donor: DonorSchema,
  causes: z.array(CausesSchema),
  amount_in_cents: z.number(),
  fees_covered: z.number(),
  fees_charged_by_stripe: z.number(),
  date_donated: z.date().or(z.string()),
  proof: z.array(z.any())
});

export function isDonation(obj: any): obj is Donation {
    return (
        typeof obj === 'object' &&
        'identifiers' in obj &&
        'donor' in obj &&
        'causes' in obj &&
        'amount_in_cents' in obj &&
        'fees_covered' in obj &&
        'fees_charged_by_stripe' in obj &&
        'date_donated' in obj &&
        obj.identifiers !== null && // You can add more specific checks for sub-properties
        obj.donor !== null &&
        obj.causes !== null &&
        typeof obj.amount_in_cents === 'number' &&
        typeof obj.fees_covered === 'number' &&
        typeof obj.fees_charged_by_stripe === 'number'
    );
}

import { faker } from '@faker-js/faker';
import { ProofOfDonation } from "./proof";
import { StripeTags } from "./stripe";
import Stripe from "stripe";
import { PaymentMethodType } from "./payment_method";

export const generateFakeDonation = (): Donation => {

    const donor = generateFakeDonor()
    const causes = [generateFakeCauses(), generateFakeCauses()]

    const amount = parseInt(faker.finance.amount())
    const stripeFee = calculateStripeFee(amount)

    const donation: Donation = {
      identifiers: {
        donation_id: faker.string.uuid(),
        donor_id: donor.donor_id,
      },
      donor: donor,
      causes: causes,
      amount_in_cents: amount + stripeFee,
      fees_covered: stripeFee,
      fees_charged_by_stripe: stripeFee,
      date_donated: faker.date.past(),
      proof: []
    };
  
    return donation;
};