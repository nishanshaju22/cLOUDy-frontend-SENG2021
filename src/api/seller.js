import { order_api } from "./axios";

async function updateSellerSettings(sellerId, data) {
  try {
    const response = await order_api.put(`/v1/seller/${sellerId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Something went wrong" };
  }
}

export { updateSellerSettings };