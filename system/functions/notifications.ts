import { Donation } from "../classes/donation";
import { AdminNotificationType, NotificationTemplate, NotificationType, UserNotificationType } from "../classes/notifications";
import { CountryList } from "../classes/utils";

export function generateNotificationTemplate(
  notificationType: NotificationType,
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