import { Donation } from "../classes/donation/Donation"
import { KinshipNotification } from "../classes/notifications/Notification"
import { DeliveryMethod, NotificationType } from "../classes/utility_classes"

export async function notify(donation: Donation) {
    const notification =  new KinshipNotification(NotificationType.DONATION_MADE, donation, donation.donor)
    await notification.send(DeliveryMethod.EMAIL)
}