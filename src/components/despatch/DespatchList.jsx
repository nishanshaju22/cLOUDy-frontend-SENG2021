"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "../ui/icons";
import { listDespatch, getSellerAdviceIds } from "../../api/despatch";
import { useTheme } from "../../../app/context/ThemeContext";
export function DespatchList({ onToast, onSelect, sellerId }) {
    const { theme } = useTheme();
    const isNightSky = theme === "nightsky";
    const [despatches, setDespatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDespatches = useCallback(async () => {
        setLoading(true);
        try {
            const [allData, sellerAdviceIds] = await Promise.all([
                listDespatch(),
                getSellerAdviceIds(sellerId),
            ]);

            const sellerSet = new Set(sellerAdviceIds);
            const filtered = (allData.results || []).filter(d =>
                sellerSet.has(d["advice-id"])
            );

            setDespatches(filtered);
        } catch (err) {
            onToast(err?.error || "Failed to load despatches", "error");
            setDespatches([]);
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => {
        fetchDespatches();
    }, [fetchDespatches]);

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 20 }}>
                <button
                    onClick={fetchDespatches}
                    style={{
                        padding: "9px 22px",
                        borderRadius: 8,
                        border: isNightSky ? "1px solid rgba(255,255,255,0.12)" : "none",
                        background: isNightSky ? "#000000" : "#38bdf8",
                        color: isNightSky ? "#ffffff" : "#ffffff",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                        if (isNightSky) {
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.color = "#000000";
                        } else {
                            e.currentTarget.style.background = "#0ea5e9";
                        }
                    }}
                    onMouseLeave={e => {
                        if (isNightSky) {
                            e.currentTarget.style.background = "#000000";
                            e.currentTarget.style.color = "#ffffff";
                        } else {
                            e.currentTarget.style.background = "#38bdf8";
                        }
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                    Loading despatches…
                </div>
            ) : despatches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                    No despatches found
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {despatches.map((d, i) => (
                        <DespatchCard
                            key={d["advice-id"] || i}
                            despatch={d}
                            onClick={() => onSelect(d)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function DespatchCard({ despatch, onClick }) {
    const adviceId = despatch["advice-id"];
    const status = despatch["despatch-advice"]?.status || "active";
    const badgeText = status.toLowerCase() === "cancelled" ? "Cancelled" : "Active";

    const badgeStyle = {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: status.toLowerCase() === "cancelled" ? "#b91c1c" : "#15803d",
        background: status.toLowerCase() === "cancelled" ? "#fee2e2" : "#f0fdf4",
        border: `1px solid ${status.toLowerCase() === "cancelled" ? "#fecaca" : "#bbf7d0"}`,
        borderRadius: 20,
        padding: "2px 10px",
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 16,
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
            {/* Icon */}
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#15803d",
                }}
            >
                <Icon.Despatch />
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={badgeStyle}>{badgeText}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                    {adviceId}
                </div>
            </div>

            {/* Chevron */}
            <Icon.ChevronRight />
        </div>
    );
}