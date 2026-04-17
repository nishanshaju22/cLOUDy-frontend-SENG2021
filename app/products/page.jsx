"use client";

import { useState, useEffect, useCallback } from "react";
import { addToCart, getCart, getProductsBySeller, createProduct, updateProduct, deleteProduct, updateCartItem, } from "../../src/api/order";
import { CartDrawer } from "../../src/components/cart/CartDrawer";
import { ProductCard } from "../../src/components/products/ProductCard";
import { ProductFormModal } from "../../src/components/products/ProductFormModal";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { Icon } from "../../src/components/ui/icons";
import { extractText } from "../../src/api/ai";

// ─── Replace with actual IDs (from localStorage, context, etc.) ───────
const SELLER_ID = process.env.NEXT_PUBLIC_SELLER_ID || "be45f62d-06cf-4f9e-a23e-bc68ba7ab0d1";
const API_KEY = process.env.NEXT_PUBLIC_ORDER_API_KEY

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [isManaging, setIsManaging] = useState(false);
    const [search, setSearch] = useState("");
    const [cartLoading, setCartLoading] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiText, setAiText] = useState("");
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiPrefill, setAiPrefill] = useState(null);

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

    const handleUpdateQty = async (productId, quantity) => {
        try {
            await updateCartItem(SELLER_ID, productId, { quantity });
            await fetchCart();
        } catch (err) {
            addToast("Failed to update quantity", "error");
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

    const handleAiExtract = async () => {
    if (!aiText.trim()) return;
    setAiProcessing(true);
    try {
        const result = await extractText(aiText, SELLER_ID, API_KEY);

        // Add products to cart
        if (result?.product_id?.length) {
            for (const [productId, quantity] of result.product_id) {
                try {
                    await addToCart(SELLER_ID, { product_id: productId, quantity: parseInt(quantity) || 1 });
                } catch { /* skip products that fail */ }
            }
            await fetchCart();
        }

        // Store prefill data and open cart
        setAiPrefill(result);
        setShowAiModal(false);
        setAiText("");
        setCartOpen(true);
        addToast("Fields extracted and cart updated!", "success");
    } catch (err) {
        addToast(err?.error || "Extraction failed", "error");
    } finally {
        setAiProcessing(false);
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
                            <Icon.SearchIcon />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search catalogues..."
                                style={styles.searchInput}
                            />
                        </div>

                        {/* AI Extract button — add this right before the "New Catalogue" button */}
                        <button
                            onClick={() => setShowAiModal(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "7px 16px", borderRadius: 30,
                                border: "1px solid #e5e5e5", background: "#0f172a",
                                fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff",
                                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                                flexShrink: 0,
                            }}
                        >
                            ✦ AI Extract
                        </button>

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
                            <Icon.PlusIcon /> New Catalogue
                        </button>

                        {/* Cart button */}
                        <button
                            onClick={() => setCartOpen(true)}
                            style={styles.cartBtn}
                            aria-label="Open cart"
                        >
                            <Icon.CartIcon />
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
                                <Icon.EmptyIcon />
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
                                    cart={cart}
                                    onUpdateQty={handleUpdateQty}
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
                    onClose={() => { setCartOpen(false); setAiPrefill(null); }}
                    onToast={addToast}
                    onRefresh={fetchCart}
                    sellerId={SELLER_ID}
                    prefill={aiPrefill}
                />
            )}

            {/* AI Extract Modal */}
            {showAiModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 500,
                    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 24,
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: 28,
                        width: "100%", maxWidth: 540,
                        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        display: "flex", flexDirection: "column", gap: 16,
                    }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>✦ AI Order Extract</div>
                                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                                    Paste unstructured order text and AI will fill in the checkout form
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowAiModal(false); setAiText(""); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <textarea
                            value={aiText}
                            onChange={e => setAiText(e.target.value)}
                            placeholder={"e.g. Order 50 steel bolts from ABC Supplies. Deliver to 123 Main St Sydney NSW 2000 by June 10 2024. Currency AUD."}
                            rows={6}
                            style={{
                                width: "100%", padding: "12px 14px",
                                border: "1px solid #e2e8f0", borderRadius: 10,
                                fontSize: 13, color: "#0f172a", resize: "vertical",
                                fontFamily: "inherit", outline: "none",
                                boxSizing: "border-box", lineHeight: 1.6,
                            }}
                            onFocus={e => e.target.style.borderColor = "#94a3b8"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => { setShowAiModal(false); setAiText(""); }}
                                style={{
                                    padding: "9px 20px", borderRadius: 8,
                                    border: "1px solid #e2e8f0", background: "#fff",
                                    fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAiExtract}
                                disabled={aiProcessing || !aiText.trim()}
                                style={{
                                    padding: "9px 24px", borderRadius: 8, border: "none",
                                    background: aiProcessing || !aiText.trim() ? "#94a3b8" : "#0f172a",
                                    color: "#fff", fontSize: 13, fontWeight: 700,
                                    cursor: aiProcessing || !aiText.trim() ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}
                            >
                                {aiProcessing ? (
                                    <><svg style={{ animation: "spin 1s linear infinite" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing…</>
                                ) : "Extract & Fill"}
                            </button>
                        </div>
                    </div>
                </div>
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