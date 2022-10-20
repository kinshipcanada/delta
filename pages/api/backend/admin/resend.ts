import resend_receipt from "../../../../systems/functions/resend_receipt";

export default async function handler(req, res) {
    try {
        const donation_id = req.body.donation_id

        if (!donation_id) {
            res.status(500).send("No donation id provided");
            return
        }

        await resend_receipt(donation_id)
        
        res.status(200).send(
            { "status": 200, donation_id: donation_id }
        );
    } catch (e) {
        res.status(500).send(e.message);
    }
};