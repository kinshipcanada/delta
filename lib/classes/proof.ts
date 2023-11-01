import { DonationIdentifiers } from "./utils";
import { URL } from 'url';

/**
 * @description Interface representing an uploaded proof of donation. This is currently decoupled, but may be wrapped into the donation interface in the future.
 * @param identifiers - Identifiers for the donation this is a proof of.
 * @param uploaded_at - The date this proof was uploaded.
 * @param message_to_donor - (Optional) A message to the donor. Can be a custom message, for example to let the donor know that the recipient wanted to personally thank them. 
 * @param cover_letter_url - The URL of the cover letter from Kinship
 * @param file_attachment_urls - A list of URLs of the file attachments from Kinship
 */

export interface ProofOfDonation {
    identifiers: DonationIdentifiers;
    uploaded_at: Date,
    message_to_donor: string,
    cover_letter_url: URL,
    file_attachment_urls: [URL],
}

export function isProofOfDonation(arg: any): arg is ProofOfDonation {
    return (
        arg != null &&
        typeof arg === 'object' &&
        'identifiers' in arg &&
        arg.identifiers != null &&
        typeof arg.identifiers === 'object' &&
        'donation_id' in arg.identifiers &&
        typeof arg.identifiers.donation_id === 'string' &&
        arg.identifiers.donation_id !== '' &&
        'uploaded_at' in arg &&
        arg.uploaded_at instanceof Date &&
        'message_to_donor' in arg &&
        typeof arg.message_to_donor === 'string' &&
        'cover_letter_url' in arg &&
        arg.cover_letter_url instanceof URL &&
        'file_attachment_urls' in arg &&
        Array.isArray(arg.file_attachment_urls) &&
        arg.file_attachment_urls.every((url: URL) => url instanceof URL)
    );
}
