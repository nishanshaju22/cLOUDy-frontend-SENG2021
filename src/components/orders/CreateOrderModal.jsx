"use client";

import { useEffect } from "react";
import { CreateOrderForm } from "./CreateOrderForm";

export function CreateOrderModal({ buyerId, onClose, onToast }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

  return (
    <>
        {/* Backdrop */}
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 600,
                background: "rgba(10, 4, 18, 0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                animation: "fadeIn 0.18s ease",
            }}
        />

        {/* Modal panel */}
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 601,
                width: "min(720px, 95vw)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)",
                animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
        >

            {/* Header */}
            <div style={{
                padding: "22px 28px 18px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "#fff",
                borderRadius: "18px 18px 0 0",
                zIndex: 1,
            }}>
            <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                        Create Order
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
                        Fill in the details below to submit a new purchase order
                    </div>
                </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#f1f5f9",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: 18,
                            lineHeight: 1,
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
                        onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
                    >
                        ✕
                    </button>
                </div>

            {/* Form body */}
            <div style={{ padding: "24px 28px 32px" }}>
                <CreateOrderForm
                    buyerId={buyerId}
                    onToast={onToast}
                    onSuccess={onClose}
                />
            </div>
        </div>

        <style>{`
            @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalIn {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `}</style>
    </>
  );
}