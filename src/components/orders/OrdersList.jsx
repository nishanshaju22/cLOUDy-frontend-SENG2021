"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrdersForBuyer, deleteCancelledOrders } from "../../api/order";
import { Icon } from "../ui/icons";
import { OrderCard } from "./OrderCard";
import { OrderDrawer } from "./OrderDrawer";
import { GlassCard } from "../ui/GlassCard";
import { RippleButton } from "../ui/RippleButton";

const glassInputStyle = {
    padding: "9px 12px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    fontSize: 13,
    color: "#A5EFFD",
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
};

const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#A5EFFD",
    marginBottom: 6,
    display: "block",
};

function GlassInput({ style, ...props }) {
    return (
        <input
            style={{ ...glassInputStyle, ...style }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.35)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            {...props}
        />
    );
}

function GlassSelect({ style, children, ...props }) {
    return (
        <select
            style={{
                ...glassInputStyle,
                cursor: "pointer",
                appearance: "auto",
                ...style,
            }}
            {...props}
        >
            {children}
        </select>
    );
}

export function OrdersList({ buyerId, onToast }) {
    const [orders,      setOrders]      = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [selected,    setSelected]    = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const [filters,     setFilters]     = useState({
        status: "", fromDate: "", toDate: "", limit: 10, offset: 0,
    });
    const [total, setTotal] = useState(0);

    const fetchOrders = useCallback(async () => {
        if (!buyerId) return;
        setLoading(true);
        try {
            const params = {};
            if (filters.status)   params.status   = filters.status;
            if (filters.fromDate) params.fromDate  = filters.fromDate;
            if (filters.toDate)   params.toDate    = filters.toDate;
            params.limit  = filters.limit;
            params.offset = filters.offset;

            const data = await getOrdersForBuyer(buyerId, params);
            setOrders(data.orders || []);
            setTotal(data.count || 0);
        } catch (err) {
            onToast(err?.error || "Failed to load orders", "error");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [buyerId, filters]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleDeleteCancelled = async () => {
        if (!confirm("Delete all cancelled orders for this buyer?")) return;
        setDeletingAll(true);
        try {
            await deleteCancelledOrders(buyerId);
            onToast("All cancelled orders deleted", "success");
            fetchOrders();
        } catch (err) {
            onToast(err?.error || "Failed to delete cancelled orders", "error");
        } finally {
            setDeletingAll(false);
        }
    };

    const hasCancelled = orders.some(o => o.status === "CANCELED");
    const page         = Math.floor(filters.offset / filters.limit) + 1;
    const totalPages   = Math.ceil(total / filters.limit) || 1;

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>

                {/* Left group */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", flex: 1 }}>

                    <div style={{ display: "flex", flexDirection: "column", height: 58, justifyContent: "space-between" }}>
                        <label style={labelStyle}>Status</label>
                        <GlassSelect
                            value={filters.status}
                            onChange={e => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
                            style={{ width: 140, height: 38 }}
                        >
                            <option value="">All</option>
                            {["CREATED", "PROCESSED", "FINALISED", "CANCELED"].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </GlassSelect>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", height: 58, justifyContent: "space-between" }}>
                        <label style={labelStyle}>From</label>
                        <GlassInput
                            type="date"
                            value={filters.fromDate}
                            style={{ width: 150 }}
                            onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value, offset: 0 }))}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", height: 58, justifyContent: "space-between" }}>
                        <label style={labelStyle}>To</label>
                        <GlassInput
                            type="date"
                            value={filters.toDate}
                            style={{ width: 150 }}
                            onChange={e => setFilters(f => ({ ...f, toDate: e.target.value, offset: 0 }))}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", height: 58, justifyContent: "space-between" }}>
                        <label style={labelStyle}>Per Page</label>
                        <GlassSelect
                            value={filters.limit}
                            onChange={e => setFilters(f => ({ ...f, limit: parseInt(e.target.value), offset: 0 }))}
                            style={{ width: 90, height: 38 }}
                        >
                            {[5, 10, 25, 50].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </GlassSelect>
                    </div>

                    {hasCancelled && (
                        <div style={{ display: "flex", flexDirection: "column", height: 58, justifyContent: "flex-end" }}>
                            <RippleButton
                                onClick={handleDeleteCancelled}
                                disabled={deletingAll}
                                rippleColor="rgba(239,68,68,0.3)"
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "9px 14px", borderRadius: 10,
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    background: "rgba(239,68,68,0.1)",
                                    fontSize: 13, fontWeight: 600,
                                    color: "#f87171",
                                }}
                            >
                                <Icon.Trash />
                                {deletingAll ? "Deleting…" : "Delete All Cancelled"}
                            </RippleButton>
                        </div>
                    )}
                </div>

                {/* Refresh */}
                <div style={{ alignSelf: "flex-start" }}>
                    <RippleButton
                        onClick={fetchOrders}
                        rippleColor="rgba(255,255,255,0.3)"
                        style={{
                            padding: "10px 28px",
                            borderRadius: 100,
                            border: "1px solid rgba(48,193,255,0.4)",
                            background: "rgba(48,193,255,0.15)",
                            backdropFilter: "blur(8px)",
                            color: "#30C1FF",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(48,193,255,0.28)";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(48,193,255,0.15)";
                            e.currentTarget.style.color = "#30C1FF";
                        }}
                    >
                        Refresh
                    </RippleButton>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#A5EFFD", fontSize: 14 }}>
                    Loading orders…
                </div>
            ) : !buyerId ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#A5EFFD", fontSize: 14 }}>
                    Enter a Buyer ID above to load orders
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#A5EFFD", fontSize: 14 }}>
                    No orders found
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {orders.map(order => (
                        <OrderCard
                            key={order.orderId}
                            order={order}
                            buyerId={buyerId}
                            onClick={() => setSelected(order)}
                            onToast={onToast}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                    <span style={{ fontSize: 13, color: "#A5EFFD" }}>
                        Page {page} of {totalPages} · {total} order{total !== 1 ? "s" : ""}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <RippleButton
                            disabled={filters.offset === 0}
                            onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
                            rippleColor="rgba(255,255,255,0.2)"
                            style={{
                                padding: "7px 14px", borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                fontSize: 13, fontWeight: 600,
                                color: filters.offset === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                                display: "flex", alignItems: "center", gap: 4,
                            }}
                        >
                            <Icon.ChevronLeft /> Prev
                        </RippleButton>
                        <RippleButton
                            disabled={filters.offset + filters.limit >= total}
                            onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
                            rippleColor="rgba(255,255,255,0.2)"
                            style={{
                                padding: "7px 14px", borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                fontSize: 13, fontWeight: 600,
                                color: filters.offset + filters.limit >= total ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                                display: "flex", alignItems: "center", gap: 4,
                            }}
                        >
                            Next <Icon.ChevronRight />
                        </RippleButton>
                    </div>
                </div>
            )}

            {selected && (
                <OrderDrawer
                    order={selected}
                    buyerId={buyerId}
                    onClose={() => setSelected(null)}
                    onToast={onToast}
                    onRefresh={fetchOrders}
                />
            )}
        </div>
    );
}