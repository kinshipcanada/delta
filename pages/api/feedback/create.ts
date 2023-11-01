import { ErroredResponse, MessageResponse } from "../../../lib/classes/api";
import { logFeedback } from "../../../lib/functions/feedback";
import { verifyAllParametersExist } from "../../../lib/utils/helpers";

/**
 * @description Submits feedback from the frontend
 */
export default async function handler(req, res) {
    try {
        const { feedback, donor_id } = req.body
        
        verifyAllParametersExist(`No feedback provided. Object given was ${JSON.stringify(req.body)}`, feedback)

        const feedbackResponse = await logFeedback(feedback, donor_id)

        return feedbackResponse ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/feedback/create`,
            message: "Successfully submitted feedback."
        } as MessageResponse) : new Error("Something went wrong submitting the feedback.");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/feedback/create`,
            error: error.message
        } as ErroredResponse);
    }
};