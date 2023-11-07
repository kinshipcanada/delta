import { uploadFeedbackToDatabase } from "../utils/database";

export async function logFeedback(feedback: string, donor_id?: string): Promise<boolean> {
    if (feedback == null || feedback == "") { throw new Error("No feedback provided.") }

    await uploadFeedbackToDatabase(feedback, donor_id)

    return true;
}