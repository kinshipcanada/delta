import { fetch_cart_from_database } from "../../../systems/functions/database";

export default async function handler(req, res) {
    try {
        const { cart_id } = req.body
        if (!cart_id) {
            throw new Error("Missing fields.")
        } 
        const cart = await fetch_cart_from_database(cart_id)
        res.status(200).send({ "status": 200, cart: cart[0] });
    } catch (e) {
        res.status(500).send(e.message);
    }
};