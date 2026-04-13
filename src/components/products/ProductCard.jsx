"use client";

import { useState } from "react";

export function ProductCard({ product, onAddToCart, onEdit, onDelete, isManaging }) {
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [added, setAdded] = useState(false);

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
            {/* Product image placeholder — matches Nike card proportions */}
            <div style={styles.imageArea}>
                <div style={styles.imagePlaceholder}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                        stroke="#c8c8c8" strokeWidth="1" style={{ opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                    </svg>
                </div>

                {/* Manage controls — overlay top right */}
                {isManaging && (
                    <div style={styles.manageControls}>
                        <button
                            onClick={() => onEdit(product)}
                            style={styles.iconBtn}
                            title="Edit product"
                        >
                            <EditIcon />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ ...styles.iconBtn, ...styles.iconBtnDanger }}
                            title="Delete product"
                        >
                            {deleting ? <SpinnerIcon size={14} color="#be123c" /> : <TrashIcon />}
                        </button>
                    </div>
                )}

                {/* Seller badge */}
                {product.sellerName && (
                    <div style={styles.sellerBadge}>
                        {product.sellerName}
                    </div>
                )}
            </div>

            {/* Product info — tight, like Nike's card text */}
            <div style={styles.info}>
                <div style={styles.name}>{product.productName}</div>
                {product.productDescription && (
                    <div style={styles.description}>{product.productDescription}</div>
                )}
                <div style={styles.price}>
                    ${parseFloat(product.unitPrice).toFixed(2)}
                </div>
            </div>

            {/* Add to cart */}
            <button
                onClick={handleAddToCart}
                disabled={adding}
                style={{
                    ...styles.addBtn,
                    ...(added ? styles.addBtnAdded : {}),
                }}
            >
                {adding ? (
                    <><SpinnerIcon size={13} color="#fff" /> Adding…</>
                ) : added ? (
                    <><CheckIcon /> Added</>
                ) : (
                    "Add to Cart"
                )}
            </button>
        </div>
    );
}

const styles = {
    card: {
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    imageArea: {
        position: "relative",
        background: "#f5f5f5",
        borderRadius: 4,
        aspectRatio: "1 / 1",
        overflow: "hidden",
        marginBottom: 12,
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    manageControls: {
        position: "absolute",
        top: 8,
        right: 8,
        display: "flex",
        gap: 6,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#1a1a1a",
        backdropFilter: "blur(4px)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        transition: "background 0.15s",
        flexShrink: 0,
    },
    iconBtnDanger: {
        color: "#be123c",
    },
    sellerBadge: {
        position: "absolute",
        bottom: 8,
        left: 8,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#111",
        background: "rgba(255,255,255,0.88)",
        borderRadius: 3,
        padding: "3px 7px",
        backdropFilter: "blur(4px)",
    },
    info: {
        display: "flex",
        flexDirection: "column",
        gap: 3,
        marginBottom: 12,
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: 500,
        color: "#111",
        lineHeight: 1.3,
    },
    description: {
        fontSize: 13,
        color: "#757575",
        lineHeight: 1.4,
    },
    price: {
        fontSize: 15,
        fontWeight: 500,
        color: "#111",
        marginTop: 4,
    },
    addBtn: {
        width: "100%",
        padding: "13px 0",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: 30,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "background 0.2s",
        letterSpacing: "0.02em",
    },
    addBtnAdded: {
        background: "#15803d",
    },
};

function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
    );
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