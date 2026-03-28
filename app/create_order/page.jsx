"use client";

import { useState } from "react";
import { createOrder } from "../../src/api/order";

export default function CreateOrderPage() {
    const [buyerId, setBuyerId] = useState("");
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);
        setResponse(null);

        try {
            const orderData = {
                product,
                quantity,
                order_date: new Date().toISOString(),
            };

            const res = await createOrder(buyerId, orderData);

            setResponse(res);
        } catch (err) {
            setError(err.error || "Failed to create order");
        }
    };

  return (
    <div style={{ padding: "2rem" }}>
        <h1>Create Order</h1>

        <form onSubmit={handleSubmit}>
            <input
                placeholder="Buyer ID"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
            />

            <input
                placeholder="Product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
            />

            <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />

            <button type="submit">Create Order</button>
        </form>

        {response && (
            <div>
                <h3>Response (XML):</h3>
                <pre>{response}</pre>
            </div>
        )}

        {error && (
            <div style={{ color: "red" }}>
                <p>{error}</p>
            </div>
        )}
    </div>
  );
}