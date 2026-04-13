"use client";

import { useState, useEffect, useCallback } from "react";
import { addToCart, getCart, getProductsBySeller, createProduct, updateProduct, deleteProduct, } from "../../src/api/order";
import { CartDrawer } from "../../src/components/cart/CartDrawer";
import { ProductCard } from "../../src/components/products/ProductCard";
import { ProductFormModal } from "../../src/components/products/ProductFormModal";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";

// ─── Replace with your actual IDs (from localStorage, context, etc.) ───────
const SELLER_ID = process.env.NEXT_PUBLIC_SELLER_ID || "be45f62d-06cf-4f9e-a23e-bc68ba7ab0d1";

export default function ProductsPage() {
    const [products, setProducts]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [cart, setCart]               = useState(null);
    const [cartOpen, setCartOpen]       = useState(false);
    const [showForm, setShowForm]       = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [isManaging, setIsManaging]   = useState(false);
    const [search, setSearch]           = useState("");
    const [cartLoading, setCartLoading] = useState(false);

    const { toasts, addToast } = useToast();

    const fetchProducts = useCallback(async () => {
        try {
            const data = await getProductsBySeller(SELLER_ID);
            setProducts(data.products || []);
        } catch {
            addToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCart = useCallback(async () => {
        try {
            const data = await getCart(SELLER_ID);
            setCart(data);
        } catch {

        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCart();
    }, [fetchProducts, fetchCart]);

    const handleAddToCart = async (productId) => {
        const data = {
            "product_id": productId,
            "quantity": 1
        }

        try {
            await addToCart(SELLER_ID, data);
            await fetchCart();
            addToast("Added to cart", "success");
        } catch (err) {
            console.log(err)
            addToast(err?.error || "Failed to add to cart", "error");
            throw err;
        }
    };

    const handleCreate = async (data) => {
        await createProduct(SELLER_ID, data);
        await fetchProducts();
        addToast("Catalogue created", "success");
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setShowForm(true);
    };

    const handleUpdate = async (data) => {
        await updateProduct(SELLER_ID, editProduct.productId, data);
        await fetchProducts();
        addToast("Catalogue updated", "success");
    };

    const handleDelete = async (productId) => {
        try {
            await deleteProduct(SELLER_ID, productId);
            await fetchProducts();
            addToast("Catalogue deleted", "success");
        } catch (err) {
            addToast(err?.error || "Failed to delete catalogue", "error");
        }
    };

    const cartItemCount = cart?.itemCount || 0;

    const filtered = products.filter(p =>
        !search.trim() ||
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.productDescription?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes fadeUp {
                    from { transform: translateY(8px); opacity: 0; }
                    to   { transform: translateY(0);   opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                * { box-sizing: border-box; }
                body { margin: 0; background: #fff; }
                button:disabled { opacity: 0.6; cursor: not-allowed !important; }
                input:focus, textarea:focus { outline: none; border-color: #111 !important; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 4px; }
            `}</style>

            <div style={styles.page}>
                {/* ── Top nav ── */}
                <nav style={styles.nav}>
                    <div style={styles.navLeft}>
                        <span style={styles.logo}>Catalogues</span>
                    </div>
                    <div style={styles.navRight}>
                        {/* Search */}
                        <div style={styles.searchWrap}>
                            <SearchIcon />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search catalogues..."
                                style={styles.searchInput}
                            />
                        </div>

                        {/* Manage toggle */}
                        <button
                            onClick={() => setIsManaging(m => !m)}
                            style={{
                                ...styles.navBtn,
                                background: isManaging ? "#111" : "transparent",
                                color: isManaging ? "#fff" : "#111",
                                border: isManaging ? "1px solid #111" : "1px solid #e5e5e5",
                            }}
                        >
                            {isManaging ? "Done" : "Manage"}
                        </button>

                        {/* Add product */}
                        <button
                            onClick={() => { setEditProduct(null); setShowForm(true); }}
                            style={styles.addProductBtn}
                        >
                            <PlusIcon /> New Catalogue
                        </button>

                        {/* Cart button */}
                        <button
                            onClick={() => setCartOpen(true)}
                            style={styles.cartBtn}
                            aria-label="Open cart"
                        >
                            <CartIcon />
                            {cartItemCount > 0 && (
                                <span style={styles.cartBadge}>{cartItemCount}</span>
                            )}
                        </button>
                    </div>
                </nav>

                {/* ── Main content ── */}
                <main style={styles.main}>
                    {/* Header row */}
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.pageTitle}>
                                {search ? `Results for "${search}"` : "All Catalogue"}
                            </h1>
                            {!loading && (
                                <p style={styles.pageSubtitle}>
                                    {filtered.length} {filtered.length === 1 ? "Catalogue" : "Catalogues"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Catalogue grid */}
                    {loading ? (
                        <div style={styles.loadingGrid}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <EmptyIcon />
                            </div>
                            <div style={styles.emptyText}>
                                {search ? "No catalogues match your search" : "No catalogues yet"}
                            </div>
                            <div style={styles.emptySub}>
                                {search
                                    ? "Try a different search term"
                                    : "Click New Catalogue to add your first one"
                                }
                            </div>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {filtered.map(product => (
                                <ProductCard
                                    key={product.productId}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isManaging={isManaging}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modals & drawers ── */}
            {showForm && (
                <ProductFormModal
                    sellerId={SELLER_ID}
                    product={editProduct}
                    onClose={() => { setShowForm(false); setEditProduct(null); }}
                    onSave={editProduct ? handleUpdate : handleCreate}
                    onToast={addToast}
                />
            )}

            {cartOpen && (
                <CartDrawer
                    cart={cart}
                    onClose={() => setCartOpen(false)}
                    onToast={addToast}
                    onRefresh={fetchCart}
                    sellerId={SELLER_ID}
                />
            )}

            <ToastContainer toasts={toasts} />
        </>
    );
}

/* ── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div style={skeletonStyles.card}>
            <div style={skeletonStyles.image} />
            <div style={skeletonStyles.line1} />
            <div style={skeletonStyles.line2} />
            <div style={skeletonStyles.line3} />
            <div style={skeletonStyles.btn} />
        </div>
    );
}

/* ── Styles ────────────────────────────────────────────────── */
const styles = {
    page: {
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    nav: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: 60,
        background: "rgba(255,255,255,0.96)",
        borderBottom: "1px solid #f0f0f0",
        backdropFilter: "blur(8px)",
        gap: 20,
    },
    navLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
    },
    logo: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111",
        letterSpacing: "-0.02em",
    },
    navRight: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    searchWrap: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#f5f5f5",
        borderRadius: 30,
        padding: "0 14px",
        height: 38,
        color: "#999",
    },
    searchInput: {
        border: "none",
        background: "transparent",
        outline: "none",
        fontSize: 13,
        color: "#111",
        width: 180,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    navBtn: {
        padding: "7px 16px",
        borderRadius: 30,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        flexShrink: 0,
    },
    addProductBtn: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        borderRadius: 30,
        border: "1px solid #e5e5e5",
        background: "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        color: "#111",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        flexShrink: 0,
    },
    cartBtn: {
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid #e5e5e5",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#111",
        flexShrink: 0,
    },
    cartBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        background: "#111",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    main: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "40px 40px 80px",
    },
    pageHeader: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 32,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 700,
        color: "#111",
        margin: 0,
        letterSpacing: "-0.02em",
    },
    pageSubtitle: {
        fontSize: 13,
        color: "#757575",
        margin: "6px 0 0",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "40px 24px",
    },
    loadingGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "40px 24px",
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: 360,
    },
    emptyIcon: {
        color: "#ddd",
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 600,
        color: "#111",
    },
    emptySub: {
        fontSize: 14,
        color: "#757575",
    },
};

const skeletonStyles = {
    card: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    image: {
        aspectRatio: "1 / 1",
        background: "linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%)",
        backgroundSize: "200% 100%",
        borderRadius: 4,
        animation: "shimmer 1.4s infinite",
    },
    line1: {
        height: 16,
        background: "#f0f0f0",
        borderRadius: 4,
        width: "70%",
    },
    line2: {
        height: 14,
        background: "#f5f5f5",
        borderRadius: 4,
        width: "90%",
    },
    line3: {
        height: 16,
        background: "#f0f0f0",
        borderRadius: 4,
        width: "30%",
    },
    btn: {
        height: 44,
        background: "#f5f5f5",
        borderRadius: 30,
        marginTop: 4,
    },
};

/* ── Icons ─────────────────────────────────────────────────── */
function SearchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );
}

function CartIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    );
}

function EmptyIcon() {
    return (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
        </svg>
    );
}