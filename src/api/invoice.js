import { order_api } from "./axios";

const INVOICE_API = "https://lbhwkjgtm8.execute-api.us-east-1.amazonaws.com";
const INVOICE_KEY = process.env.NEXT_PUBLIC_INVOICE_API_KEY;

const invoiceHeaders = {
    "Content-Type": "application/json",
    "X-API-KEY": INVOICE_KEY,
};

async function proxy(method, path, body = null) {
    const payload = {
        url: `${INVOICE_API}${path}`,
        method,
        headers: invoiceHeaders,
    };
    if (body) payload.body = body;
    const response = await order_api.post("/v1/proxy", payload);
    return response.data;
}

async function createInvoice(orderXml, orderId) {
    try {
        return await proxy("POST", "/v2/invoices", {
            orderDocumentXML: orderXml,
            invoiceDate: new Date().toISOString().split("T")[0],
            invoiceStatus: "FINAL",
            invoiceDescription: `Invoice generated from order with id ${orderId}`,
        });
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getInvoices(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        return await proxy("GET", `/v1/invoices${query ? `?${query}` : ""}`);
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getInvoiceById(invoiceId) {
    try {
        return await proxy("GET", `/v1/invoices/${invoiceId}`);
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function deleteInvoice(invoiceId) {
    try {
        return await proxy("DELETE", `/v1/invoices/${invoiceId}`);
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function updateInvoice(invoiceId, data) {
    try {
        return await proxy("PUT", `/v1/invoices/${invoiceId}`, data);
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getInvoiceSummary() {
    try {
        return await proxy("GET", "/v1/invoices/summary");
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getInvoicePdf(invoiceId) {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: `${INVOICE_API}/v1/invoices/${invoiceId}/pdf`,
            method: "GET",
            headers: invoiceHeaders,
        }, { responseType: "arraybuffer" });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

export {
    createInvoice,
    getInvoices,
    getInvoiceById,
    deleteInvoice,
    updateInvoice,
    getInvoiceSummary,
    getInvoicePdf,
};