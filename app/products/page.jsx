"use client";

import { useState, useEffect, useCallback } from "react";
import { addToCart, getCart, getProductsBySeller, createProduct, updateProduct, deleteProduct, updateCartItem } from "../../src/api/order";
import { CartDrawer } from "../../src/components/cart/CartDrawer";
import { ProductCard } from "../../src/components/products/ProductCard";
import { ProductFormModal } from "../../src/components/products/ProductFormModal";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { Icon } from "../../src/components/ui/icons";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { extractText } from "../../src/api/ai";
import { getAuth } from "../../src/lib/auth";
import { useTheme } from "../context/ThemeContext";

const parsed = getAuth();
const SELLER_ID = parsed?.user?.seller_id;
const API_KEY = process.env.NEXT_PUBLIC_ORDER_API_KEY;

export default function ProductsPage() {
    const { theme } = useTheme();
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

    const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

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
        } catch {}
    }, []);

    useEffect(() => { fetchProducts(); fetchCart(); }, [fetchProducts, fetchCart]);

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(SELLER_ID, { product_id: productId, quantity: 1 });
            await fetchCart();
            addToast("Added to cart", "success");
        } catch (err) {
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
            const result = await extractText(aiText, SELLER_ID);
            if (result?.product_id?.length) {
                for (const [productId, quantity] of result.product_id) {
                    try { await addToCart(SELLER_ID, { product_id: productId, quantity: parseInt(quantity) || 1 }); }
                    catch {}
                }
                await fetchCart();
            }
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
            {hasAtmosphericBg && <MistBackground />}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes fadeUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                * { box-sizing: border-box; }
                body { margin: 0; background: transparent; font-family: var(--font-sans); }
                button:disabled { opacity: 0.6; cursor: not-allowed !important; }
                input:focus, textarea:focus { outline: none; border-color: var(--border-strong) !important; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            `}</style>

            <div style={{
                minHeight: "100vh",
                background: hasAtmosphericBg ? "transparent" : "var(--page-bg)",
                fontFamily: "var(--font-sans)",
            }}>
                {/* Nav */}
                <nav style={{
                    ...styles.nav,
                    background: "var(--nav-bg)",
                    borderBottom: "1px solid var(--nav-border)",
                }}>
                    <div style={styles.navLeft}>
                        <span style={{ ...styles.logo, color: "var(--text-primary)" }}>Catalogues</span>
                    </div>
                    <div style={styles.navRight}>
                        <div style={{ ...styles.searchWrap, background: "var(--search-bg)" }}>
                            <Icon.SearchIcon />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search catalogues..."
                                style={{ ...styles.searchInput, color: "var(--search-text)", fontFamily: "var(--font-sans)" }}
                            />
                        </div>
                        {/* AI Extract */}
                        <button
                            onClick={() => setShowAiModal(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "7px 16px", borderRadius: 30,
                                border: "1px solid var(--btn-primary-border)",
                                background: "var(--btn-primary-bg)",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                                color: "var(--btn-primary-text)",
                                fontFamily: "var(--font-sans)", flexShrink: 0,
                            }}
                        >
                            ✦ AI Extract
                        </button>
                        {/* Manage */}
                        <button
                            onClick={() => setIsManaging(m => !m)}
                            style={{
                                ...styles.navBtn,
                                background: isManaging ? "var(--btn-primary-bg)" : "var(--btn-ghost-bg)",
                                color: isManaging ? "var(--btn-primary-text)" : "var(--btn-ghost-text)",
                                border: `1px solid ${isManaging ? "var(--btn-primary-border)" : "var(--btn-ghost-border)"}`,
                                fontFamily: "var(--font-sans)",
                            }}
                        >
                            {isManaging ? "Done" : "Manage"}
                        </button>
                        {/* New Catalogue */}
                        <button
                            onClick={() => { setEditProduct(null); setShowForm(true); }}
                            style={{
                                ...styles.addProductBtn,
                                background: "var(--surface)",
                                color: "var(--btn-ghost-text)",
                                border: `1px solid var(--btn-ghost-border)`,
                                fontFamily: "var(--font-sans)",
                            }}
                        >
                            <Icon.PlusIcon /> New Catalogue
                        </button>
                        {/* Cart */}
                        <button
                            onClick={() => setCartOpen(true)}
                            style={{
                                ...styles.cartBtn,
                                background: "var(--surface)",
                                border: `1px solid var(--btn-ghost-border)`,
                                color: "var(--text-primary)",
                            }}
                            aria-label="Open cart"
                        >
                            <Icon.CartIcon />
                            {cartItemCount > 0 && (
                                <span style={{
                                    ...styles.cartBadge,
                                    background: "var(--btn-primary-bg)",
                                    color: "var(--btn-primary-text)",
                                }}>
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </nav>

                {/* Main */}
                <main style={{ ...styles.main, position: "relative", zIndex: 1 }}>
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={{ ...styles.pageTitle, color: "var(--text-primary)" }}>
                                {search ? `Results for "${search}"` : "All Catalogue"}
                            </h1>
                            {!loading && (
                                <p style={{ ...styles.pageSubtitle, color: "var(--text-secondary)" }}>
                                    {filtered.length} {filtered.length === 1 ? "Catalogue" : "Catalogues"}
                                </p>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div style={styles.grid}>
                            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ color: "var(--border-strong)", marginBottom: 4 }}><Icon.EmptyIcon /></div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                                {search ? "No catalogues match your search" : "No catalogues yet"}
                            </div>
                            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                {search ? "Try a different search term" : "Click New Catalogue to add your first one"}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {/* ── CLOUDY / STORMY GLASS GRID WRAPPER ── */}
                            {hasAtmosphericBg && (
                                <div
                                    className="
                                        relative w-full
                                        max-w-400 mx-auto
                                        rounded-3xl p-2
                                        overflow-hidden
                                        backdrop-blur-[20px]
                                        border border-white/30
                                        shadow-[0_16px_70px_rgba(0,0,0,0.12)]
                                        bg-[linear-gradient(to_bottom_right,rgba(250,255,253,0.6),rgba(250,255,253,0.6))]
                                    "
                                >
                                    {/* Top glass highlight */}
                                    <div
                                        className="
                                            pointer-events-none absolute inset-0
                                            rounded-3xl
                                            bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),rgba(255,255,255,0.06))]
                                            opacity-60
                                        "
                                    />

                                    {/* Frost diffusion layer */}
                                    <div
                                        className="
                                            pointer-events-none absolute inset-0
                                            rounded-3xl
                                            bg-white/20 blur-2xl opacity-40
                                        "
                                    />

                                    {/* Content */}
                                    <div
                                        style={styles.grid}
                                        className="
                                            relative z-10
                                            w-full
                                        "
                                    >
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
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

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
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
                }}>
                    <div style={{
                        background: "var(--surface)", borderRadius: 16, padding: 28,
                        width: "100%", maxWidth: 540,
                        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
                        fontFamily: "var(--font-sans)",
                        display: "flex", flexDirection: "column", gap: 16,
                        border: "1px solid var(--border)",
                    }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>✦ AI Order Extract</div>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                                    Paste unstructured order text and AI will fill in the checkout form
                                </div>
                            </div>
                            <button onClick={() => { setShowAiModal(false); setAiText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <textarea
                            value={aiText}
                            onChange={e => setAiText(e.target.value)}
                            placeholder="e.g. Order 50 steel bolts from ABC Supplies. Deliver to 123 Main St Sydney NSW 2000 by June 10 2024. Currency AUD."
                            rows={6}
                            style={{
                                width: "100%", padding: "12px 14px",
                                border: `1px solid var(--border)`, borderRadius: 10,
                                fontSize: 13, color: "var(--text-primary)",
                                background: "var(--surface-raised)",
                                resize: "vertical", fontFamily: "var(--font-sans)",
                                outline: "none", boxSizing: "border-box", lineHeight: 1.6,
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--border-strong)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => { setShowAiModal(false); setAiText(""); }}
                                style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid var(--border)`, background: "var(--surface)", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAiExtract}
                                disabled={aiProcessing || !aiText.trim()}
                                style={{
                                    padding: "9px 24px", borderRadius: 8, border: "none",
                                    background: aiProcessing || !aiText.trim() ? "var(--text-muted)" : "var(--btn-primary-bg)",
                                    color: "var(--btn-primary-text)", fontSize: 13, fontWeight: 700,
                                    cursor: aiProcessing || !aiText.trim() ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                    fontFamily: "var(--font-sans)",
                                }}
                            >
                                {aiProcessing
                                    ? <><svg style={{ animation: "spin 1s linear infinite" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing…</>
                                    : "Extract & Fill"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </>
    );
}

function SkeletonCard() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ aspectRatio: "1 / 1", background: "var(--surface-raised)", backgroundSize: "200% 100%", borderRadius: 4, animation: "shimmer 1.4s infinite" }} />
            <div style={{ height: 16, background: "var(--border)", borderRadius: 4, width: "70%" }} />
            <div style={{ height: 14, background: "var(--surface-raised)", borderRadius: 4, width: "90%" }} />
            <div style={{ height: 16, background: "var(--border)", borderRadius: 4, width: "30%" }} />
            <div style={{ height: 44, background: "var(--surface-raised)", borderRadius: 30, marginTop: 4 }} />
        </div>
    );
}

const styles = {
    nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, backdropFilter: "blur(8px)", gap: 20 },
    navLeft: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
    logo: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" },
    navRight: { display: "flex", alignItems: "center", gap: 10 },
    searchWrap: { display: "flex", alignItems: "center", gap: 8, borderRadius: 30, padding: "0 14px", height: 38 },
    searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, width: 180 },
    navBtn: { padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 },
    addProductBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
    cartBtn: { position: "relative", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
    cartBadge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, fontSize: 10, fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
    main: { maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" },
    pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 },
    pageTitle: { fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
    pageSubtitle: { fontSize: 13, margin: "6px 0 0" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "40px 24px" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 360 },
};