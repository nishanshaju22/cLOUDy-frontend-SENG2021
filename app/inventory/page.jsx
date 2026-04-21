"use client";

import { useState, useEffect, useCallback } from "react";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../../src/api/order";
import { InventoryFormModal } from "../../src/components/inventory/InventoryFormModal";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { getAuth } from "../../src/lib/auth";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../../src/components/ui/Sidebar";
import { RippleButton } from "@/src/components/ui/RippleButton";

const parsed = getAuth();
const SELLER_ID = parsed?.user?.seller_id;

export default function InventoryPage() {
    const { theme } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isManaging, setIsManaging] = useState(false);
    const [search, setSearch] = useState("");
    const { toasts, addToast } = useToast();

    const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

    const fetchInventory = useCallback(async () => {
        try {
            const data = await getInventory(SELLER_ID);
            setItems(data.items || []);
        } catch {
            addToast("Failed to load inventory", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    const handleCreate = async (data) => {
        const res = await createInventoryItem(SELLER_ID, data);
        addToast("Inventory item created", "success");
        return res;
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setShowForm(true);
    };

    const handleUpdate = async (data) => {
        const res = await updateInventoryItem(SELLER_ID, editItem.inventoryId, data);
        addToast("Inventory item updated", "success");
        return res;
    };

    const handleSaveDone = async () => {
        await fetchInventory();
    };

    const handleDelete = async (inventoryId, itemName) => {
        if (!confirm(`Delete "${itemName}"?`)) return;
        try {
            await deleteInventoryItem(SELLER_ID, inventoryId);
            await fetchInventory();
            addToast("Inventory item deleted", "success");
        } catch (err) {
            addToast(err?.error || "Failed to delete item", "error");
        }
    };

    const filtered = items.filter(i =>
        !search.trim() ||
        i.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        i.itemDescription?.toLowerCase().includes(search.toLowerCase())
    );

    const cardGrid = (
        <div style={styles.grid}>
            {filtered.map(item => (
                <div
                    key={item.inventoryId}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = hasAtmosphericBg
                            ? "0 14px 40px rgba(0,0,0,0.12)"
                            : "0 10px 20px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0px)";
                        e.currentTarget.style.boxShadow = hasAtmosphericBg
                            ? "0 8px 30px rgba(0,0,0,0.08)"
                            : "none";
                    }}
                    style={{
                        padding: 10,
                        borderRadius: 20,
                        backdropFilter: hasAtmosphericBg ? "blur(20px)" : "none",
                        WebkitBackdropFilter: hasAtmosphericBg ? "blur(20px)" : "none",
                        border: hasAtmosphericBg
                            ? "1px solid rgba(255,255,255,0.3)"
                            : "1px solid var(--border)",
                        background: hasAtmosphericBg
                            ? "linear-gradient(to bottom right, rgba(250,255,253,0.6), rgba(250,255,253,0.6))"
                            : "var(--surface)",
                        boxShadow: hasAtmosphericBg
                            ? "0 8px 30px rgba(0,0,0,0.08)"
                            : "none",
                        transition: "all 0.2s ease",
                    }}
                >
                    <InventoryCard
                        item={item}
                        isManaging={isManaging}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <>
            {hasAtmosphericBg && <MistBackground />}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                * { box-sizing: border-box; }
                body { margin: 0; background: transparent; font-family: var(--font-sans); }
                button:disabled { opacity: 0.6; cursor: not-allowed !important; }
                input:focus, textarea:focus { outline: none; border-color: var(--border-strong) !important; }
            `}</style>

            <Sidebar />

            <div style={{
                minHeight: "100vh",
                background: hasAtmosphericBg ? "transparent" : "var(--page-bg)",
                fontFamily: "var(--font-sans)",
            }}>
                <nav style={{ ...styles.nav, background: "var(--nav-bg)", borderBottom: `1px solid var(--nav-border)` }}>
                    <div style={styles.navLeft}>
                        <span style={{ ...styles.logo, color: "var(--text-primary)" }}>Inventory</span>
                    </div>
                    <div style={styles.navRight}>
                        <div style={{ ...styles.searchWrap, background: "var(--search-bg)" }}>
                            <SearchIcon />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search inventory..."
                                style={{ ...styles.searchInput, color: "var(--search-text)", fontFamily: "var(--font-sans)" }}
                            />
                        </div>
                        <RippleButton
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
                        </RippleButton>
                        <RippleButton
                            onClick={() => { setEditItem(null); setShowForm(true); }}
                            style={{ ...styles.addBtn, background: "var(--surface)", color: "var(--btn-ghost-text)", border: `1px solid var(--btn-ghost-border)`, fontFamily: "var(--font-sans)" }}
                        >
                            <PlusIcon /> New Inventory Item
                        </RippleButton>
                    </div>
                </nav>

                <main style={styles.main}>
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={{ ...styles.pageTitle, color: "var(--text-primary)" }}>
                                {search ? `Results for "${search}"` : "All Inventory"}
                            </h1>
                            {!loading && (
                                <p style={{ ...styles.pageSubtitle, color: "var(--text-secondary)" }}>
                                    {filtered.length} {filtered.length === 1 ? "item" : "items"}
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
                            <div style={{ color: "var(--border-strong)", marginBottom: 4 }}><EmptyIcon /></div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
                                {search ? "No items match your search" : "No inventory yet"}
                            </div>
                            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                {search ? "Try a different search term" : "Click New Inventory Item to get started"}
                            </div>
                        </div>
                    ) : cardGrid}
                </main>
            </div>

            {showForm && (
                <InventoryFormModal
                    item={editItem}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSave={editItem ? handleUpdate : handleCreate}
                    onSaveDone={handleSaveDone}
                    onToast={addToast}
                />
            )}

            <ToastContainer toasts={toasts} />
        </>
    );
}

function InventoryCard({ item, isManaging, onEdit, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try { await onDelete(item.inventoryId, item.itemName); }
        finally { setDeleting(false); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", cursor: "default", fontFamily: "var(--font-sans)" }}>
            <div style={{
                position: "relative", background: "var(--surface-raised)",
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
                aspectRatio: "1 / 1", overflow: "hidden", marginBottom: 12,
                border: "1px solid var(--border)",
            }}>
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BoxIcon />
                    </div>
                )}

                {isManaging && (
                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                        <RippleButton
                            onClick={() => onEdit(item)}
                            style={cardStyles.iconBtn}
                        >
                            <EditIcon />
                        </RippleButton>
                        <RippleButton
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{ ...cardStyles.iconBtn, color: "var(--error)" }} title="Delete">
                            {deleting
                                ? <svg style={{ animation: "spin 0.7s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                                : <TrashIcon />
                            }
                        </RippleButton>
                    </div>
                )}

                <div style={{
                    position: "absolute", bottom: 8, left: 8,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    color: "var(--text-primary)", background: "var(--surface-overlay)",
                    borderRadius: 3, padding: "3px 7px", backdropFilter: "blur(4px)",
                }}>
                    Qty: {item.quantity}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{item.itemName}</div>
                {item.itemDescription && (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{item.itemDescription}</div>
                )}
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", marginTop: 4 }}>
                    ${parseFloat(item.purchasePrice).toFixed(2)}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ aspectRatio: "1/1", background: "linear-gradient(90deg, var(--surface-raised) 25%, var(--border) 50%, var(--surface-raised) 75%)", backgroundSize: "200% 100%", borderRadius: 4, animation: "shimmer 1.4s infinite" }} />
            <div style={{ height: 16, background: "var(--surface-raised)", borderRadius: 4, width: "70%" }} />
            <div style={{ height: 14, background: "var(--border)", borderRadius: 4, width: "90%" }} />
            <div style={{ height: 16, background: "var(--surface-raised)", borderRadius: 4, width: "30%" }} />
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
    addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
    main: { maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 1 },
    pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 },
    pageTitle: { fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
    pageSubtitle: { fontSize: 13, margin: "6px 0 0" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 360 },
};

const cardStyles = {
    iconBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1a1a1a", backdropFilter: "blur(4px)", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" },
};

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function EmptyIcon() { return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
function BoxIcon() { return <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.4 }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }