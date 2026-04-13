"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SpinnerIcon } from "./ProductCard";

export function ProductFormModal({ sellerId, product, onClose, onSave, onToast }) {
    const isEdit = !!product;

    const [form, setForm] = useState({
        product_name: product?.productName || "",
        product_description: product?.productDescription || "",
        unit_price: product?.unitPrice || "",
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Close on escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const validate = () => {
        const errs = {};
        if (!form.product_name.trim()) errs.product_name = "Product name is required";
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

    return createPortal(
        <>
            <div onClick={onClose} style={styles.backdrop} />
            <div style={styles.modal}>
                <div style={styles.header}>
                    <span style={styles.title}>{isEdit ? "Edit Product" : "New Product"}</span>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <CloseIcon />
                    </button>
                </div>

                <div style={styles.body}>
                    <Field
                        label="Product Name"
                        required
                        error={errors.product_name}
                    >
                        <input
                            value={form.product_name}
                            onChange={e => set("product_name", e.target.value)}
                            placeholder="e.g. Wireless Keyboard"
                            style={{ ...styles.input, ...(errors.product_name ? styles.inputError : {}) }}
                        />
                    </Field>

                    <Field label="Description" error={errors.product_description}>
                        <textarea
                            value={form.product_description}
                            onChange={e => set("product_description", e.target.value)}
                            placeholder="Optional product description"
                            rows={3}
                            style={{ ...styles.input, ...styles.textarea }}
                        />
                    </Field>

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
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        style={styles.saveBtn}
                    >
                        {saving
                            ? <><SpinnerIcon size={13} color="#fff" /> Saving…</>
                            : isEdit ? "Save Changes" : "Create Product"
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
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
            }}>
                {label}{required && <span style={{ color: "#be123c", marginLeft: 2 }}>*</span>}
            </label>
            {children}
            {error && (
                <span style={{ fontSize: 11, color: "#be123c" }}>{error}</span>
            )}
        </div>
    );
}

const styles = {
    backdrop: {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 500,
        backdropFilter: "blur(2px)",
    },
    modal: {
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, calc(100vw - 32px))",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        zIndex: 501,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
        borderBottom: "1px solid #f0f0f0",
    },
    title: {
        fontSize: 17,
        fontWeight: 600,
        color: "#111",
    },
    closeBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#757575",
        padding: 4,
        display: "flex",
    },
    body: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
    },
    input: {
        width: "100%",
        padding: "11px 14px",
        fontSize: 14,
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        outline: "none",
        color: "#111",
        background: "#fafafa",
        boxSizing: "border-box",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: "border-color 0.15s",
    },
    inputError: {
        borderColor: "#fca5a5",
        background: "#fff5f5",
    },
    textarea: {
        resize: "vertical",
        minHeight: 80,
    },
    priceWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    currencySymbol: {
        position: "absolute",
        left: 14,
        fontSize: 14,
        color: "#757575",
        pointerEvents: "none",
    },
    priceInput: {
        paddingLeft: 28,
    },
    footer: {
        display: "flex",
        gap: 10,
        padding: "16px 24px",
        borderTop: "1px solid #f0f0f0",
        justifyContent: "flex-end",
    },
    cancelBtn: {
        padding: "10px 20px",
        border: "1px solid #e5e5e5",
        borderRadius: 30,
        background: "#fff",
        fontSize: 13,
        fontWeight: 600,
        color: "#757575",
        cursor: "pointer",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    saveBtn: {
        padding: "10px 24px",
        border: "none",
        borderRadius: 30,
        background: "#111",
        fontSize: 13,
        fontWeight: 600,
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
};

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );
}