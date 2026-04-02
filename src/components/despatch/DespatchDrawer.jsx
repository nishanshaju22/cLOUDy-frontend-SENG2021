"use client";

import { useState } from "react";
import { cancelDespatchFulfilment } from "../../src/api/despatch";
import { Icon } from "../orders/icons";

export function DespatchDrawer({ despatch, onClose, onToast, onRefresh }) {
    const [cancelling, setCancelling] = useState(false);
    const [showReasonBox, setShowReasonBox] = useState(false);
    const [reason, setReason] = useState("");

    const adviceId = despatch["advice-id"];
    const xmlContent = despatch["despatch-advice"];

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

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(15,23,42,0.35)",
                    zIndex: 400,
                    backdropFilter: "blur(1px)",
                }}
            />

            {/* Drawer */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "min(480px, 100vw)",
                    background: "#fff",
                    zIndex: 401,
                    boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    animation: "slideIn 0.22s ease",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "22px 24px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <Icon.Despatch />
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    color: "#15803d",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 20,
                                    padding: "2px 10px",
                                }}
                            >
                                Active
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Advice ID */}
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#94a3b8",
                                    letterSpacing: "0.08em",
                                    marginBottom: 10,
                                }}
                            >
                                ADVICE ID
                            </div>
                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 8,
                                    padding: "10px 14px",
                                    fontSize: 12,
                                    fontFamily: "monospace",
                                    color: "#334155",
                                }}
                            >
                                {adviceId}
                            </div>
                        </div>

                        {/* Despatch XML */}
                        {xmlContent && (
                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#94a3b8",
                                        letterSpacing: "0.08em",
                                        marginBottom: 10,
                                    }}
                                >
                                    DESPATCH ADVICE XML
                                </div>
                                <pre
                                    style={{
                                        background: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 8,
                                        padding: 14,
                                        fontSize: 11,
                                        overflowX: "auto",
                                        lineHeight: 1.5,
                                        color: "#475569",
                                        maxHeight: 340,
                                        overflowY: "auto",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    }}
                                >
                                    {xmlContent}
                                </pre>
                            </div>
                        )}

                        {/* Cancellation Reason */}
                        {showReasonBox && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#94a3b8",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Cancellation Reason
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="e.g. Unable to fulfil delivery window"
                                    rows={3}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        color: "#1e293b",
                                        fontFamily: "inherit",
                                        resize: "vertical",
                                        outline: "none",
                                        lineHeight: 1.5,
                                    }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => {
                                            setShowReasonBox(false);
                                            setReason("");
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "8px 0",
                                            borderRadius: 8,
                                            border: "1px solid #e2e8f0",
                                            background: "#fff",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            color: "#475569",
                                        }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCancelFulfilment}
                                        disabled={cancelling}
                                        style={{
                                            flex: 1,
                                            padding: "8px 0",
                                            borderRadius: 8,
                                            border: "none",
                                            background: cancelling ? "#94a3b8" : "#be123c",
                                            color: "#fff",
                                            fontSize: 13,
                                            fontWeight: 700,
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
                {!showReasonBox && (
                    <div
                        style={{
                            padding: "16px 24px",
                            borderTop: "1px solid #f1f5f9",
                            display: "flex",
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={() => setShowReasonBox(true)}
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "9px 0",
                                borderRadius: 8,
                                border: "1px solid #fecdd3",
                                background: "#fff1f2",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#be123c",
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