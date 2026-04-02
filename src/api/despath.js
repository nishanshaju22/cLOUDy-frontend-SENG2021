import { despatch_api } from "./axios";

async function createDespatch(orderXml) {
    try {
        const response = await despatch_api.post("/v1/despatch/create", orderXml, {
            headers: { "Content-Type": "application/xml" },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function listDespatches() {
    try {
        const response = await despatch_api.get("/v1/despatch/list");
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function retrieveDespatch(searchType, query) {
    try {
        const response = await despatch_api.get("/v1/despatch/retrieve", {
            params: {
                "search-type": searchType,
                "query": query,
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
        const response = await despatch_api.post("/v1/despatch/cancel/fulfilment", {
            "advice-id": adviceId,
            "fulfilment-cancellation-reason": reason,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}


export { createDespatch, listDespatches, retrieveDespatch, cancelDespatchOrder, cancelDespatchFulfilment };