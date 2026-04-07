import { order_api } from "./axios";

async function createBuyer(buyerData) {
    try {
        const response = await order_api.post("/v1/buyer", buyerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function createOrder(orderData, buyerId) {
    try {
        const response = await order_api.post(`/v2/buyer/${buyerId}/order`, orderData, { responseType: "text" });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function updateOrder(buyerId, orderId, orderData) {
    try {
        const response = await order_api.put(`/v1/buyer/${buyerId}/order/${orderId}`, orderData, { responseType: "text" });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getOrderById(buyerId, orderId) {
    try {
        const response = await order_api.get(`/v1/buyer/${buyerId}/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function cancelOrder(buyerId, orderId) {
    try {
        const response = await order_api.delete(`/v1/buyer/${buyerId}/order/${orderId}/CANCELED`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function deleteOrderById(buyerId, orderId) {
    try {
        const response = await order_api.delete(`/v1/buyer/${buyerId}/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getOrdersForBuyer(buyerId, params) {
    try {
        const response = await order_api.get(`/v1/buyer/${buyerId}/order`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function deleteCancelledOrders(buyerId) {
    try {
        const response = await order_api.delete(`/v1/buyer/${buyerId}/order/CANCELED`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getBuyers() {
    try {
        const response = await order_api.get("/v1/buyers");
        return response.data.buyers;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function createSeller(data) {
    try {
        const response = await order_api.post("/v1/seller", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getSellers() {
    try {
        const response = await order_api.get(`/v1/sellers`);
        return response.data.sellers;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}


export { createOrder, updateOrder, getOrderById, cancelOrder, deleteOrderById, getOrdersForBuyer, deleteCancelledOrders, createBuyer, getBuyers, getSellers, createSeller }