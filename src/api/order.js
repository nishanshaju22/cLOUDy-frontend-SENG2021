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

// Products

async function getProductsBySeller(sellerId) {
    try {
        const response = await order_api.get(`/v2/seller/${sellerId}/products`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function getProductById(productId) {
    try {
        const response = await order_api.get(`/v2/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function createProduct(sellerId, data) {
    try {
        const response = await order_api.post(`/v2/seller/${sellerId}/product`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function updateProduct(sellerId, productId, data) {
    try {
        const response = await order_api.put(`/v2/seller/${sellerId}/product/${productId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function deleteProduct(sellerId, productId) {
    try {
        const response = await order_api.delete(`/v2/seller/${sellerId}/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

// Cart

async function getCart(sellerId) {
    try {
        const response = await order_api.get(`v2/seller/${sellerId}/cart`);
        return response.data;
    } catch (error) {
        console.log(error)
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function addToCart(sellerId, data) {
    try {
        const response = await order_api.post(`/v2/seller/${sellerId}/cart/item`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function updateCartItem(sellerId, productId, data) {
    try {
        const response = await order_api.put(`/v2/seller/${sellerId}/cart/item/${productId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function removeFromCart(sellerId, productId) {
    try {
        const response = await order_api.delete(`/v2/seller/${sellerId}/cart/item/${productId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function clearCart(sellerId) {
    try {
        const response = await order_api.delete(`/v2/seller/${sellerId}/cart`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
};

async function checkout(sellerId, data) {
    try {
        const response = await order_api.post(`/v2/seller/${sellerId}/cart/checkout`, data);
        console.log(response)
        return response.data;
    } catch (error) {
        console.log(error)
        throw error.response?.data || { error: "Something went wrong" };
    }
};

export { 
    createOrder, 
    updateOrder, 
    getOrderById, 
    cancelOrder, 
    deleteOrderById, 
    getOrdersForBuyer, 
    deleteCancelledOrders, 
    createBuyer, 
    getBuyers, 
    getSellers, 
    createSeller, 
    getProductsBySeller, 
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout
}