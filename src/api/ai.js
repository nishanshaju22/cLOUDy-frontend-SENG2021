import { order_api } from "./axios";

async function extractText(text) {
    try {
        const response = await order_api.post("/extract-order", { text });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

export { extractText }