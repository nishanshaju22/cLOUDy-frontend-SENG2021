"use client";

import { useState, useEffect } from "react";
import { getOrderById, cancelOrder, deleteOrderById } from "../../api/order";
import { cancelDespatchFulfilment, retrieveDespatch } from "../../api/despatch";
import { Icon } from "../ui/icons";
import { StatusBadge } from "../ui/ui";
import { UpdateModal } from "./UpdateModal";
import { createPortal } from "react-dom";
import { RippleButton } from "../ui/RippleButton";
import { createInvoice } from "../../api/invoice";

export function OrderDrawer({ order, buyerId, onClose, onToast, onRefresh }) {
    const [detail,          setDetail]          = useState(null);
    const [loading,         setLoading]         = useState(true);
    const [showUpdate,      setShowUpdate]       = useState(false);
    const [actionLoading,   setActionLoading]   = useState(null);
    const [adviceId,        setAdviceId]        = useState(null);
    const [despatchXml,     setDespatchXml]     = useState(null);
    const [invoice,         setInvoice]         = useState(null);
    const [invoiceLoading,  setInvoiceLoading]  = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const d = await getOrderById(buyerId, order.orderId);
                setDetail(d);

                if (order.status === "CANCELED") {
                    setAdviceId(null);
                    setDespatchXml(null);
                    return;
                }

                if (d.xml) {
                    const despatch = await retrieveDespatch(d.xml);
                    if (despatch?.["advice-id"]) setAdviceId(despatch["advice-id"]);
                    if (despatch?.["despatch-advice"]) setDespatchXml(despatch["despatch-advice"]);
                }
            } catch (err) {
                return;
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
                    await cancelDespatchFulfilment(adviceId, "User cancelled order");
                    setAdviceId(null);
                    setDespatchXml(null);
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

    const handleCreateInvoice = async () => {
        if (!detail?.xml) {
            onToast("No order XML available to generate invoice", "error");
            return;
        }
        setInvoiceLoading(true);
        try {
            const result = await createInvoice(detail.xml, detail.orderId);
            setInvoice(result);
            onToast("Invoice created successfully", "success");
        } catch (err) {
            onToast(err?.error || "Invoice creation failed", "error");
        } finally {
            setInvoiceLoading(false);
        }
    };

    const totalAmount = detail?.items?.reduce(
        (sum, it) => sum + parseFloat(it.totalPrice || 0), 0
    );

    const canCancel = !["CANCELED", "PROCESSED", "FINALISED"].includes(order.status);
    const canInvoice = detail?.xml && !["CANCELED"].includes(order.status);

    return createPortal(
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,23,42,0.35)",
                    zIndex: 400, backdropFilter: "blur(1px)"
                }}
            />

            <div
                style={{
                    position: "fixed", top: 0, right: 0, bottom: 0,
                    width: "min(480px, 100vw)",
                    background: "#FAFFFD", zIndex: 401,
                    boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
                    display: "flex", flexDirection: "column",
                    animation: "slideIn 0.22s ease",
                    borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "22px 24px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between"
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <Icon.Package />
                            <StatusBadge status={order.status} adviceStatus={adviceId} />
                            {adviceId && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    letterSpacing: "0.06em", textTransform: "uppercase",
                                    color: "#0369a1", background: "#f0f9ff",
                                    border: "1px solid #bae6fd",
                                    borderRadius: 20, padding: "2px 8px"
                                }}>
                                    Despatched
                                </span>
                            )}
                            {invoice && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    letterSpacing: "0.06em", textTransform: "uppercase",
                                    color: "#15803d", background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 20, padding: "2px 8px"
                                }}>
                                    Invoiced
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

                            {/* Despatch advice badge */}
                            {adviceId && (
                                <div style={{
                                    background: "#f0f9ff", border: "1px solid #bae6fd",
                                    borderRadius: 10, padding: "12px 14px"
                                }}>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: "#0369a1",
                                        letterSpacing: "0.06em", marginBottom: 4
                                    }}>
                                        DESPATCH ADVICE
                                    </div>
                                    <div style={{ fontSize: 12, color: "#0369a1", fontFamily: "monospace" }}>
                                        {adviceId}
                                    </div>
                                </div>
                            )}

                            {/* Invoice result */}
                            {invoice && (
                                <div style={{
                                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                                    borderRadius: 10, padding: "14px 16px",
                                    display: "flex", flexDirection: "column", gap: 10
                                }}>
                                    {/* Header row */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{
                                            fontSize: 11, fontWeight: 700, color: "#15803d",
                                            letterSpacing: "0.06em", textTransform: "uppercase"
                                        }}>
                                            Invoice Generated
                                        </div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700,
                                            color: "#15803d", background: "#dcfce7",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: 20, padding: "2px 8px",
                                            textTransform: "uppercase", letterSpacing: "0.06em"
                                        }}>
                                            {invoice.status}
                                        </span>
                                    </div>

                                    {/* Invoice ID + created at */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <span style={{ fontSize: 11, color: "#166534", fontWeight: 600, minWidth: 80 }}>
                                                Invoice ID
                                            </span>
                                            <span style={{
                                                fontSize: 11, color: "#15803d",
                                                fontFamily: "monospace", background: "#dcfce7",
                                                borderRadius: 4, padding: "2px 6px"
                                            }}>
                                                {invoice.invoiceId}
                                            </span>
                                        </div>
                                        {invoice.createdAt && (
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span style={{ fontSize: 11, color: "#166534", fontWeight: 600, minWidth: 80 }}>
                                                    Created
                                                </span>
                                                <span style={{ fontSize: 11, color: "#15803d" }}>
                                                    {new Date(invoice.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Invoice XML */}
                                    {invoice.invoiceXML && (
                                        <div>
                                            <div style={{
                                                fontSize: 10, fontWeight: 700, color: "#166534",
                                                letterSpacing: "0.06em", marginBottom: 6,
                                                textTransform: "uppercase"
                                            }}>
                                                Invoice XML
                                            </div>
                                            <pre style={{
                                                background: "#dcfce7",
                                                border: "1px solid #bbf7d0",
                                                borderRadius: 8, padding: 12,
                                                fontSize: 10, overflowX: "auto",
                                                lineHeight: 1.5, color: "#166534",
                                                maxHeight: 200, overflowY: "auto",
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                margin: 0,
                                            }}>
                                                {invoice.invoiceXML}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                    letterSpacing: "0.08em", marginBottom: 12
                                }}>
                                    ITEMS
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {detail.items?.map((it, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "flex-start", padding: "12px 14px",
                                            background: "#f8fafc", borderRadius: 10,
                                            border: "1px solid #f1f5f9"
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
                                    borderTop: "2px solid #0f172a"
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                                        ${totalAmount?.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Order XML */}
                            {detail.xml && (
                                <div>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                                        letterSpacing: "0.08em", marginBottom: 10
                                    }}>
                                        ORDER XML
                                    </div>
                                    <pre style={{
                                        background: "#f8fafc", border: "1px solid #e2e8f0",
                                        borderRadius: 8, padding: 14, fontSize: 11,
                                        overflowX: "auto", lineHeight: 1.5, color: "#475569",
                                        maxHeight: 240, overflowY: "auto",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                                    }}>
                                        {detail.xml}
                                    </pre>
                                </div>
                            )}

                            {/* Despatch XML */}
                            {despatchXml && (
                                <div>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700, color: "#0369a1",
                                        letterSpacing: "0.08em", marginBottom: 10
                                    }}>
                                        DESPATCH XML
                                    </div>
                                    <pre style={{
                                        background: "#f0f9ff", border: "1px solid #bae6fd",
                                        borderRadius: 8, padding: 14, fontSize: 11,
                                        overflowX: "auto", lineHeight: 1.5, color: "#0369a1",
                                        maxHeight: 240, overflowY: "auto",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                                    }}>
                                        {despatchXml}
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
                    padding: "16px 24px",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <RippleButton
                            onClick={() => setShowUpdate(true)}
                            style={{
                                flex: 1, display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 6, padding: "9px 0",
                                borderRadius: 8, border: "1px solid #e2e8f0",
                                background: "#FAFFFD", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", color: "#475569"
                            }}
                        >
                            <Icon.Edit /> Edit
                        </RippleButton>

                        {canCancel && (
                            <RippleButton
                                onClick={handleCancel}
                                disabled={actionLoading === "cancel"}
                                style={{
                                    flex: 1, display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 6, padding: "9px 5px",
                                    borderRadius: 8, border: "1px solid #fecdd3",
                                    background: "#fff1f2", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", color: "#be123c"
                                }}
                            >
                                <Icon.Ban />
                                {actionLoading === "cancel"
                                    ? "Cancelling…"
                                    : adviceId ? "Cancel Order & Despatch" : "Cancel"}
                            </RippleButton>
                        )}

                        {order.status === "CANCELED" && (
                            <RippleButton
                                onClick={handleDelete}
                                disabled={actionLoading === "delete"}
                                style={{
                                    flex: 1, display: "flex", alignItems: "center",
                                    justifyContent: "center", gap: 6, padding: "9px 0",
                                    borderRadius: 8, border: "1px solid #fecdd3",
                                    background: "#fff1f2", fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", color: "#be123c"
                                }}
                            >
                                <Icon.Trash />
                                {actionLoading === "delete" ? "Deleting…" : "Delete"}
                            </RippleButton>
                        )}
                        
                    </div>

                    {/* Create Invoice button */}
                    {canInvoice && !invoice && (
                        <RippleButton
                            onClick={handleCreateInvoice}
                            disabled={invoiceLoading}
                            style={{
                                flex: 1, display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 6, padding: "9px 0",
                                borderRadius: 8, border: "1px solid #bbf7d0",
                                background: invoiceLoading ? "#f0fdf4" : "#dcfce7",
                                fontSize: 13, fontWeight: 600,
                                cursor: invoiceLoading ? "not-allowed" : "pointer",
                                color: "#15803d",
                                opacity: invoiceLoading ? 0.8 : 1,
                                transition: "background 0.15s",
                            }}
                        >
                            {invoiceLoading ? (
                                <>
                                    <InlineSpinner color="#15803d" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <InvoiceIcon />
                                    Create Invoice
                                </>
                            )}
                        </RippleButton>
                    )}

                    {/* Already invoiced — disabled state */}
                    {invoice && (
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 6, padding: "9px 0",
                            borderRadius: 8, border: "1px solid #bbf7d0",
                            background: "#f0fdf4", fontSize: 13, fontWeight: 600,
                            color: "#15803d", userSelect: "none",
                        }}>
                            <CheckIcon /> Invoice Created
                        </div>
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
        </>,
        document.body
    );
}

/* ── Small inline helpers ───────────────────────────────────── */

function InlineSpinner({ color = "#15803d" }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2.5"
            style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
    );
}

function InvoiceIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}