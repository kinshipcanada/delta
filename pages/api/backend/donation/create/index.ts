import { SimpleMessageResponse } from "../../../../../systems/classes/interfaces";
import create_donation from "../../../../../systems/functions/create_donation";

export default async function handler(req, res) {
    try {

        const { donation_id } = req.data.object.id
        const donation = await create_donation(donation_id)
        res.status(200).send({ "status": 200, donation: donation });

    } catch (e) {
        res.status(500).send(e.message);
    }
};