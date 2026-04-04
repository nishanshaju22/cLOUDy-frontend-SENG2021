"use client";

import { useState } from "react";
import { Icon } from "../ui/icons";
import { Field, Input, SectionLabel } from "../ui/ui";
import { updateOrder } from "../../api/order";

export function UpdateModal({ order, buyerId, onClose, onToast, onRefresh }) {
    const [form, setForm] = useState({
        order_date: "",
        delivery_date: "",
        currency_code: "",
        address: { street: "", city: "", state: "", postal_code: "", country_code: "" },
        item: { product_id: "", item_name: "", item_description: "", quantity: "", unit_price: "" },
    });

    const [loading, setLoading] = useState(false);

    const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));
    const setItem = (k, v) => setForm(f => ({ ...f, item: { ...f.item, [k]: v } }));

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const payload = {};
            if (form.order_date) payload.order_date = form.order_date;
            if (form.delivery_date) payload.delivery_date = form.delivery_date;
            if (form.currency_code) payload.currency_code = form.currency_code;

            const hasAddr = Object.values(form.address).some(v => v);
            if (hasAddr) payload.address = form.address;

            const hasItem = Object.values(form.item).some(v => v);
            if (hasItem) {
                payload.item = {
                    ...form.item,
                    quantity: form.item.quantity ? parseInt(form.item.quantity) : undefined,
                    unit_price: form.item.unit_price ? parseFloat(form.item.unit_price) : undefined,
                };
            }

            await updateOrder(buyerId, order.orderId, payload);
            onToast("Order updated!", "success");
            onRefresh();
            onClose();
        } catch (err) {
            onToast(err?.error || "Update failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.4)",
                zIndex: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(2px)",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    width: "min(680px, 95vw)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 28px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                            Update Order
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            Only fill fields you want to change
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                    >
                        <Icon.X />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Order Details */}
                    <div>
                        <SectionLabel>Order Details</SectionLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            <Field label="Order Date">
                                <Input
                                    type="date"
                                    value={form.order_date}
                                    onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
                                />
                            </Field>
                            <Field label="Delivery Date">
                                <Input
                                    type="date"
                                    value={form.delivery_date}
                                    onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                                />
                            </Field>
                            <Field label="Currency Code">
                                <Input
                                    value={form.currency_code}
                                    placeholder="AUD"
                                    onChange={e => setForm(f => ({ ...f, currency_code: e.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <SectionLabel>Address (optional)</SectionLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                            {[
                                ["street", "Street"],
                                ["city", "City"],
                                ["state", "State"],
                                ["postal_code", "Postal"],
                                ["country_code", "Country"],
                            ].map(([k, label]) => (
                                <Field key={k} label={label}>
                                    <Input
                                        value={form.address[k]}
                                        placeholder={label}
                                        onChange={e => setAddr(k, e.target.value)}
                                    />
                                </Field>
                            ))}
                        </div>
                    </div>

                    {/* Item */}
                    <div>
                        <SectionLabel>Item (optional)</SectionLabel>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <Field label="Product ID (UUID)">
                                <Input
                                    value={form.item.product_id}
                                    placeholder="2acd6acf-…"
                                    onChange={e => setItem("product_id", e.target.value)}
                                />
                            </Field>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 10 }}>
                                <Field label="Item Name">
                                    <Input
                                        value={form.item.item_name}
                                        placeholder="Widget"
                                        onChange={e => setItem("item_name", e.target.value)}
                                    />
                                </Field>
                                <Field label="Description">
                                    <Input
                                        value={form.item.item_description}
                                        placeholder="Industrial widget"
                                        onChange={e => setItem("item_description", e.target.value)}
                                    />
                                </Field>
                                <Field label="Quantity">
                                    <Input
                                        type="number"
                                        value={form.item.quantity}
                                        placeholder="15"
                                        onChange={e => setItem("quantity", e.target.value)}
                                    />
                                </Field>
                                <Field label="Unit Price">
                                    <Input
                                        type="number"
                                        value={form.item.unit_price}
                                        placeholder="50"
                                        onChange={e => setItem("unit_price", e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "16px 28px 24px",
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            color: "#475569",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 8,
                            border: "none",
                            background: loading ? "#94a3b8" : "#0f172a",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}