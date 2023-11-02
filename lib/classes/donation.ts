import { z } from "zod";
import { calculateStripeFee } from "../utils/helpers";
import { Causes, CausesSchema, generateFakeCauses } from "./causes";
import { Donor, DonorSchema, generateFakeDonor } from "./donor";
import { DonationIdentifiers, DonationIdentifiersSchema } from "./utils";

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
  causes: Causes;
  live: boolean;
  amount_in_cents: number;
  fees_covered: number;
  fees_charged_by_stripe: number;
  date_donated: Date | string;
}

export const DonationSchema = z.object({
  identifiers: DonationIdentifiersSchema,
  donor: DonorSchema,
  causes: CausesSchema,
  live: z.boolean(),
  amount_in_cents: z.number(),
  fees_covered: z.number(),
  fees_charged_by_stripe: z.number(),
  date_donated: z.date().or(z.string()),
});

export const DonationResponseSchema = z.object({
  donation: DonationSchema
})

export const DonationGroupResponseSchema = z.object({
  donations: z.array(DonationSchema)
})

export function isDonation(obj: any): obj is Donation {
    return (
        typeof obj === 'object' &&
        'identifiers' in obj &&
        'donor' in obj &&
        'causes' in obj &&
        'live' in obj &&
        'amount_in_cents' in obj &&
        'fees_covered' in obj &&
        'fees_charged_by_stripe' in obj &&
        'date_donated' in obj &&
        obj.identifiers !== null && // You can add more specific checks for sub-properties
        obj.donor !== null &&
        obj.causes !== null &&
        typeof obj.live === 'boolean' &&
        typeof obj.amount_in_cents === 'number' &&
        typeof obj.fees_covered === 'number' &&
        typeof obj.fees_charged_by_stripe === 'number'
    );
}

import { faker } from '@faker-js/faker';

export const generateFakeDonation = (): Donation => {

    const donor = generateFakeDonor()
    const causes = generateFakeCauses()

    const stripeFee = calculateStripeFee(causes.total_amount_paid_in_cents)

    const donation: Donation = {
      identifiers: {
        donation_id: faker.string.uuid(),
        donor_id: donor.donor_id,
      },
      donor: donor,
      causes: causes,
      live: false,
      amount_in_cents: causes.total_amount_paid_in_cents + stripeFee,
      fees_covered: stripeFee,
      fees_charged_by_stripe: stripeFee,
      date_donated: faker.date.past(),
    };
  
    return donation;
};