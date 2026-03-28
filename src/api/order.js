import api from "./axios";

async function createOrder(orderData, buyerId) {
    try {
        const response = await api.post(`/v1/buyer/${buyerId}/order`, orderData, { responseType: "text" });

        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function updateOrder(buyerId, orderId, orderData) {
    try {
        const response = await api.put(`/v1/buyer/${buyerId}/order/${orderId}`, orderData, { responseType: "text" });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getOrderById(buyerId, orderId) {
    try {
        const response = await api.get(`/v1/buyer/${buyerId}/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function cancelOrder(buyerId, orderId) {
    try {
        const response = await api.delete(`/v1/buyer/${buyerId}/order/${orderId}/CANCELED`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function deleteOrderById(buyerId, orderId) {
    try {
        const response = await api.delete(`/v1/buyer/${buyerId}/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function getOrdersForBuyer(buyerId, params) {
    try {
        const response = await api.get(`/v1/buyer/${buyerId}/order`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

async function deleteCancelledOrders(buyerId) {
    try {
        const response = await api.delete(`/v1/buyer/${buyerId}/order/CANCELED`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}


export { createOrder, updateOrder, getOrderById, cancelOrder, deleteOrderById, getOrdersForBuyer, deleteCancelledOrders }