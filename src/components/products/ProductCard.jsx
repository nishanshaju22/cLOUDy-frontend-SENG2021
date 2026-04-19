"use client";

import { useState } from "react";
export function ProductCard({ product, onAddToCart, onEdit, onDelete, isManaging, cart, onUpdateQty }) {
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [added, setAdded] = useState(false);
    const [updatingQty, setUpdatingQty] = useState(false);

    const inventoryItems = product.inventoryItems || [];
    const hasInventory = inventoryItems.length > 0;
    const outOfStock = hasInventory && inventoryItems.some(i => (i.quantityAvailable ?? 0) < (i.quantityRequired ?? 1));

    const cartItem = cart?.sellers?.flatMap(s => s.items || [])?.find(i => i.productId === product.productId);
    const quantity = cartItem?.quantity || 0;
    const inCart = quantity > 0;

    const handleAddToCart = async () => {
        setAdding(true);
        try {
            await onAddToCart(product.productId);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {

        } finally {
            setAdding(false);
        }
    };

    const handleUpdateQty = async (productId, newQty) => {
        setUpdatingQty(true);
        try {
            await onUpdateQty(productId, newQty);
        } finally {
            setUpdatingQty(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete "${product.productName}"?`)) return;
        setDeleting(true);
        try {
            await onDelete(product.productId);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.imageArea}>
                <div style={styles.imagePlaceholder}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                        stroke="#c8c8c8" strokeWidth="1" style={{ opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                    </svg>
                </div>

                {/* Out of stock badge */}
                {outOfStock && (
                    <div style={styles.outOfStockBadge}>Out of Stock</div>
                )}

                {product.sellerName && (
                    <div style={styles.sellerBadge}>{product.sellerName}</div>
                )}
            </div>

            <div style={styles.info}>
                <div style={styles.name}>{product.productName}</div>
                {product.productDescription && (
                    <div style={styles.description}>{product.productDescription}</div>
                )}
                <div style={styles.price}>${parseFloat(product.unitPrice).toFixed(2)}</div>

                {/* Inventory items pills */}
                {hasInventory && (
                    <div style={styles.inventoryPills}>
                        {inventoryItems.map(inv => {
                            const sufficient = (inv.quantityAvailable ?? 0) >= (inv.quantityRequired ?? 1);
                            return (
                                <div
                                    key={inv.inventoryId}
                                    title={`Requires ${inv.quantityRequired} · ${inv.quantityAvailable} available`}
                                    style={{
                                        ...styles.pill,
                                        background: sufficient ? "#f0fdf4" : "#fff1f2",
                                        color: sufficient ? "#15803d" : "#be123c",
                                        border: `1px solid ${sufficient ? "#bbf7d0" : "#fecdd3"}`,
                                    }}
                                >
                                    {inv.itemName}
                                    <span style={{ opacity: 0.7 }}> ×{inv.quantityRequired}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isManaging ? (
                <div style={styles.manageBtnRow}>
                    <button
                        onClick={() => onEdit(product)}
                        style={styles.editBtn}
                    >
                        <EditIcon /> Edit
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        style={styles.deleteBtn}
                    >
                        {deleting ? (
                            <SpinnerIcon size={13} color="#fff" />
                        ) : (
                            <>
                                <TrashIcon /> Delete
                            </>
                        )}
                    </button>
                </div>
            ) : inCart ? (
                <div style={styles.qtyControl}>
                    <button
                        onClick={() => handleUpdateQty(product.productId, quantity - 1)}
                        disabled={updatingQty || quantity <= 1}
                        style={styles.qtyBtn}
                    >
                        −
                    </button>

                    <div style={styles.qtyValue}>
                        {updatingQty ? <SpinnerIcon size={12} color="#111" /> : quantity}
                    </div>

                    <button
                        onClick={() => handleUpdateQty(product.productId, quantity + 1)}
                        disabled={updatingQty || outOfStock}
                        style={{
                            ...styles.qtyBtn,
                            ...(outOfStock ? { background: "#e5e5e5", color: "#999", cursor: "not-allowed" } : {}),
                        }}
                    >
                        +
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleAddToCart}
                    disabled={adding || outOfStock}
                    style={{
                        ...styles.addBtn,
                        ...(added ? styles.addBtnAdded : {}),
                        ...(outOfStock ? styles.addBtnDisabled : {}),
                    }}
                >
                    {adding ? (
                        <><SpinnerIcon size={13} color="#fff" /> Adding…</>
                    ) : added ? (
                        <><CheckIcon /> Added</>
                    ) : outOfStock ? (
                        "Out of Stock"
                    ) : (
                        "Add to Cart"
                    )}
                </button>
            )}
        </div>
    );
}

const styles = {
    card: {
        display: "flex", flexDirection: "column", cursor: "default",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    imageArea: {
        position: "relative", background: "#f5f5f5", borderTopLeftRadius: 24,
        borderTopRightRadius: 24, borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
        aspectRatio: "1 / 1", overflow: "hidden", marginBottom: 12,
    },
    imagePlaceholder: {
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    manageControls: { position: "absolute", top: 8, right: 8, display: "flex", gap: 6 },
    iconBtn: {
        width: 32, height: 32, borderRadius: "50%", border: "none",
        background: "rgba(255,255,255,0.92)", display: "flex",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
        color: "#1a1a1a", backdropFilter: "blur(4px)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)", transition: "background 0.15s", flexShrink: 0,
    },
    iconBtnDanger: { color: "#be123c" },
    outOfStockBadge: {
        position: "absolute", top: 8, left: 8,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "#fff",
        background: "#dc2626", borderRadius: 3, padding: "3px 7px",
    },
    sellerBadge: {
        position: "absolute", bottom: 8, left: 8,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "#111",
        background: "rgba(255,255,255,0.88)", borderRadius: 3,
        padding: "3px 7px", backdropFilter: "blur(4px)",
    },
    info: { display: "flex", flexDirection: "column", gap: 3, marginBottom: 12, flex: 1 },
    name: { fontSize: 15, fontWeight: 500, color: "#111", lineHeight: 1.3 },
    description: { fontSize: 13, color: "#757575", lineHeight: 1.4 },
    price: { fontSize: 15, fontWeight: 500, color: "#111", marginTop: 4 },
    inventoryPills: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 },
    pill: {
        fontSize: 10, fontWeight: 600, borderRadius: 4,
        padding: "2px 7px", letterSpacing: "0.02em",
    },
    addBtn: {
        width: "100%", padding: "13px 0", background: "#111", color: "#fff",
        border: "none", borderRadius: 30, fontSize: 13, fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, transition: "background 0.2s", letterSpacing: "0.02em",
    },
    addBtnAdded: { background: "#15803d" },
    addBtnDisabled: { background: "#e5e5e5", color: "#999", cursor: "not-allowed" },
    manageBtnRow: {
        display: "flex",
        gap: 8,
    },

    editBtn: {
        flex: 1,
        padding: "13px 0",
        borderRadius: 30,
        border: "1px solid #e5e5e5",
        background: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    deleteBtn: {
        flex: 1,
        padding: "13px 0",
        borderRadius: 30,
        border: "none",
        background: "#be123c",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    qtyControl: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #e5e5e5",
        borderRadius: 30,
        overflow: "hidden",
        height: 44,
    },
    qtyBtn: {
        width: 70,
        height: 70,
        border: "none",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        padding: "20px",
        borderRadius: 20,
    },
    qtyValue: {
        flex: 1,
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
};

function EditIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function TrashIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function CheckIcon() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;
}
export function SpinnerIcon({ size = 14, color = "#111" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2.5"
            style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>
    );
}