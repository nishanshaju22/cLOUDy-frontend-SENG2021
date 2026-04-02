"use client";

import { useState, useEffect } from "react";
import { getOrderById, cancelOrder, deleteOrderById } from "../../api/order";
import { cancelDespatchFulfilment, retrieveDespatch } from "../../api/despath";
import { Icon } from "./icons";
import { StatusBadge } from "./ui";
import { UpdateModal } from "./UpdateModal";

export function OrderDrawer({ order, buyerId, onClose, onToast, onRefresh }) {
    const [detail,       setDetail]       = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [showUpdate,   setShowUpdate]   = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [adviceId,     setAdviceId]     = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const d = await getOrderById(buyerId, order.orderId);
                setDetail(d);

                if (d?.xml) {
                    try {
                        const despatch = await retrieveDespatch("order", d.xml);
                        if (despatch?.["advice-id"]) {
                            setAdviceId(despatch["advice-id"]);
                        }
                    } catch {
                        
                    }
                }
            } catch (err) {
                onToast(err?.error || "Could not load order", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [order.orderId, buyerId]);

    const handleCancel = async () => {
        setActionLoading("cancel");
        try {
            await cancelOrder(buyerId, order.orderId);

            if (adviceId) {
                try {
                    await cancelDespatchFulfilment(adviceId, "Order cancelled by buyer");
                } catch {
                    onToast("Order cancelled — despatch cancellation failed", "error");
                }
            }

            onToast("Order cancelled", "success");
            onRefresh();
            onClose();
        } catch (err) {
            onToast(err?.error || "Cancel failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this order permanently?")) return;
        setActionLoading("delete");
        try {
            await deleteOrderById(buyerId, order.orderId);
            onToast("Order deleted", "success");
            onRefresh();
            onClose();
        } catch (err) {
            onToast(err?.error || "Delete failed", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const totalAmount = detail?.items?.reduce(
        (sum, it) => sum + parseFloat(it.totalPrice || 0), 0
    );

    const canCancel = !["CANCELED", "PROCESSED", "FINALISED"].includes(order.status);

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)",
                    zIndex: 400, backdropFilter: "blur(1px)",
                }}
            />

            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(480px, 100vw)",
                background: "#fff", zIndex: 401,
                boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
                display: "flex", flexDirection: "column",
                animation: "slideIn 0.22s ease",
            }}>
                {/* Header */}
                <div style={{
                    padding: "22px 24px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <Icon.Package />
                            <StatusBadge status={order.status} />
                            {adviceId && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                                    textTransform: "uppercase", color: "#0369a1",
                                    background: "#f0f9ff", border: "1px solid #bae6fd",
                                    borderRadius: 20, padding: "2px 8px",
                                }}>
                                    Despatched
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                            {order.orderId}
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
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", paddingTop: 60, color: "#94a3b8", fontSize: 13 }}>
                            Loading…
                        </div>
                    ) : detail ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                            {/* Despatch advice ID if found */}
                            {adviceId && (
                                <div style={{
                                    background: "#f0f9ff", border: "1px solid #bae6fd",
                                    borderRadius: 10, padding: "12px 14px",
                                }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", letterSpacing: "0.06em", marginBottom: 4 }}>
                                        DESPATCH ADVICE
                                    </div>
                                    <div style={{ fontSize: 12, color: "#0369a1", fontFamily: "monospace" }}>
                                        {adviceId}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                    letterSpacing: "0.08em", marginBottom: 12,
                                }}>
                                    ITEMS
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {detail.items?.map((it, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                            padding: "12px 14px", background: "#f8fafc",
                                            borderRadius: 10, border: "1px solid #f1f5f9",
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                                                    {it.productName}
                                                </div>
                                                {it.productDescription && (
                                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                                        {it.productDescription}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                                    Qty: <strong>{it.quantity}</strong> × ${parseFloat(it.unitPrice || 0).toFixed(2)}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>
                                                ${parseFloat(it.totalPrice || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    padding: "12px 14px", marginTop: 8,
                                    borderTop: "2px solid #0f172a",
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                                        ${totalAmount?.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* XML */}
                            {detail.xml && (
                                <div>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                        letterSpacing: "0.08em", marginBottom: 10,
                                    }}>
                                        UBL XML
                                    </div>
                                    <pre style={{
                                        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                                        padding: 14, fontSize: 11, overflowX: "auto", lineHeight: 1.5,
                                        color: "#475569", maxHeight: 240, overflowY: "auto",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    }}>
                                        {detail.xml}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", paddingTop: 60, color: "#94a3b8", fontSize: 13 }}>
                            No detail available
                        </div>
                    )}
                </div>

                {/* Action bar */}
                <div style={{
                    padding: "16px 24px", borderTop: "1px solid #f1f5f9",
                    display: "flex", gap: 8,
                }}>
                    <button
                        onClick={() => setShowUpdate(true)}
                        style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            padding: "9px 0", borderRadius: 8, border: "1px solid #e2e8f0",
                            background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                        }}
                    >
                        <Icon.Edit /> Edit
                    </button>

                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={actionLoading === "cancel"}
                            style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "9px 0", borderRadius: 8, border: "1px solid #fecdd3",
                                background: "#fff1f2", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#be123c",
                            }}
                        >
                            <Icon.Ban />
                            {actionLoading === "cancel" ? "Cancelling…" : adviceId ? "Cancel Order & Despatch" : "Cancel"}
                        </button>
                    )}

                    {order.status === "CANCELED" && (
                        <button
                            onClick={handleDelete}
                            disabled={actionLoading === "delete"}
                            style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "9px 0", borderRadius: 8, border: "1px solid #fecdd3",
                                background: "#fff1f2", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#be123c",
                            }}
                        >
                            <Icon.Trash />
                            {actionLoading === "delete" ? "Deleting…" : "Delete"}
                        </button>
                    )}
                </div>
            </div>

            {showUpdate && (
                <UpdateModal
                    order={order}
                    buyerId={buyerId}
                    onClose={() => setShowUpdate(false)}
                    onToast={onToast}
                    onRefresh={() => { onRefresh(); onClose(); }}
                />
            )}
        </>
    );
}