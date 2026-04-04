import { despatch_api, order_api } from "./axios";

async function createDespatch(orderXml) {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: "https://devex.cloud.tcore.network/api/v1/despatch/create",
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                "Accept": "application/json",
                "Api-Key": process.env.NEXT_PUBLIC_DESPATCH_API_KEY
            },
            body: orderXml
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function retrieveDespatch(orderXml) {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: "https://devex.cloud.tcore.network/api/v1/despatch/retrieve",
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Api-Key": process.env.NEXT_PUBLIC_DESPATCH_API_KEY
            },
            params: {
                "search-type": "order",
                query: orderXml
            }
        });

        if (response.status_code == 404) {
            return jsonify({
                "despatch": None,
                "message": "No despatch found"
            }), 200
        }

        return response.data
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function listDespatch() {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: "https://devex.cloud.tcore.network/api/v1/despatch/list",
            method: "GET",
            headers: {
                "Content-Type": "application/xml",
                "Accept": "application/json",
                "Api-Key": process.env.NEXT_PUBLIC_DESPATCH_API_KEY
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function cancelDespatchOrder(adviceId, orderCancellationDocument) {
    try {
        const response = await despatch_api.post("/v1/despatch/cancel/order", {
            "advice-id": adviceId,
            "order-cancellation-document": orderCancellationDocument,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function cancelDespatchFulfilment(adviceId, reason) {
    try {
        const response = await order_api.post("/v1/proxy", {
            url: "https://devex.cloud.tcore.network/api/v1/despatch/cancel/fulfilment",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Api-Key": process.env.NEXT_PUBLIC_DESPATCH_API_KEY,
            },
            body: {
                "advice-id": adviceId,
                "fulfilment-cancellation-reason": reason,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

export { createDespatch, listDespatch, retrieveDespatch, cancelDespatchOrder, cancelDespatchFulfilment };