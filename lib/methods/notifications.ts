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

    public async emailDonationReceipt(donation: Donation) {
        const subjectLine = `Your donation of $${centsToDollars(donation.amountChargedInCents)} to Kinship Canada`
        // const emailBody = `
        //     Dear ${donation.donorFirstName},

        //     Thank you for your donation of $${centsToDollars(donation.amountChargedInCents)} ${donation.currency}.

        //     You can access your ${donation.donorAddressCountry == "CA" ? "CRA-eligible" : null } receipt of donation here: ${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}

        //     Thank you very much,
        //     The Team At Kinship Canada

        //     Invoice ID: ${donation.id}
        //     Date Donated: ${parseFrontendDate(donation.date)}
        //     Amount Donated: ${centsToDollars(donation.amountChargedInCents)}
        //     Receipt Issued To: ${donation.donorFirstName} ${donation.donorMiddleName ? donation.donorMiddleName : ""} ${donation.donorLastName}
        //     Donor Address: ${donation.donorAddressLineAddress}, ${donation.donorAddressCity}, ${donation.donorAddressState}, ${donation.donorAddressCountry} (${donation.donorAddressPostalCode})
        // `
        const emailBody = `
        Dear Jon Doe,

        Thank you for your donation of $${centsToDollars(donation.amountChargedInCents)} CAD.

        You can access your receipt of donation here: ${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}

        Thank you very much,
        The Team At Kinship Canada

        Invoice ID: ${donation.id}
        Date Donated: ${parseFrontendDate(donation.date)}
        Amount Donated: ${centsToDollars(donation.amountChargedInCents)}
        Receipt Issued To: John Doe
        Donor Address: 123 Main St, Toronto, ON, CA (M5A 1A1)
    `

        return await this.sendEmail("jon@doe.com", subjectLine, emailBody)
    }
}