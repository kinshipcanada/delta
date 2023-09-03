import { Donation } from "./donation"
import { Donor } from "./donor"

export type APIStatus = 200 | 400 | 500
/**
 * @description Represents a response from the API
 * @param status The status of the response
 * @param endpoint_called The endpoint that was called. This is useful for debugging purposes.
 */
export interface BaseApiResponse {
    status: APIStatus,
    endpoint_called: string
}

export interface ErroredResponse extends BaseApiResponse {
    error: string
}

/**
 * @description Represents a response from the API that contains a message, for example if we are checking if a donation already existed
 */
export interface MessageResponse extends BaseApiResponse {
    message: string
}

export interface FetchDonationResponse extends BaseApiResponse {
    donation: Donation
}

export interface FetchGroupOfDonationsResponse extends BaseApiResponse {
    donations: Donation[]
}

export interface FetchDonorResponse extends BaseApiResponse {
    donor: Donor
}

export interface CreateDonationResponse extends BaseApiResponse {
    donation: Donation,
}

export interface CreateDonorResponse extends BaseApiResponse {
    donor: Donor,
}

export interface StripeCreatePaymentIntentResponse extends BaseApiResponse {
    clientSecret?: string,
    message?: string
}