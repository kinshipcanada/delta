import { CreateDonorResponse, ErroredResponse, FetchDonorResponse } from "../classes/api";
import { fetchDonorFromDatabase } from "../utils/database";
import { formatDonorFromDatabase } from "../utils/formatting";

export async function createDonor(): Promise<CreateDonorResponse> {
    return
}

export async function fetchDonor(donorId?: string, donorEmail?: string): Promise<FetchDonorResponse | ErroredResponse> {
    if (donorId == null && donorEmail == null) {
        return {
            status: 500,
            endpoint_called: 'fetchDonor',
            error: 'No valid identifiers provided. You must provide at least one of the following: donor_id, donor_email.'
        }
    }

    try {
        return {
            status: 200,
            endpoint_called: 'fetchDonor',
            donor: formatDonorFromDatabase(await fetchDonorFromDatabase(donorId, donorEmail))
        }
    } catch (error) {
        return {
            status: 500,
            endpoint_called: 'fetchDonor',
            error: error.message
        }
    }
}