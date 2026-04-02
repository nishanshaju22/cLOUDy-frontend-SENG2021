"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { StatusBadge } from "./ui";
import { createDespatch } from "../../api/despatch";
import { getOrderById } from "../../api/order";

export function OrderCard({ order, buyerId, onClick, onToast, onDespatchCreated }) {
    const [despatching, setDespatching] = useState(false);

    const handleDespatch = async (e) => {
        e.stopPropagation();

        try {
            const d = await getOrderById(buyerId, order.orderId);

            if (!d.xml) {
                onToast?.("No XML available for this order", "error");
                return;
            }
            
            setDespatching(true);
            
            try {
                const result = await createDespatch(d.xml);
                onToast?.(`Despatch created — ID: ${result.adviceIds?.[0]}`, "success");
                onDespatchCreated?.();
            } catch (err) {
                onToast?.(err?.error || "Failed to create despatch", "error");
            } finally {
                setDespatching(false);
            }
        } catch (err) {
            onToast?.(err?.error || "Could not load order", "error");
        }

    };

    return (
        <div
            onClick={onClick}
            style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 12, padding: "16px 20px",
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 16,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#94a3b8";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#f8fafc", border: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Icon.Package />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <StatusBadge status={order.status} />
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                        {order.orderId?.slice(0, 8)}…
                    </span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                        {order.currencyCode} {parseFloat(order.totalAmount || 0).toFixed(2)}
                    </span>
                    {order.orderDate && (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {new Date(order.orderDate).toLocaleDateString("en-AU", {
                                day: "numeric", month: "short", year: "numeric",
                            })}
                        </span>
                    )}
                </div>
            </div>

            {/* despatch button */}
            <button
                onClick={handleDespatch}
                disabled={despatching}
                title="Create Despatch"
                style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    border: "1px solid #e2e8f0", background: despatching ? "#f1f5f9" : "#fff",
                    color: despatching ? "#94a3b8" : "#475569",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: despatching ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                    if (!despatching) {
                        e.currentTarget.style.background = "#0f172a";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#0f172a";
                    }
                }}
                onMouseLeave={e => {
                    if (!despatching) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                }}
            >
                <Icon.Truck />
            </button>

            <Icon.ChevronRight />
        </div>
    );
}