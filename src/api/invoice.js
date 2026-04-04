import { invoice_api, order_api } from "./axios";

async function createInvoice(orderXml, orderId) {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: "https://lbhwkjgtm8.execute-api.us-east-1.amazonaws.com/v2/invoices",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.NEXT_PUBLIC_INVOICE_API_KEY
            },
            body: {
                "orderDocumentXML": orderXml,
                "invoiceDate": "2026-02-28",
                "invoiceStatus": "FINAL",
                "invoiceDescription": `Invoice generated from order with id ${orderId}`
            }
        });
        return response.data;
    } catch (error) {
        console.log(error)
        throw error.response?.data || { error: "Something went wrong" };
    }
}


export { createInvoice, getInvoice }