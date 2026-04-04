"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "../ui/icons";
import { StatusBadge } from "../ui/ui";
import { createDespatch, retrieveDespatch } from "../../api/despatch";
import { getOrderById } from "../../api/order";

export function OrderCard({ order, buyerId, onClick, onToast, onDespatchCreated }) {
    const [despatching, setDespatching] = useState(false);
    const [despatchData, setDespatchData] = useState(null);
    const [ripples, setRipples] = useState([]);
    const cardRef = useRef(null);

    const statusColor = order.status === "CANCELED" ? "#ef4444" : "#22c55e";

    useEffect(() => {
        if (!buyerId || !order?.orderId) return;

        let cancelled = false;

        const fetchDespatch = async () => {
            try {
                const d = await getOrderById(buyerId, order.orderId);
                const despatch = await retrieveDespatch(d.xml);

                if (!cancelled) {
                    setDespatchData(despatch);
                }
            } catch (err) {
                if (!cancelled) {
                    onToast?.(err?.error || "Could not load order", "error");
                    setDespatchData(null);
                }
            }
        };

        fetchDespatch();

        return () => {
            cancelled = true;
        };
    }, [buyerId]);

    const handleDespatch = async (e) => {
        e.stopPropagation();
        try {
            const d = await getOrderById(buyerId, order.orderId);

            if (!d.xml) {
                onToast?.("No XML available for this order", "error");
                return;
            }

            setDespatching(true);

            const result = await createDespatch(d.xml);
            onToast?.(`Despatch created — ID: ${result.adviceIds?.[0]}`, "success");
            onDespatchCreated?.();

        } catch (err) {
            onToast?.(err?.error || "Could not load order", "error");
        } finally {
            setDespatching(false);
        }
    };

    const handleCardClick = (e) => {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const key = Date.now();

        setRipples(prev => [...prev, { key, x, y, size }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.key !== key)), 600);

        onClick?.();
    };

    const isDespatchDisabled = despatching || !!despatchData || order.status === "CANCELED";

    return (
        <div
            ref={cardRef}
            onClick={handleCardClick}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderRadius: 14,
                background: "rgba(145, 229, 246, 0.4)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
            }}
        >
            {/* Ripple effect */}
            {ripples.map(r => (
                <span
                    key={r.key}
                    style={{
                        position: "absolute",
                        left: r.x,
                        top: r.y,
                        width: r.size,
                        height: r.size,
                        background: "rgba(255,255,255,0.35)",
                        borderRadius: "50%",
                        transform: "scale(0)",
                        animation: "rippleEffect 0.6s ease-out forwards",
                        pointerEvents: "none",
                    }}
                />
            ))}

            <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                <Icon.Package />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <StatusBadge status={order.status} adviceStatus={despatchData?.["advice-id"]} style={{ color: statusColor }} />
                    <span style={{ fontSize: 11, color: "#000", fontFamily: "monospace", opacity: 0.6 }}>
                        {order.orderId?.slice(0, 8)}…
                    </span>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 12, color: "#000", opacity: 0.7 }}>
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: 12, color: "#000", opacity: 0.7 }}>
                        {order.currencyCode} {parseFloat(order.totalAmount || 0).toFixed(2)}
                    </span>
                    {order.orderDate && (
                        <span style={{ fontSize: 12, color: "#000", opacity: 0.5 }}>
                            {new Date(order.orderDate).toLocaleDateString("en-AU", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    )}
                </div>
            </div>

            {/* Despatch button right-aligned */}
            <button
                onClick={handleDespatch}
                disabled={isDespatchDisabled}
                title={despatchData ? "Despatch already created" : "Create Despatch"}
                style={{
                    marginLeft: "auto",
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: isDespatchDisabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)",
                    color: isDespatchDisabled ? "rgba(0,0,0,0.3)" : "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isDespatchDisabled ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(8px)",
                    opacity: isDespatchDisabled ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                    if (!isDespatchDisabled) {
                        e.currentTarget.style.background = "#22d3ee";
                        e.currentTarget.style.color = "#000";
                        e.currentTarget.style.borderColor = "#22d3ee";
                    }
                }}
                onMouseLeave={e => {
                    if (!isDespatchDisabled) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                        e.currentTarget.style.color = "#000";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    }
                }}
            >
                <Icon.Truck />
            </button>

            <Icon.ChevronRight style={{ color: "#000", opacity: 0.4 }} />

            <style>{`
                @keyframes rippleEffect {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}