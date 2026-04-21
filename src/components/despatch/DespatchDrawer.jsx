"use client";

import { useState, useEffect } from "react";
import { Icon } from "../ui/icons";
import { cancelDespatchFulfilment, getOrderForDespatch } from "../../api/despatch";

export function DespatchDrawer({ despatch, onClose, onToast, onRefresh, sellerId }) {
    const [cancelling,    setCancelling]    = useState(false);
    const [showReasonBox, setShowReasonBox] = useState(false);
    const [reason,        setReason]        = useState("");
    const [orderDetail,   setOrderDetail]   = useState(null);
    const [orderLoading,  setOrderLoading]  = useState(true);

    const adviceId = despatch["advice-id"];
    const d = despatch["despatch-advice"];
    const despatchXml = d?.despatchXml || null;
    const isCancelled = d?.status?.toLowerCase() === "cancelled";

    // Fetch linked order on mount
    useEffect(() => {
        if (!adviceId || !sellerId) { setOrderLoading(false); return; }
        (async () => {
            try {
                const data = await getOrderForDespatch(sellerId, adviceId);
                setOrderDetail(data);
            } catch (err) {
                console.log(err)
                setOrderDetail(null);
            } finally {
                setOrderLoading(false);
            }
        })();
    }, [adviceId]);

    const handleCancelFulfilment = async () => {
        if (!reason.trim()) {
            onToast("Please enter a cancellation reason", "error");
            return;
        }
        setCancelling(true);
        try {
            await cancelDespatchFulfilment(adviceId, reason);
            onToast("Fulfilment cancelled", "success");
            onRefresh();
            onClose();
        } catch (err) {
            onToast(err?.error || "Cancellation failed", "error");
        } finally {
            setCancelling(false);
        }
    };

    const totalAmount = orderDetail?.items?.reduce(
        (sum, it) => sum + parseFloat(it.totalPrice || 0), 0
    );

    const sectionLabel = {
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: 10, display: "block",
    };

    const fieldBox = {
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 8, padding: "10px 14px",
        fontSize: 13, color: "#1e293b", wordBreak: "break-all",
    };

    const monoBox = {
        ...fieldBox,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 11, color: "#475569",
    };

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,23,42,0.35)",
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
                borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
                overflow: "hidden",
            }}>

                {/* Header */}
                <div style={{
                    padding: "22px 24px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <Icon.Despatch />
                            <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: isCancelled ? "#b91c1c" : "#15803d",
                                background: isCancelled ? "#fee2e2" : "#f0fdf4",
                                border: `1px solid ${isCancelled ? "#fecaca" : "#bbf7d0"}`,
                                borderRadius: 20, padding: "2px 10px",
                            }}>
                                {isCancelled ? "Cancelled" : "Active"}
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                            {adviceId}
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* ── Linked Order Items ── */}
                        <div>
                            <span style={sectionLabel}>Linked Order</span>
                            {orderLoading ? (
                                <div style={{ fontSize: 13, color: "#94a3b8", padding: "12px 0" }}>
                                    Loading order…
                                </div>
                            ) : orderDetail ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                                    {/* Order meta row */}
                                    <div style={{
                                        display: "flex", gap: 10, flexWrap: "wrap",
                                        padding: "10px 14px",
                                        background: "#f8fafc", border: "1px solid #e2e8f0",
                                        borderRadius: 10,
                                    }}>
                                        <span style={{ fontSize: 11, color: "#64748b" }}>
                                            <strong>Order</strong>{" "}
                                            <span style={{ fontFamily: "monospace" }}>
                                                {orderDetail.orderId?.slice(0, 8)}…
                                            </span>
                                        </span>
                                        {orderDetail.orderDate && (
                                            <span style={{ fontSize: 11, color: "#64748b" }}>
                                                <strong>Ordered</strong>{" "}
                                                {new Date(orderDetail.orderDate).toLocaleDateString("en-AU", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </span>
                                        )}
                                        {orderDetail.deliveryDate && (
                                            <span style={{ fontSize: 11, color: "#64748b" }}>
                                                <strong>Delivery</strong>{" "}
                                                {new Date(orderDetail.deliveryDate).toLocaleDateString("en-AU", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Items */}
                                    {orderDetail.items?.map((it, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "flex-start", padding: "12px 14px",
                                            background: "#f8fafc", borderRadius: 10,
                                            border: "1px solid #f1f5f9",
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

                                    {/* Total */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        padding: "12px 14px", borderTop: "2px solid #0f172a",
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Total</span>
                                        <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                                            {orderDetail.currencyCode} ${totalAmount?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    fontSize: 12, color: "#94a3b8", fontStyle: "italic",
                                    padding: "10px 14px", background: "#f8fafc",
                                    borderRadius: 8, border: "1px solid #e2e8f0",
                                }}>
                                    No linked order found
                                </div>
                            )}
                        </div>

                        {/* IDs */}
                        <div>
                            <span style={sectionLabel}>Advice ID</span>
                            <div style={monoBox}>{adviceId}</div>
                        </div>

                        <div>
                            <span style={sectionLabel}>Original Order ID</span>
                            <div style={monoBox}>{d?.originalOrderId || "—"}</div>
                        </div>

                        {/* Dates */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <span style={sectionLabel}>Created At</span>
                                <div style={fieldBox}>
                                    {d?.createdAt ? new Date(d.createdAt).toLocaleString("en-AU") : "—"}
                                </div>
                            </div>
                            <div>
                                <span style={sectionLabel}>Cancelled At</span>
                                <div style={{ ...fieldBox, color: isCancelled ? "#b91c1c" : "#94a3b8" }}>
                                    {d?.cancelledAt ? new Date(d.cancelledAt).toLocaleString("en-AU") : "—"}
                                </div>
                            </div>
                        </div>

                        {/* Cancellation reason */}
                        {d?.cancellationReason && (
                            <div>
                                <span style={sectionLabel}>Cancellation Reason</span>
                                <div style={{ ...fieldBox, color: "#b91c1c", background: "#fff1f2", border: "1px solid #fecdd3" }}>
                                    {d.cancellationReason}
                                </div>
                            </div>
                        )}

                        {/* Despatch XML */}
                        {despatchXml && (
                            <div>
                                <span style={sectionLabel}>Despatch XML</span>
                                <pre style={{
                                    background: "#f0f9ff", border: "1px solid #bae6fd",
                                    borderRadius: 8, padding: 14, fontSize: 11,
                                    overflowX: "auto", lineHeight: 1.5, color: "#0369a1",
                                    maxHeight: 240, overflowY: "auto", margin: 0,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                }}>
                                    {despatchXml}
                                </pre>
                            </div>
                        )}

                        {/* Fulfilment cancellation XML */}
                        {d?.fulfilmentCancellationXml && (
                            <div>
                                <span style={{ ...sectionLabel, color: "#0369a1" }}>
                                    Fulfilment Cancellation XML
                                </span>
                                <pre style={{
                                    background: "#f0f9ff", border: "1px solid #bae6fd",
                                    borderRadius: 8, padding: 14, fontSize: 11,
                                    overflowX: "auto", lineHeight: 1.5, color: "#0369a1",
                                    maxHeight: 200, overflowY: "auto", margin: 0,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                }}>
                                    {d.fulfilmentCancellationXml}
                                </pre>
                            </div>
                        )}

                        {/* Cancellation reason input */}
                        {showReasonBox && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={{ ...sectionLabel, color: "#be123c" }}>
                                    Cancellation Reason
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="e.g. Unable to fulfil delivery window"
                                    rows={3}
                                    style={{
                                        padding: "10px 12px", border: "1px solid #e2e8f0",
                                        borderRadius: 8, fontSize: 13, color: "#1e293b",
                                        fontFamily: "inherit", resize: "vertical",
                                        outline: "none", lineHeight: 1.5,
                                    }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => { setShowReasonBox(false); setReason(""); }}
                                        style={{
                                            flex: 1, padding: "8px 0", borderRadius: 8,
                                            border: "1px solid #e2e8f0", background: "#fff",
                                            fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCancelFulfilment}
                                        disabled={cancelling}
                                        style={{
                                            flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                                            background: cancelling ? "#94a3b8" : "#be123c",
                                            color: "#fff", fontSize: 13, fontWeight: 700,
                                            cursor: cancelling ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {cancelling ? "Cancelling…" : "Confirm Cancel"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action bar */}
                {!isCancelled && !showReasonBox && (
                    <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                        <button
                            onClick={() => setShowReasonBox(true)}
                            style={{
                                width: "100%", display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 6, padding: "9px 0",
                                borderRadius: 8, border: "1px solid #fecdd3",
                                background: "#fff1f2", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", color: "#be123c",
                            }}
                        >
                            <Icon.Ban /> Cancel Fulfilment
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}