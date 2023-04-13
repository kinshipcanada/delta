import { EventTypes } from "../utility_classes";

/**
 * Base event classes. All events must adhere to this
 */
export class KinshipEvent {
    id: string;
    event_type: EventTypes

    constructor ( id: string, event_type: EventTypes ) {
        this.id = id;
        this.event_type = event_type;
    }

    log_event(custom_data) {
        console.log(custom_data)
    }
}