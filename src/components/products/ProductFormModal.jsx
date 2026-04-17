"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SpinnerIcon } from "./ProductCard";
import { getInventoryBySeller } from "../../api/order";

export function ProductFormModal({ sellerId, product, onClose, onSave, onToast }) {
    const isEdit = !!product;

    const [form, setForm] = useState({
        product_name: product?.productName || "",
        product_description: product?.productDescription || "",
        unit_price: product?.unitPrice || "",
    });

    // inventory_items: [{ inventory_id, quantity_required, item_name, quantityAvailable }]
    const [linkedItems, setLinkedItems] = useState(
        product?.inventoryItems?.map(i => ({
            inventory_id: i.inventoryId,
            quantity_required: i.quantityRequired || 1,
            item_name: i.itemName,
            quantityAvailable: i.quantityAvailable,
        })) || []
    );

    const [inventoryList, setInventoryList] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        async function load() {
            setInventoryLoading(true);
            try {
                const data = await getInventoryBySeller(sellerId);
                setInventoryList(data.items || []);
            } catch {
                // silently fail — inventory section just won't show
            } finally {
                setInventoryLoading(false);
            }
        }
        load();
    }, [sellerId]);

    const validate = () => {
        const errs = {};
        if (!form.product_name.trim()) errs.product_name = "Catalogue name is required";
        if (!form.unit_price) {
            errs.unit_price = "Price is required";
        } else if (isNaN(parseFloat(form.unit_price)) || parseFloat(form.unit_price) < 0) {
            errs.unit_price = "Must be a valid non-negative number";
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            await onSave({
                product_name: form.product_name.trim(),
                product_description: form.product_description.trim() || undefined,
                unit_price: parseFloat(form.unit_price),
                inventory_items: linkedItems.length > 0
                    ? linkedItems.map(i => ({
                        inventory_id: i.inventory_id,
                        quantity_required: i.quantity_required,
                    }))
                    : undefined,
            });
            onClose();
        } catch (err) {
            onToast(err?.error || "Save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const set = (key, val) => {
        setForm(f => ({ ...f, [key]: val }));
        setErrors(e => ({ ...e, [key]: undefined }));
    };

    const isLinked = (inventoryId) => linkedItems.some(i => i.inventory_id === inventoryId);

    const toggleItem = (inv) => {
        if (isLinked(inv.inventoryId)) {
            setLinkedItems(prev => prev.filter(i => i.inventory_id !== inv.inventoryId));
        } else {
            setLinkedItems(prev => [...prev, {
                inventory_id: inv.inventoryId,
                quantity_required: 1,
                item_name: inv.itemName,
                quantityAvailable: inv.quantity,
            }]);
        }
    };

    const updateQty = (inventoryId, delta) => {
        setLinkedItems(prev => prev.map(i =>
            i.inventory_id === inventoryId
                ? { ...i, quantity_required: Math.max(1, i.quantity_required + delta) }
                : i
        ));
    };

    return createPortal(
        <>
            <div onClick={onClose} style={styles.backdrop} />
            <div style={styles.modal}>
                <div style={styles.header}>
                    <span style={styles.title}>{isEdit ? "Edit Catalogue" : "New Catalogue"}</span>
                    <button onClick={onClose} style={styles.closeBtn}><CloseIcon /></button>
                </div>

                <div style={styles.body}>
                    {/* Name */}
                    <Field label="Catalogue Name" required error={errors.product_name}>
                        <input
                            value={form.product_name}
                            onChange={e => set("product_name", e.target.value)}
                            placeholder="e.g. Wireless Keyboard"
                            style={{ ...styles.input, ...(errors.product_name ? styles.inputError : {}) }}
                        />
                    </Field>

                    {/* Description */}
                    <Field label="Description">
                        <textarea
                            value={form.product_description}
                            onChange={e => set("product_description", e.target.value)}
                            placeholder="Optional catalogue description"
                            rows={3}
                            style={{ ...styles.input, ...styles.textarea }}
                        />
                    </Field>

                    {/* Price */}
                    <Field label="Unit Price (AUD)" required error={errors.unit_price}>
                        <div style={styles.priceWrap}>
                            <span style={styles.currencySymbol}>$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.unit_price}
                                onChange={e => set("unit_price", e.target.value)}
                                placeholder="0.00"
                                style={{ ...styles.input, ...styles.priceInput }}
                            />
                        </div>
                    </Field>

                    {/* Inventory linker */}
                    <div>
                        <div style={styles.sectionLabel}>Inventory Items</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
                            Click an item to link it. Each unit of this catalogue requires the quantities below.
                        </div>

                        {/* Linked items — shown at top */}
                        {linkedItems.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                                {linkedItems.map(item => (
                                    <div key={item.inventory_id} style={styles.linkedItem}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                                {item.item_name}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                                                {item.quantityAvailable} in stock
                                            </div>
                                        </div>

                                        {/* Qty stepper */}
                                        <div style={styles.stepper}>
                                            <button
                                                onClick={() => updateQty(item.inventory_id, -1)}
                                                style={styles.stepBtn}
                                                disabled={item.quantity_required <= 1}
                                            >−</button>
                                            <span style={styles.stepVal}>{item.quantity_required}</span>
                                            <button
                                                onClick={() => updateQty(item.inventory_id, 1)}
                                                style={styles.stepBtn}
                                            >+</button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => toggleItem({ inventoryId: item.inventory_id })}
                                            style={styles.unlinkBtn}
                                            title="Remove"
                                        >
                                            <XSmallIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Available inventory to pick from */}
                        {inventoryLoading ? (
                            <div style={{ fontSize: 12, color: "#94a3b8", padding: "10px 0" }}>
                                Loading inventory…
                            </div>
                        ) : inventoryList.length === 0 ? (
                            <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                                No inventory items found
                            </div>
                        ) : (
                            <div style={styles.inventoryPickerScroll}>
                                {inventoryList
                                    .filter(inv => !isLinked(inv.inventoryId))
                                    .map(inv => (
                                        <div
                                            key={inv.inventoryId}
                                            onClick={() => toggleItem(inv)}
                                            style={styles.inventoryPickerItem}
                                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                                                    {inv.itemName}
                                                </div>
                                                {inv.itemDescription && (
                                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                                                        {inv.itemDescription}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                <div style={{ fontSize: 11, color: inv.quantity > 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                                                    {inv.quantity} in stock
                                                </div>
                                                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                                    ${parseFloat(inv.purchasePrice || 0).toFixed(2)}
                                                </div>
                                            </div>
                                            <div style={styles.addChip}>+ Add</div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} style={styles.saveBtn}>
                        {saving
                            ? <><SpinnerIcon size={13} color="#fff" /> Saving…</>
                            : isEdit ? "Save Changes" : "Create Catalogue"
                        }
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}

function Field({ label, required, error, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
                fontSize: 12, fontWeight: 600, color: "#111",
                letterSpacing: "0.03em",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}>
                {label}{required && <span style={{ color: "#be123c", marginLeft: 2 }}>*</span>}
            </label>
            {children}
            {error && <span style={{ fontSize: 11, color: "#be123c" }}>{error}</span>}
        </div>
    );
}

const styles = {
    backdrop: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 500, backdropFilter: "blur(2px)",
    },
    modal: {
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(520px, calc(100vw - 32px))",
        maxHeight: "90vh",
        background: "#fff", borderRadius: 12,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        zIndex: 501, display: "flex", flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    header: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", borderBottom: "1px solid #f0f0f0", flexShrink: 0,
    },
    title: { fontSize: 17, fontWeight: 600, color: "#111" },
    closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#757575", padding: 4, display: "flex" },
    body: {
        padding: "24px", display: "flex", flexDirection: "column",
        gap: 18, overflowY: "auto", flex: 1,
    },
    sectionLabel: {
        fontSize: 11, fontWeight: 700, color: "#94a3b8",
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
    },
    input: {
        width: "100%", padding: "11px 14px", fontSize: 14,
        border: "1px solid #e5e5e5", borderRadius: 8, outline: "none",
        color: "#111", background: "#fafafa", boxSizing: "border-box",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: "border-color 0.15s",
    },
    inputError: { borderColor: "#fca5a5", background: "#fff5f5" },
    textarea: { resize: "vertical", minHeight: 80 },
    priceWrap: { position: "relative", display: "flex", alignItems: "center" },
    currencySymbol: { position: "absolute", left: 14, fontSize: 14, color: "#757575", pointerEvents: "none" },
    priceInput: { paddingLeft: 28 },

    // Linked item row
    linkedItem: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 8,
        border: "1px solid #dbeafe", background: "#eff6ff",
    },
    stepper: {
        display: "flex", alignItems: "center",
        border: "1px solid #bfdbfe", borderRadius: 20, overflow: "hidden",
        flexShrink: 0,
    },
    stepBtn: {
        width: 26, height: 26, border: "none", background: "none",
        cursor: "pointer", fontSize: 15, color: "#1d4ed8",
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    stepVal: {
        fontSize: 13, fontWeight: 600, color: "#1d4ed8",
        minWidth: 22, textAlign: "center",
    },
    unlinkBtn: {
        width: 26, height: 26, border: "none", background: "none",
        cursor: "pointer", color: "#94a3b8", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        borderRadius: "50%",
    },

    // Picker list
    inventoryPickerScroll: {
        border: "1px solid #e5e5e5", borderRadius: 8,
        maxHeight: 180, overflowY: "auto",
    },
    inventoryPickerItem: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", cursor: "pointer",
        borderBottom: "1px solid #f5f5f5",
        transition: "background 0.1s", background: "#fff",
    },
    addChip: {
        fontSize: 11, fontWeight: 700, color: "#0ea5e9",
        background: "#e0f2fe", borderRadius: 4, padding: "2px 8px",
        flexShrink: 0,
    },

    footer: {
        display: "flex", gap: 10, padding: "16px 24px",
        borderTop: "1px solid #f0f0f0", justifyContent: "flex-end", flexShrink: 0,
    },
    cancelBtn: {
        padding: "10px 20px", border: "1px solid #e5e5e5", borderRadius: 30,
        background: "#fff", fontSize: 13, fontWeight: 600, color: "#757575",
        cursor: "pointer", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    saveBtn: {
        padding: "10px 24px", border: "none", borderRadius: 30, background: "#111",
        fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
};

function CloseIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function XSmallIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
}