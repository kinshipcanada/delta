import { Donation } from "./donation"
import { Donor } from "./donor"

export interface ErroredResponse {
    error: string
}

/**
 * @description Represents a response from the API that contains a message, for example if we are checking if a donation already existed
 */
export interface MessageResponse {
    message: string
}

export interface FetchDonationResponse {
    donation: Donation
}

export interface FetchGroupOfDonationsResponse {
    donations: Donation[]
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