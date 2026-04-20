"use client";

import { useState, useRef, useEffect } from "react";
import { AddBuyerButton } from "./AddBuyerButton";
import { getBuyers } from "../../api/order";
import { deleteBuyer } from "../../api/order";
import { getAuth } from "../../lib/auth"

export function BuyerIdBar({ buyerId, onChange, onClear, onToast, sellerId }) {
    const [open, setOpen] = useState(false);
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    const selectedBuyer = buyers.find(
        (b) => (b.buyerId || b.buyer_id) === buyerId
    );

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleOpen() {
        if (open) {
            setOpen(false);
            setSearch("");
            return;
        }

        setOpen(true);
        setLoading(true);
        setError(null);

        try {
            const data = await getBuyers(sellerId);
            setBuyers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.error || "Failed to load buyers");
        } finally {
            setLoading(false);
        }
    }

    function handleSelect(buyer) {
        onChange(buyer.buyerId || buyer.buyer_id, buyer?.contact?.email);
        setOpen(false);
        setSearch("");
    }

    async function handleDeleteBuyer(buyerId) {
        if (!confirm("Delete this buyer? This cannot be undone.")) {
            return;
        }
        
        const parsed = getAuth()
        const sellerId = parsed?.user?.seller_id;

        try {
            await deleteBuyer(sellerId, buyerId);

            onToast?.(
                "Buyer deleted successfully",
                "success"
            );

            const data = await getBuyers();
            setBuyers(Array.isArray(data) ? data : []);

            if (buyerId === buyerId) {
                onClear?.();
            }

        } catch (err) {
            onToast?.(
                err?.message ||
                "Failed to delete buyer. Ensure related orders are deleted.",
                "error"
            );
        }
    }

    const filtered = buyers.filter((b) => {
        const q = search.toLowerCase();

        return (
            b.buyerId?.toLowerCase().includes(q) ||
            b.party_name?.toLowerCase().includes(q) ||
            b.customer_assigned_account_id?.toLowerCase().includes(q) ||
            b.contact_name?.toLowerCase().includes(q) ||
            b.contact_email?.toLowerCase().includes(q)
        );
    });

    return (
        <div
            style={{ position: "relative", marginBottom: 32 }}
            ref={containerRef}
        >
            {/* Trigger bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#FAFFFD",
                    borderRadius: open ? "10px 10px 0 0" : 10,
                    padding: "10px 16px",
                    cursor: "pointer",
                    transition: "border-color 0.15s"
                }}
                onClick={handleOpen}
            >
                <label
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                    }}
                >
                    Buyer ID
                </label>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {selectedBuyer ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <Avatar name={selectedBuyer.party_name} />

                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#342E37",
                                }}
                            >
                                {selectedBuyer.party_name ||
                                    selectedBuyer.buyerId}
                            </span>

                            {selectedBuyer.customer_assigned_account_id && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        background: "#f1f5f9",
                                        borderRadius: 4,
                                        padding: "1px 6px",
                                    }}
                                >
                                    {
                                        selectedBuyer.customer_assigned_account_id
                                    }
                                </span>
                            )}
                        </div>
                    ) : (
                        <span
                            style={{
                                fontSize: 13,
                                color: "#94a3b8",
                            }}
                        >
                            Select a buyer…
                        </span>
                    )}
                </div>

                {buyerId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: 0,
                            display: "flex",
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                    style={{
                        transition: "transform 0.2s",
                        transform: open
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        flexShrink: 0,
                    }}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>

                <div
                    style={{
                        width: 1,
                        height: 20,
                        background: "#e2e8f0",
                        flexShrink: 0,
                    }}
                />

                <AddBuyerButton
                    onToast={onToast}
                    onSuccess={(buyer) => {
                        if (buyer?.buyerId) {
                            onChange(
                                buyer.buyerId,
                                buyer.contact?.email
                            );
                        }
                    }}
                    sellerId={sellerId}
                />
            </div>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#FAFFFD",
                        border: "1px solid #FAFFFD",
                        borderTop: "1px solid #e2e8f0",
                        borderRadius: "0 0 10px 10px",
                        boxShadow:
                            "0 8px 24px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                        zIndex: 100,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #f1f5f9",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 7,
                                padding: "6px 10px",
                            }}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="2.5"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>

                            <input
                                autoFocus
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Search by name, email, account ID…"
                                style={{
                                    border: "none",
                                    background: "none",
                                    outline: "none",
                                    fontSize: 13,
                                    color: "#342E37",
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {loading && <LoadingState />}
                        {error && <ErrorState message={error} />}
                        {!loading && !error && filtered.length === 0 && (
                            <EmptyState />
                        )}
                        {!loading &&
                            !error &&
                            filtered.map((buyer) => (
                                <BuyerRow
                                    key={buyer.buyerId || buyer.buyer_id}
                                    buyer={buyer}
                                    selected={buyer.buyerId === buyerId}
                                    onSelect={() => handleSelect(buyer)}
                                    onDelete={() => handleDeleteBuyer(buyer.buyerId)}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BuyerRow({ buyer, selected, onSelect, onDelete }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                cursor: "pointer",
                background: selected
                    ? "#eef2ff"
                    : hovered
                    ? "#f8fafc"
                    : "transparent",
                borderLeft: selected
                    ? "5px solid #3C91E6"
                    : "5px solid transparent",
                transition: "background 0.1s",
            }}
        >
            <Avatar
                name={buyer.party_name}
                size={34}
                selected={selected}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: selected
                                ? "#4338ca"
                                : "#342E37",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {buyer.party_name || "Unnamed Buyer"}
                    </span>

                    {buyer.customer_assigned_account_id && (
                        <span
                            style={{
                                fontSize: 11,
                                color: selected
                                    ? "#3C91E6"
                                    : "#64748b",
                                background: selected
                                    ? "#e0e7ff"
                                    : "#f1f5f9",
                                borderRadius: 4,
                                padding: "1px 6px",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            {
                                buyer.customer_assigned_account_id
                            }
                        </span>
                    )}
                </div>

                {(buyer.contact_name || buyer?.contact?.email) && (
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 2,
                        }}
                    >
                        {buyer.contact_name && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#475569",
                                    fontWeight: 500,
                                }}
                            >
                                {buyer.contact_name}
                            </span>
                        )}

                        {buyer.contact_name &&
                            buyer?.contact?.email && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#cbd5e1",
                                    }}
                                >
                                    ·
                                </span>
                            )}

                        {buyer?.contact?.email && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {buyer?.contact?.email}
                            </span>
                        )}
                    </div>
                )}

                <span
                    style={{
                        fontSize: 10,
                        color: "#cbd5e1",
                        fontFamily: "monospace",
                        letterSpacing: "0.02em",
                    }}
                >
                    {buyer.buyerId}
                </span>
            </div>

            {selected && (
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3C91E6"
                    strokeWidth="2.5"
                >
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            )}

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                style={{
                    marginLeft: 8,
                    padding: 4,
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    opacity: 0.7,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = 0.7;
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                </svg>
            </div>
        </div>
    );
}

function Avatar({ name, size = 28, selected }) {
    const initials = name
        ? name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: selected
                    ? "linear-gradient(135deg, #3C91E6, #818cf8)"
                    : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.36,
                fontWeight: 700,
                color: selected ? "#FAFFFD" : "#342E37",
                flexShrink: 0,
                letterSpacing: "0.02em",
            }}
        >
            {initials}
        </div>
    );
}

function LoadingState() {
    return (
        <div
            style={{
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
            }}
        >
            <Spinner />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Loading buyers…
            </span>
        </div>
    );
}

function Spinner() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3C91E6"
            strokeWidth="2.5"
            style={{ animation: "spin 0.75s linear infinite" }}
        >
            <style>
                {`@keyframes spin { to { transform: rotate(360deg); } }`}
            </style>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
    );
}

function ErrorState({ message }) {
    return (
        <div
            style={{
                padding: "20px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#ef4444",
            }}
        >
            <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
            </svg>
            <span style={{ fontSize: 13 }}>{message}</span>
        </div>
    );
}

function EmptyState() {
    return (
        <div
            style={{
                padding: "24px 16px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
            }}
        >
            No buyers found
        </div>
    );
}