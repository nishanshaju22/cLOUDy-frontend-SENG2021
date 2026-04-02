"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrdersForBuyer, deleteCancelledOrders } from "../../api/order";
import { Icon } from "./icons";
import { Input, inputStyle } from "./ui";
import { OrderCard } from "./OrderCard";
import { OrderDrawer } from "./OrderDrawer";

export function OrdersList({ buyerId, onToast }) {
    const [orders, setOrders]           = useState([]);
    const [loading, setLoading]         = useState(false);
    const [selected, setSelected]       = useState(null);
    const [deletingAll, setDeletingAll] = useState(false);
    const [filters, setFilters]         = useState({
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

    const labelStyle = {
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: 5,
        display: "block",
    };

    return (
        <div>
            {/* Filters */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>

                {/* Left group */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", flex: 1 }}>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 56 }}>
                        <label style={labelStyle}>Status</label>
                        <select
                            value={filters.status}
                            onChange={e => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
                            style={{ ...inputStyle, width: 140, height: 38, cursor: "pointer" }}
                        >
                            <option value="">All</option>
                            {["CREATED", "PROCESSED", "FINALISED", "CANCELED"].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 56 }}>
                        <label style={labelStyle}>From</label>
                        <Input
                            type="date"
                            value={filters.fromDate}
                            style={{ width: 150 }}
                            onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value, offset: 0 }))}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 56 }}>
                        <label style={labelStyle}>To</label>
                        <Input
                            type="date"
                            value={filters.toDate}
                            style={{ width: 150 }}
                            onChange={e => setFilters(f => ({ ...f, toDate: e.target.value, offset: 0 }))}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 56 }}>
                        <label style={labelStyle}>Per Page</label>
                        <select
                            value={filters.limit}
                            onChange={e => setFilters(f => ({ ...f, limit: parseInt(e.target.value), offset: 0 }))}
                            style={{ ...inputStyle, width: 90, height: 38, cursor: "pointer" }}
                        >
                            {[5, 10, 25, 50].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    {hasCancelled && (
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 56 }}>
                            <button
                                onClick={handleDeleteCancelled}
                                disabled={deletingAll}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "9px 16px", borderRadius: 8,
                                    border: "1px solid #fecdd3", background: "#fff1f2",
                                    fontSize: 13, fontWeight: 600,
                                    cursor: deletingAll ? "not-allowed" : "pointer",
                                    color: "#be123c",
                                }}
                            >
                                <Icon.Trash />
                                {deletingAll ? "Deleting…" : "Delete All Cancelled"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Refresh */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignSelf: "flex-start", marginLeft: "auto" }}>
                    <button
                        onClick={fetchOrders}
                        style={{
                            padding: "10px 50px", borderRadius: 100, border: "none",
                            background: "#30C1FF", color: "#fff",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: "background 0.30s",
                        }}
                        onMouseEnter={e => {e.currentTarget.style.background = "#00425F"}}
                        onMouseLeave={e => e.currentTarget.style.background = "#30C1FF"}
                    >
                        Refresh
                    </button>
                </div>

            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                    Loading orders…
                </div>
            ) : !buyerId ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                    Enter a Buyer ID above to load orders
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
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
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>
                        Page {page} of {totalPages} · {total} order{total !== 1 ? "s" : ""}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            disabled={filters.offset === 0}
                            onClick={() => setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))}
                            style={{
                                padding: "7px 14px", borderRadius: 7, border: "1px solid #e2e8f0",
                                background: "#fff", fontSize: 13, fontWeight: 600,
                                cursor: filters.offset === 0 ? "not-allowed" : "pointer",
                                color: filters.offset === 0 ? "#cbd5e1" : "#475569",
                                display: "flex", alignItems: "center", gap: 4,
                            }}
                        >
                            <Icon.ChevronLeft /> Prev
                        </button>
                        <button
                            disabled={filters.offset + filters.limit >= total}
                            onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
                            style={{
                                padding: "7px 14px", borderRadius: 7, border: "1px solid #e2e8f0",
                                background: "#fff", fontSize: 13, fontWeight: 600,
                                cursor: filters.offset + filters.limit >= total ? "not-allowed" : "pointer",
                                color: filters.offset + filters.limit >= total ? "#cbd5e1" : "#475569",
                                display: "flex", alignItems: "center", gap: 4,
                            }}
                        >
                            Next <Icon.ChevronRight />
                        </button>
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