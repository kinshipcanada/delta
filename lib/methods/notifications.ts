import prisma from "@lib/prisma";
import { Donation } from "@prisma/client";
import Stripe from "stripe";
import { ServerClient } from 'postmark'
import { DonationEngine } from "./donations";
import { centsToDollars, parseFrontendDate } from "@lib/utils/helpers";

export class NotificationEngine {
    readonly postmarkClient: ServerClient;
    readonly fromEmail: string

    constructor() {
        if (!process.env.FROM_EMAIL) {
            throw new Error("FROM_EMAIL not defined in environment variables")
        }

        this.fromEmail = process.env.FROM_EMAIL

        const postmarkApiKey = process.env.POSTMARK_API_KEY;

        if (!postmarkApiKey) {
            throw new Error("Postmark api key is not set in environment variables.");
        }
        this.postmarkClient = new ServerClient(postmarkApiKey)
    }

    private async sendEmail(toEmail: string, subject: string, emailContent: string) {
        try {
            await this.postmarkClient.sendEmail({
                "From": this.fromEmail,
                "To": toEmail,
                "Subject": subject,
                "TextBody": emailContent
            })
        } catch (error) {
            throw new Error(`Error sending email to ${toEmail}: ${error}`)
        }
    }


    // TODO: fix the hardcoded fields
    public async emailDonationReceipt(donation: Donation, metadata: any) {
        console.log("Sending email with metadata:", JSON.stringify(metadata, null, 2));
        
        // Use default values if metadata fields are missing
        const donorFirstName = metadata?.donorFirstName;
        const donorMiddleName = metadata?.donorMiddleName;
        const donorLastName = metadata?.donorLastName;
        const donorEmail = metadata?.donorEmail;
        const donorAddressLineAddress = metadata?.donorAddressLineAddress;
        const donorAddressCity = metadata?.donorAddressCity;
        const donorAddressState = metadata?.donorAddressState;
        const donorAddressCountry = metadata?.donorAddressCountry;
        const donorAddressPostalCode = metadata?.donorAddressPostalCode;
        
        const subjectLine = `Your donation of $${centsToDollars(donation.amountChargedInCents)} to Kinship Canada`;
        const emailBody = `
            Dear ${donorFirstName},

            Thank you for your donation of $${centsToDollars(donation.amountChargedInCents)}.

            You can access your ${donorAddressCountry == "CA" || donorAddressCountry == "Canada" ? "CRA-eligible " : ""}receipt of donation here: ${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}

            Thank you very much,
            The Team At Kinship Canada

            Invoice ID: ${donation.id}
            Date Donated: ${parseFrontendDate(donation.date)}
            Amount Donated: ${centsToDollars(donation.amountChargedInCents)}
            Receipt Issued To: ${donorFirstName} ${donorMiddleName ? donorMiddleName : ""} ${donorLastName}
            Donor Address: ${donorAddressLineAddress}, ${donorAddressCity}, ${donorAddressState}, ${donorAddressCountry} (${donorAddressPostalCode})
        `
        
        console.log(`Sending email to: ${donorEmail}`);        
        return await this.sendEmail(donorEmail, subjectLine, emailBody);
    }
}