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

    private async sendEmail(toEmail: string, subject: string, emailContent: string) {
        try {
            await this.postmarkClient.sendEmail({
                "From": this.fromEmail,
                "To": toEmail,
                "Subject": subject,
                "HtmlBody": emailContent,
                "TextBody": emailContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
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
        const emailBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                Dear ${donor_name},<br><br>

                Thank you for your donation of $${centsToDollars(donation.amount_charged_cents)}.<br><br>

                You can access your ${country == "CA" || country == "Canada" || country == "ca" ? "CRA-eligible " : ""}receipt of donation here: <a href="${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}" style="color: #0066cc; text-decoration: underline;">Click here to view your receipt</a><br><br>

                Thank you very much,<br>
                The Team At Kinship Canada<br><br>

                <div style="color: #666666; font-size: 14px;">
                    Invoice ID: ${donation.id}<br>
                    Date Donated: ${parseFrontendDate(donation.date)}<br>
                    Amount Donated: ${centsToDollars(donation.amount_charged_cents)}<br>
                    Receipt Issued To: ${donor_name}<br>
                    Donor Address: ${line_address}, ${city}, ${state}, ${country} (${postal_code})
                </div>
            </div>
        `
        
        console.log(`Sending email to: ${email}`);        
        return await this.sendEmail(email, subjectLine, emailBody);
    }
}