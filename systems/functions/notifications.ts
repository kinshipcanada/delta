import { Donation } from "../classes/donation/Donation"
import { KinshipNotification } from "../classes/notifications/Notification"
import { DeliveryMethod, NotificationType } from "../classes/utility_classes"

export async function notify_about_donation(donation: Donation, notification_type: NotificationType) {
    const notification =  new KinshipNotification(notification_type, donation, donation.donor)
    return await notification.send(DeliveryMethod.EMAIL)
}