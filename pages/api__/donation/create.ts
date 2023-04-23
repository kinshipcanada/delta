import { EventTypes } from "../../../systems/classes/utility_classes";
import { KinshipLogger } from "../../../systems/functions/logger";
import create_donation from "../../../systems/methods/create_donation";

export default async function handler(req, res) {
    try {
        const donation_id = req.body.data.object.id
        await KinshipLogger(EventTypes.DONATION_MADE, "Donation received from stripe", [donation_id])
        const donation = await create_donation(donation_id)
        res.status(200).send({ "status": 200, donation: donation });

    } catch (e) {
        res.status(500).send(e.message);
    }
};