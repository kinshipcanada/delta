// This file contains enums, classes, and interfaces relating to creating and delivering notifications to donors and admins.
export const enum DeliveryMethod {
    EMAIL,
    PHONE,
}

export const enum UserNotificationType {
    DONATION_MADE,
    REFUND_ISSUED,
    REFUND_PROCESSING,
    PROOF_AVAILABLE,
}

export const enum AdminNotificationType {
    REPORT_GENERATED,
    RECEIPT_MANUALLY_ISSUED,
}

/**
 * @description Represents the type of notification sent (for internal logging purposes)
 */
export type NotificationType = UserNotificationType & AdminNotificationType

export interface NotificationTemplate {
    email_subject: string;
    email_body: string;
    sms_friendly_message: string;
}