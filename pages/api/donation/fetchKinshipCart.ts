import { ErroredResponse } from "../../../system/classes/api";
import { Donation } from "../../../system/classes/donation";
import { fetchKinshipCart } from "../../../system/functions/donations";
import { verifyAllParametersExist } from "../../../system/utils/helpers";
/**
 * @description Fetches a Kinship Cart object from the database. This is used to display instructions to the user on how to complete their donation, or for admin panel use
 */
export default async function handler(req, res) {
    try {
        const { cart_id } = req.body

        verifyAllParametersExist(`No cart_id provided.`, cart_id)

        const cart: Donation = await fetchKinshipCart(cart_id)
        return cart ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donation/fetchKinshipCart`,
            cart: cart
        }) : new Error("Something went wrong fetching the cart.");

    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donation/fetchKinshipCart`,
            error: error.message
        } as ErroredResponse);
    }
};