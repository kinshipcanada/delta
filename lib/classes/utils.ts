// Miscellanous utility classes, enums, and interfaces

import { z } from "zod";
import { StripeTags, StripeTagsSchema } from "./stripe";

export interface KinshipTags {
    donation_id?: string,
    donor_id?: string,
}

export const KinshipTagsSchema = z.object({
    donation_id: z.string().optional(),
    donor_id: z.string().optional(),
});

export type DonationIdentifiers = StripeTags & KinshipTags

export const DonationIdentifiersSchema = StripeTagsSchema.merge(KinshipTagsSchema)

/**
 * @description Currencies supported by Kinship
 */
export enum CurrencyList {
    CAD = 'cad',
    USD = 'usd',
    EUR = 'eur',
    GBP = 'gbp',
    AUD = 'aud',
}

export const enum DonationStep {
    AmountAndBilling,
    DonateWithCreditOrDebitCard,
    DonateWithAcssDebit,
    WireTransferInstructions,
    Confirmation,
    Error
}

export const enum ConfirmationType {
    Unconfirmed,
    ConfirmedAndReceived,
    ConfirmedProcessing,
    FurtherStepsRequired
}