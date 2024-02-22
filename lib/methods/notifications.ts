import prisma from "@lib/prisma";
import { Donation, Donor, PaymentMethodType, PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { ServerClient } from 'postmark'
import { DonationEngine } from "./donations";

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
        return await this.postmarkClient.sendEmail({
            "From": this.fromEmail,
            "To": toEmail,
            "Subject": subject,
            "TextBody": emailContent
        })
    }

    public async emailDonationReceipt(donation: Donation) {
        const subjectLine = `Your donation of ${donation.amountChargedInCents} to Kinship Canada`
        const emailBody = `
            Dear ${donation.donorFirstName},

            Thank you for your donation of ${donation.amountChargedInCents} ${donation.currency}.

            You can access your ${donation.donorAddressCountry == "CA" ? "CRA-eligible" : null } receipt of donation here: <a href = "https://www.kinshipcanada.com/receipts/${donation.id}">https://www.kinshipcanada.com/receipts/${donation.id}</a>
        `
        return await this.sendEmail(donation.donorEmail, subjectLine, emailBody)
    }

    
}
