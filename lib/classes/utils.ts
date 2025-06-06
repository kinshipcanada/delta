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

export const COUNTRY_CODES = ["ca", "us", "af", "ax", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "au", "at", "az", "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "br", "io", "bn", "bg", "bf", "bi", "kh", "cm", "cv", "ky", "cf", "td", "cl", "cn", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz", "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et", "fk", "fo", "fj", "fi", "fr", "gf", "pf", "tf", "ga", "gm", "ge", "de", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gg", "gn", "gw", "gy", "ht", "hm", "va", "hn", "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "im", "il", "it", "jm", "jp", "je", "jo", "kz", "ke", "ki", "kp", "kr", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu", "mo", "mk", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "fm", "md", "mc", "mn", "me", "ms", "ma", "mz", "mm", "na", "nr", "np", "nl", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mp", "no", "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa", "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "rs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "es", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy", "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "gb", "um", "uy", "uz", "vu", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw"] as const
export const CountryCodeSchema = z.enum(COUNTRY_CODES)
export type CountryCode = (typeof COUNTRY_CODES)[number]

// export type CountryCodeSchema = z.infer<typeof zCountryCodes>

export const CURRENCIES = ["cad", "usd"] as const
export const CurrenciesSchema = z.enum(CURRENCIES)
export type Currencies = (typeof CURRENCIES)[number]

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