import { invoice_api } from "./axios";

async function createInvoice(data) {
    try {
        const response = await invoice_api.post("/v1/invoices", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getInvoice() {
    try {
        const response = await invoice_api.get("/v1/invoices");
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

export { createInvoice, getInvoice }