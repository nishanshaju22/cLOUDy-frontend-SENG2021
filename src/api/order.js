import api from "./axios";

const createOrder = async (buyerId, orderData) => {
    try {
        const response = await api.post(`/v1/buyer/${buyerId}/order`, orderData);

        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};





export { createOrder }