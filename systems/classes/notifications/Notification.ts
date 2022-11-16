import { Donation } from "../donation/Donation";
import { Donor } from "../donors/Donor";
import { KinshipEvent } from "../events/KinshipEvent";
import { NotificationType, DeliveryMethod, CountryList, EventTypes } from "../utility_classes";
import { Templates } from "./Templates";
import { v4 as uuidv4 } from 'uuid';
const twilio = require('twilio')
const postmark = require("postmark");

require('dotenv').config();

export class KinshipNotification extends KinshipEvent {
    notification_id;
    notification_type: NotificationType;
    donor: Donor;
    donation: Donation
    
    constructor ( 
        notification_type: NotificationType, 
        donation: Donation,
        donor: Donor,
        notification_id = uuidv4()
    ) {
        
        super(notification_id, EventTypes.NOTIFICATION)

        this.notification_id = notification_id;
        this.notification_type = notification_type;
        this.donation = donation
        this.donor = donor
    }

    async send(method: DeliveryMethod) {
        /**
         * @description Sends notification out, by either phone or email.
         */
        
        const template = Templates(this.notification_type, this.donor, this.donation)

        if (method == DeliveryMethod.PHONE) {

            const twilio_client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
            const message = await twilio_client.messages.create({
                body: template.sms_friendly_message,
                to: this.donor.formatted_phone_number(), 
                from: this.donor.address.country == CountryList.CANADA ? process.env.TWILIO_CANADIAN_NUMBER : process.env.TWILIO_USA_NUMBER,
            })

            this.log_event(message.sid);
            return

        } else if (method == DeliveryMethod.EMAIL) {

            const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

            await client.sendEmail({
                "From": process.env.FROM_EMAIL,
                "To": this.donor.email,
                "Subject": template.email_subject,
                "TextBody": template.email_body
            });

            this.log_event("Sent email to " + this.donor.email);
            
            return

        }
        
    }
}
