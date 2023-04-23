import { upload_cart_to_database } from "../../../systems/functions/database";
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
    try {
        const { donor, email, amount_in_cents, donation_causes, address_line_address, address_state, address_city, address_postal_code, address_country, first_name, last_name } = req.body
        if (!amount_in_cents || !email || !donation_causes || !address_line_address || !address_state || !address_city || !address_postal_code || !address_country || !first_name || !last_name) {
            throw new Error("Missing fields.")
        } 
        const cart_id = uuidv4()
        await upload_cart_to_database(cart_id, donor, email, amount_in_cents, donation_causes, address_line_address, address_state, address_city, address_postal_code, address_country, Boolean(process.env.KINSHIP_PRODUCTION_MODE), first_name, last_name)
        res.status(200).send({ "status": 200, cart: { id: cart_id } });
    } catch (e) {
        res.status(500).send(e.message);
    }
};