import { Donation } from "./donation"

export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export type ObjectIdApiResponse = ApiResponse<string>
export type NoDataApiResponse = ApiResponse<null>
export type DonationApiResponse = ApiResponse<Donation>;
export type DonationGroupApiResponse = ApiResponse<Donation[]>