import { Donation } from "../classes/donation";
import { Donor } from "../classes/donor";
import { NotificationTemplate, NotificationType } from "../classes/notifications";

export function generateNotificationTemplate(
  notificationType: NotificationType,
  donor: Donor,
  donation: Donation
): NotificationTemplate {
  const FUNCTION_NAME = "generateNotificationTemplate";

  const donation_amount = donation.amount / 100;
  const donation_date = donation.created_at;
  const donation_id = donation.id;
  const donation_status = donation.status;
  const donation_type = donation.type;

  const donor_first_name = donor.first_name;
  const donor_last_name = donor.last_name;
  const donor_email = donor.email;
  const donor_phone_number = donor.phone_number;

  const donation_url = `${process.env.KINSHIP_URL}/donations/${donation_id}`;

  const email_subject = `Kinship Donation Receipt`;
  const email_body = `Hello ${donor_first_name} ${donor_last_name},\n\nThank you for your donation of $${donation_amount} to Kinship. You can view your receipt here: ${donation_url}\n\nKinship`;
  const sms_friendly_message = `Hello ${donor_first_name} ${donor_last_name},\n\nThank you for your donation of $${donation_amount} to Kinship. You can view your receipt here: ${donation_url}\n\nKinship`;

  return {
    email_subject,
    email_body,
    sms_friendly_message,
  };
}