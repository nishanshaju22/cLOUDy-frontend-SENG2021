"use client";

import { useState } from "react";
import { createOrder } from "../../api/order";
import { Icon } from "../ui/icons";
import { Field, Input, SectionLabel } from "../ui/ui";

const emptyItem = () => ({
    item_name: "",
    item_description: "",
    quantity: "",
    unit_price: ""
});

export function CreateOrderForm({ buyerId, onToast, onSuccess }) {
    const [form, setForm] = useState({
        order_date: "",
        delivery_date: "",
        currency_code: "AUD",
        address: {
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country_code: "AU"
        },
        items: [emptyItem()]
    });
    const [loading, setLoading] = useState(false);
    const [xmlResult, setXmlResult] = useState(null);

    const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const setAddress = (key, value) => setForm(f => ({
        ...f,
        address: { ...f.address, [key]: value }
    }));
    const setItem = (index, key, value) => setForm(f => {
        const items = [...f.items];
        items[index] = { ...items[index], [key]: value };
        return { ...f, items };
    });
    const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    const removeItem = (index) => setForm(f => ({
        ...f,
        items: f.items.filter((_, i) => i !== index)
    }));

    const handleSubmit = async () => {
        if (!buyerId) {
            onToast("Please enter a Buyer ID first", "error");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                items: form.items.map(it => ({
                    ...it,
                    quantity: parseInt(it.quantity),
                    unit_price: parseFloat(it.unit_price)
                }))
            };
            const result = await createOrder(payload, buyerId);
            setXmlResult(result);
            onToast("Order created successfully!", "success");
            onSuccess?.();
        } catch (err) {
            onToast(err?.error || "Failed to create order", "error");
        } finally {
            setLoading(false);
        }
    };

    if (xmlResult) {
        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Order Created</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>UBL XML response from the server</div>
                    </div>
                    <button
                        onClick={() => setXmlResult(null)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "#475569"
                        }}
                    >
                        New Order
                    </button>
                </div>
                <pre
                    style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 20,
                        fontSize: 12,
                        overflowX: "auto",
                        lineHeight: 1.6,
                        color: "#334155",
                        maxHeight: 500,
                        overflowY: "auto",
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                    }}
                >
                    {xmlResult}
                </pre>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Dates & currency */}
            <div>
                <SectionLabel>Order Details</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <Field label="Order Date" required>
                        <Input
                            type="date"
                            value={form.order_date}
                            onChange={e => setField("order_date", e.target.value)}
                        />
                    </Field>
                    <Field label="Delivery Date" required>
                        <Input
                            type="date"
                            value={form.delivery_date}
                            onChange={e => setField("delivery_date", e.target.value)}
                        />
                    </Field>
                    <Field label="Currency Code" required>
                        <Input
                            value={form.currency_code}
                            placeholder="AUD"
                            maxLength={3}
                            style={{ textTransform: "uppercase" }}
                            onChange={e => setField("currency_code", e.target.value)}
                        />
                    </Field>
                </div>
            </div>

            {/* Address */}
            <div>
                <SectionLabel>Delivery Address</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Field label="Street" required>
                        <Input
                            value={form.address.street}
                            placeholder="436 George St"
                            onChange={e => setAddress("street", e.target.value)}
                        />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                        {[
                            ["city", "City", "Sydney"],
                            ["state", "State", "NSW"],
                            ["postal_code", "Postal Code", "2000"],
                            ["country_code", "Country Code", "AU"]
                        ].map(([k, label, placeholder]) => (
                            <Field key={k} label={label} required>
                                <Input
                                    value={form.address[k]}
                                    placeholder={placeholder}
                                    maxLength={k === "country_code" ? 2 : undefined}
                                    style={k === "country_code" ? { textTransform: "uppercase" } : {}}
                                    onChange={e => setAddress(k, e.target.value)}
                                />
                            </Field>
                        ))}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div>
                <SectionLabel>Items</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {form.items.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                padding: 16,
                                position: "relative"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#94a3b8",
                                    marginBottom: 12,
                                    letterSpacing: "0.06em"
                                }}
                            >
                                ITEM {i + 1}
                            </div>
                            {form.items.length > 1 && (
                                <button
                                    onClick={() => removeItem(i)}
                                    style={{
                                        position: "absolute",
                                        top: 14,
                                        right: 14,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#94a3b8",
                                        padding: 2,
                                        display: "flex"
                                    }}
                                >
                                    <Icon.X />
                                </button>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 12 }}>
                                <Field label="Item Name" required>
                                    <Input
                                        value={item.item_name}
                                        placeholder="Widget"
                                        onChange={e => setItem(i, "item_name", e.target.value)}
                                    />
                                </Field>
                                <Field label="Description">
                                    <Input
                                        value={item.item_description}
                                        placeholder="Industrial widget"
                                        onChange={e => setItem(i, "item_description", e.target.value)}
                                    />
                                </Field>
                                <Field label="Quantity" required>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        placeholder="15"
                                        onChange={e => setItem(i, "quantity", e.target.value)}
                                    />
                                </Field>
                                <Field label="Unit Price" required>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        placeholder="50"
                                        onChange={e => setItem(i, "unit_price", e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addItem}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: "1px dashed #cbd5e1",
                            background: "transparent",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#64748b",
                            cursor: "pointer",
                            width: "fit-content"
                        }}
                    >
                        <Icon.Plus /> Add Item
                    </button>
                </div>
            </div>

            <div style={{ paddingTop: 4 }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        padding: "11px 28px",
                        background: loading ? "#94a3b8" : "#0f172a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 9,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "0.02em",
                        transition: "background 0.15s"
                    }}
                >
                    {loading ? "Creating…" : "Create Order"}
                </button>
            </div>
        </div>
    );
}