import { order_api } from "./axios";

export async function sendEmail(emailData) {
    try {
        const response = await order_api.post("/send-email", emailData);
        return response.data;
    } catch (error) {
        throw error.response?.data || {error: "Failed to send email"};
    }
}