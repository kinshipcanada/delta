import { KinshipEvent } from "../events/KinshipEvent";
import { EventTypes } from "../utility_classes";
import { v4 as uuidv4 } from 'uuid';
import { log } from "next-axiom";

export class KinshipError extends KinshipEvent {
    constructor ( message: string, file_name: string, function_name: string, log_error: boolean = true ) {

        const error_id = uuidv4();

        super (error_id, EventTypes.INTERNAL_ERROR)

        if (log_error) {
            log.error(`ERROR::${function_name}::${file_name}::${message}`);
        }
        
        throw new Error(message)
    }
}