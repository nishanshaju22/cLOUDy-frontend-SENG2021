"use client";

import { useState, useEffect, useCallback } from "react";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../../src/api/order";
import { InventoryFormModal } from "../../src/components/inventory/InventoryFormModal";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { getAuth } from "../../src/lib/auth";

const parsed = getAuth()
const SELLER_ID = parsed?.user?.seller_id;

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isManaging, setIsManaging] = useState(false);
    const [search, setSearch] = useState("");
    const { toasts, addToast } = useToast();

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
        await createInventoryItem(SELLER_ID, data);
        await fetchInventory();
        addToast("Inventory item created", "success");
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setShowForm(true);
    };

    const handleUpdate = async (data) => {
        await updateInventoryItem(SELLER_ID, editItem.inventoryId, data);
        await fetchInventory();
        addToast("Inventory item updated", "success");
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

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                * { box-sizing: border-box; }
                body { margin: 0; background: #fff; }
                button:disabled { opacity: 0.6; cursor: not-allowed !important; }
                input:focus, textarea:focus { outline: none; border-color: #111 !important; }
            `}</style>

            <div style={styles.page}>
                <nav style={styles.nav}>
                    <div style={styles.navLeft}>
                        <span style={styles.logo}>Inventory</span>
                    </div>
                    <div style={styles.navRight}>
                        <div style={styles.searchWrap}>
                            <SearchIcon />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search inventory..."
                                style={styles.searchInput}
                            />
                        </div>
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
                        <button
                            onClick={() => { setEditItem(null); setShowForm(true); }}
                            style={styles.addBtn}
                        >
                            <PlusIcon /> New Inventory Item
                        </button>
                    </div>
                </nav>

                <main style={styles.main}>
                    <div style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.pageTitle}>
                                {search ? `Results for "${search}"` : "All Inventory"}
                            </h1>
                            {!loading && (
                                <p style={styles.pageSubtitle}>
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
                            <div style={styles.emptyIcon}><EmptyIcon /></div>
                            <div style={styles.emptyText}>
                                {search ? "No items match your search" : "No inventory yet"}
                            </div>
                            <div style={styles.emptySub}>
                                {search ? "Try a different search term" : "Click New Inventory Item to get started"}
                            </div>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {filtered.map(item => (
                                <InventoryCard
                                    key={item.inventoryId}
                                    item={item}
                                    isManaging={isManaging}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {showForm && (
                <InventoryFormModal
                    item={editItem}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                    onSave={editItem ? handleUpdate : handleCreate}
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
        try {
            await onDelete(item.inventoryId, item.itemName);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div style={cardStyles.card}>
            <div style={cardStyles.imageArea}>
                <div style={cardStyles.imagePlaceholder}>
                    <BoxIcon />
                </div>
                {isManaging && (
                    <div style={cardStyles.manageControls}>
                        <button onClick={() => onEdit(item)} style={cardStyles.iconBtn} title="Edit">
                            <EditIcon />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ ...cardStyles.iconBtn, color: "#be123c" }}
                            title="Delete"
                        >
                            {deleting
                                ? <svg style={{ animation: "spin 0.7s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                                : <TrashIcon />
                            }
                        </button>
                    </div>
                )}
                <div style={cardStyles.quantityBadge}>
                    Qty: {item.quantity}
                </div>
            </div>

            <div style={cardStyles.info}>
                <div style={cardStyles.name}>{item.itemName}</div>
                {item.itemDescription && (
                    <div style={cardStyles.description}>{item.itemDescription}</div>
                )}
                <div style={cardStyles.price}>
                    ${parseFloat(item.purchasePrice).toFixed(2)}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ aspectRatio: "1/1", background: "linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)", backgroundSize: "200% 100%", borderRadius: 4, animation: "shimmer 1.4s infinite" }} />
            <div style={{ height: 16, background: "#f0f0f0", borderRadius: 4, width: "70%" }} />
            <div style={{ height: 14, background: "#f5f5f5", borderRadius: 4, width: "90%" }} />
            <div style={{ height: 16, background: "#f0f0f0", borderRadius: 4, width: "30%" }} />
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "rgba(255,255,255,0.96)", borderBottom: "1px solid #f0f0f0", backdropFilter: "blur(8px)", gap: 20 },
    navLeft: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
    logo: { fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" },
    navRight: { display: "flex", alignItems: "center", gap: 10 },
    searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", borderRadius: 30, padding: "0 14px", height: 38, color: "#999" },
    searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111", width: 180, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    navBtn: { padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", flexShrink: 0 },
    addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 30, border: "1px solid #e5e5e5", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#111", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", flexShrink: 0 },
    main: { maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" },
    pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 },
    pageTitle: { fontSize: 28, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.02em" },
    pageSubtitle: { fontSize: 13, color: "#757575", margin: "6px 0 0" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "40px 24px" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 360 },
    emptyIcon: { color: "#ddd", marginBottom: 4 },
    emptyText: { fontSize: 18, fontWeight: 600, color: "#111" },
    emptySub: { fontSize: 14, color: "#757575" },
};

const cardStyles = {
    card: { display: "flex", flexDirection: "column", cursor: "default", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    imageArea: { position: "relative", background: "#f5f5f5", borderRadius: 4, aspectRatio: "1 / 1", overflow: "hidden", marginBottom: 12 },
    imagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
    manageControls: { position: "absolute", top: 8, right: 8, display: "flex", gap: 6 },
    iconBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#1a1a1a", backdropFilter: "blur(4px)", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" },
    quantityBadge: { position: "absolute", bottom: 8, left: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#111", background: "rgba(255,255,255,0.88)", borderRadius: 3, padding: "3px 7px", backdropFilter: "blur(4px)" },
    info: { display: "flex", flexDirection: "column", gap: 3, flex: 1 },
    name: { fontSize: 15, fontWeight: 500, color: "#111", lineHeight: 1.3 },
    description: { fontSize: 13, color: "#757575", lineHeight: 1.4 },
    price: { fontSize: 15, fontWeight: 500, color: "#111", marginTop: 4 },
};

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function PlusIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function EmptyIcon() { return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
function BoxIcon() { return <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1" style={{ opacity: 0.5 }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function EditIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }