import { uploadFeedbackToDatabase } from "../utils/database";

export async function logFeedback(feedback: string, donor_id?: string): Promise<boolean> {
    try {
        if (feedback == null || feedback == "") { throw new Error("No feedback provided.") }

        await uploadFeedbackToDatabase(feedback, donor_id)

        return true;
    } catch (error) {
        throw new Error("Error logging feedback");
    }
}