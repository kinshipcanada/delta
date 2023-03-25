import { EventTypes } from "../classes/utility_classes";
import { upload_event_to_database } from "./database";

export async function KinshipLogger(eventType: EventTypes, message: string, identifiers: string[]) {
    /**
     * EventType logs what type of event it is
     * message is a note on what we are logging
     * Identifier is a list of IDs pertaining to the situation, e.g. mailgun mail unit ID, stripe payment intent ID, etc
     */

    await upload_event_to_database(eventType, message, JSON.stringify(identifiers))

    return;
}