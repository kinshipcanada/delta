import { z } from "zod";
import { Donation, DonationSchema } from "./donation"
import { Donor, DonorSchema } from "./donor"

export interface ErroredResponse {
    error: string
}

export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export type DonationApiResponse = ApiResponse<Donation>;

export const BaseApiResponseSchema = z.object({
    error: z.string().optional()
})

export type DonationGroupResponse = z.infer<typeof DonationSchema>;

export interface FetchDonationResponse {
    donation: Donation
}


export interface FetchDonorResponse {
    donor: Donor
}

export interface FetchGroupOfDonorsResponse {
    donor: Donor[]
}

export interface CreateDonationResponse {
    donation: Donation,
}

export interface CreateDonorResponse {
    donor: Donor,
}

export interface StripeCreatePaymentIntentResponse {
    clientSecret?: string,
    message?: string
}