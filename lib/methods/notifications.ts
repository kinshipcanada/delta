import prisma from "@lib/prisma";
import { donation } from "@prisma/client";
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

    private async sendEmail(toEmail: string, subject: string, htmlContent: string) {
        try {
            await this.postmarkClient.sendEmail({
                "From": this.fromEmail,
                "To": toEmail,
                "Subject": subject,
                "HtmlBody": htmlContent
            })
        } catch (error) {
            throw new Error(`Error sending email to ${toEmail}: ${error}`)
        }
    }

    // TODO: fix the hardcoded fields
    public async emailDonationReceipt(donation: donation, metadata: any) {
        console.log("Sending email with metadata:", JSON.stringify(metadata, null, 2));
        
        // Use donation fields as fallback if metadata fields are missing
        const donor_name = metadata?.donor_name || donation.donor_name;
        const email = metadata?.email || donation.email;
        const line_address = metadata?.line_address || donation.line_address;
        const city = metadata?.city || donation.city;
        const state = metadata?.state || donation.state;
        const country = metadata?.country || donation.country;
        const postal_code = metadata?.postal_code || donation.postal_code;
        
        const subjectLine = `Your donation of $${centsToDollars(donation.amount_charged_cents)} to Kinship Canada`;
        const receiptUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}`;
        
        const emailBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Dear ${donor_name},</p>

                <p>Thank you for your donation of $${centsToDollars(donation.amount_charged_cents)}.</p>

                <p>You can <a href="${receiptUrl}" style="color: #0066cc; text-decoration: underline;">access your ${country == "CA" || country == "Canada" || country == "ca" ? "CRA-eligible " : ""}receipt here</a>.</p>

                <p>Thank you very much,<br>
                The Team At Kinship Canada</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin: 5px 0;"><strong>Invoice ID:</strong> ${donation.id}</p>
                    <p style="margin: 5px 0;"><strong>Date Donated:</strong> ${parseFrontendDate(donation.date)}</p>
                    <p style="margin: 5px 0;"><strong>Amount Donated:</strong> $${centsToDollars(donation.amount_charged_cents)}</p>
                    <p style="margin: 5px 0;"><strong>Receipt Issued To:</strong> ${donor_name}</p>
                    <p style="margin: 5px 0;"><strong>Donor Address:</strong> ${line_address}, ${city}, ${state}, ${country} (${postal_code})</p>
                </div>
            </div>
        `
        
        console.log(`Sending email to: ${email}`);        
        return await this.sendEmail(email, subjectLine, emailBody);
    }
}