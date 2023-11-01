import { uploadLogToDatabase } from "./database";

export async function logError(
    error_message: string,
    function_called: string,
    file_name: string,
) {
    return await uploadLogToDatabase(error_message, function_called, file_name)
}