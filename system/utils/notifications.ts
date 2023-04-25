import { Donation } from "../classes/donation";
import { AdminNotificationType, DeliveryMethod, NotificationTemplate, UserNotificationType } from "../classes/notifications";
import { CountryList } from "../classes/utils";
import * as dotenv from 'dotenv' 
const twilio = require('twilio')
const postmark = require('postmark')
import { Donor } from "../classes/donor";

dotenv.config()

export function generateNotificationTemplate(
  notificationType: UserNotificationType | AdminNotificationType,
  donation: Donation
): NotificationTemplate {
    const donorCountry = donation.donor.address.country
    const donationAmount = donation.amount_in_cents / 100
    const donorFirstName = donation.donor.first_name
    const donationUrl = `https://${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.identifiers.donation_id}`
    
    switch (notificationType) {
        case UserNotificationType.DONATION_MADE: {
            return {
                email_body: `
                    Dear ${donorFirstName},

                    Thank you for your donation of ${donationAmount} ${donorCountry == CountryList.CANADA ? "CAD" : CountryList.UNITED_STATES ? "CAD" : null }.

                    You can access your ${donorCountry == CountryList.CANADA ? "CRA-eligible" : null } receipt of donation here: ${donationUrl}
                `,
                email_subject: `Thank you for your donation on ${donation.date_donated}.`,
                sms_friendly_message: `Thank you for your donation of $${donationAmount} ${donorCountry == CountryList.CANADA ? "CAD" : CountryList.UNITED_STATES ? "CAD" : null }. Access your receipt of donation here: ${donationUrl}`
            }
        }

        case UserNotificationType.PROOF_AVAILABLE: {
            return {
                email_body: `
                    Dear ${donorFirstName},

                    Thank you for your donation of ${donationAmount} ${donorCountry == CountryList.CANADA ? "CAD" : CountryList.UNITED_STATES ? "CAD" : null }.

                    You can access your ${donorCountry == CountryList.CANADA ? "CRA-eligible" : null } receipt of donation here: ${donationUrl}
                `,
                email_subject: `Thank you for your donation on ${donation.date_donated}.`,
                sms_friendly_message: `Thank you for your donation of $${donationAmount} ${donorCountry == CountryList.CANADA ? "CAD" : CountryList.UNITED_STATES ? "CAD" : null }. Access your receipt of donation here: ${donationUrl}`
            }
        }

        case UserNotificationType.REFUND_ISSUED: {
            throw new Error("Not implemented")
        }

        case UserNotificationType.REFUND_PROCESSING: {
            throw new Error("Not implemented")
        }

        case AdminNotificationType.REPORT_GENERATED: {
            throw new Error("Not implemented")
        }

        case AdminNotificationType.RECEIPT_MANUALLY_ISSUED: {
            throw new Error("Not implemented")
        }
    }
}

export async function sendNotification(
    notificationType: UserNotificationType | AdminNotificationType,
    donation: Donation,
    deliveryMethod: DeliveryMethod,
) {
    const template = generateNotificationTemplate(notificationType, donation)

    switch (deliveryMethod) {
        case DeliveryMethod.EMAIL: {
            return await _sendEmail(template, donation.donor)
        }

        case DeliveryMethod.PHONE: {
            return await _sendSMS(template, donation.donor)
        }
    }
}

async function _sendEmail(template: NotificationTemplate, donor: Donor): Promise<void> {
    try {
        const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
        await client.sendEmail({
            "From": process.env.FROM_EMAIL,
            "To": donor.email,
            "Subject": template.email_subject,
            "TextBody": template.email_body
        });

        return;
    } catch (error) {
        throw new Error("Error sending email: " + error.message)
    }
}

async function _sendSMS(template: NotificationTemplate, donor: Donor): Promise<void> {
    try {
        const twilio_client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

        if (donor.phone_number == null || donor.phone_number == undefined) {
            throw new Error("Cannot send SMS: donor does not have a phone number")
        }

        const message = await twilio_client.messages.create({
            body: template.sms_friendly_message,
            to: String(donor.phone_number),
            from: process.env.TWILIO_CANADIAN_NUMBER,
        })

        return;
    } catch (error) {
        throw new Error("Error sending SMS: " + error.message)
    }
}