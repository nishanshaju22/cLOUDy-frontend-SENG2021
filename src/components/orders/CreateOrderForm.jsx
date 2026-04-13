"use client";

import { useState, useEffect, useRef } from "react";
import { createOrder, getSellers, createSeller } from "../../api/order";
import { extractText } from "../../api/ai";
import { Icon } from "../ui/icons";
import { Field, Input, SectionLabel } from "../ui/ui";

const emptyItem = () => ({
    item_name: "",
    item_description: "",
    quantity: "",
    unit_price: ""
});

const emptySellerForm = () => ({
    party_name: "",
    customer_assigned_account_id: "",
    supplier_assigned_account_id: "",
    address: {
        street: "", city: "", state: "", postal_code: "", country_code: "AU"
    },
    contact: {
        name: "", telephone: "", telefax: "", email: ""
    },
    tax_scheme: {
        registration_name: "", company_id: "",
        exemption_reason: "", scheme_id: "", tax_type_code: ""
    }
});

// ─── Seller Creation Sub-form ─────────────────────────────────────────────────
function SellerForm({ onCreated, onCancel, onToast }) {
    const [form,    setForm]    = useState(emptySellerForm());
    const [loading, setLoading] = useState(false);

    const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setAddr = (k, v) => setForm(f => ({ ...f, address:    { ...f.address,    [k]: v } }));
    const setCont = (k, v) => setForm(f => ({ ...f, contact:    { ...f.contact,    [k]: v } }));
    const setTax  = (k, v) => setForm(f => ({ ...f, tax_scheme: { ...f.tax_scheme, [k]: v } }));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await createSeller(form);
            onToast("Seller created!", "success");
            onCreated(result);
        } catch (err) {
            onToast(err?.error || "Failed to create seller", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Header with back button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>New Seller</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        Fill in seller details — the ID will auto-fill into the order form
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 8,
                        border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#0f172a";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                >
                    <Icon.ChevronLeft /> Back to Order
                </button>
            </div>

            {/* Account */}
            <div>
                <SectionLabel>Account</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Party / Company Name" required>
                        <Input value={form.party_name} placeholder="Consortial Supplies"
                            onChange={e => set("party_name", e.target.value)} />
                    </Field>
                    <Field label="Customer Account ID">
                        <Input value={form.customer_assigned_account_id} placeholder="CO001"
                            onChange={e => set("customer_assigned_account_id", e.target.value)} />
                    </Field>
                    <Field label="Supplier Account ID">
                        <Input value={form.supplier_assigned_account_id} placeholder="SUP-98765"
                            onChange={e => set("supplier_assigned_account_id", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Address */}
            <div>
                <SectionLabel>Address</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Field label="Street" required>
                        <Input value={form.address.street} placeholder="56 Busy Street"
                            onChange={e => setAddr("street", e.target.value)} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                        {[
                            ["city",         "City",         "Farthing"],
                            ["state",        "State",        "Heremouthshire"],
                            ["postal_code",  "Postal Code",  "AA99 1BB"],
                            ["country_code", "Country Code", "AU"],
                        ].map(([k, label, ph]) => (
                            <Field key={k} label={label}>
                                <Input value={form.address[k]} placeholder={ph}
                                    maxLength={k === "country_code" ? 2 : undefined}
                                    style={k === "country_code" ? { textTransform: "uppercase" } : {}}
                                    onChange={e => setAddr(k, e.target.value)} />
                            </Field>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div>
                <SectionLabel>Contact</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Name">
                        <Input value={form.contact.name} placeholder="Mrs Bouquet"
                            onChange={e => setCont("name", e.target.value)} />
                    </Field>
                    <Field label="Email">
                        <Input type="email" value={form.contact.email} placeholder="bouquet@consortial.com"
                            onChange={e => setCont("email", e.target.value)} />
                    </Field>
                    <Field label="Telephone">
                        <Input value={form.contact.telephone} placeholder="0158 1233714"
                            onChange={e => setCont("telephone", e.target.value)} />
                    </Field>
                    <Field label="Telefax">
                        <Input value={form.contact.telefax} placeholder="0158 1233856"
                            onChange={e => setCont("telefax", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Tax Scheme */}
            <div>
                <SectionLabel>Tax Scheme</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <Field label="Registration Name">
                            <Input value={form.tax_scheme.registration_name}
                                placeholder="Farthing Purchasing Consortium"
                                onChange={e => setTax("registration_name", e.target.value)} />
                        </Field>
                        <Field label="Company ID">
                            <Input value={form.tax_scheme.company_id} placeholder="175 269 2355"
                                onChange={e => setTax("company_id", e.target.value)} />
                        </Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        <Field label="Exemption Reason">
                            <Input value={form.tax_scheme.exemption_reason} placeholder="N/A"
                                onChange={e => setTax("exemption_reason", e.target.value)} />
                        </Field>
                        <Field label="Scheme ID">
                            <Input value={form.tax_scheme.scheme_id} placeholder="VAT"
                                onChange={e => setTax("scheme_id", e.target.value)} />
                        </Field>
                        <Field label="Tax Type Code">
                            <Input value={form.tax_scheme.tax_type_code} placeholder="VAT"
                                onChange={e => setTax("tax_type_code", e.target.value)} />
                        </Field>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "9px 20px", borderRadius: 8,
                        border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "red";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        padding: "9px 24px", borderRadius: 8, border: "none",
                        background: loading ? "#94a3b8" : "#0f172a",
                        border: "1px solid #e2e8f0",
                        color: "#fff", fontSize: 13, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#51B628";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#0f172a";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                >
                    {loading ? "Creating…" : "Create Seller"}
                </button>
            </div>
        </div>
    );
}

// ─── Seller Dropdown ──────────────────────────────────────────────────────────
function SellerAvatar({ name, size = 28, selected }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: selected
                ? "linear-gradient(135deg, #6366f1, #818cf8)"
                : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.36, fontWeight: 700,
            color: selected ? "#fff" : "#64748b",
            letterSpacing: "0.02em",
        }}>
            {initials}
        </div>
    );
}

function SellerRow({ seller, selected, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", cursor: "pointer",
                background: selected ? "#eef2ff" : hovered ? "#f8fafc" : "transparent",
                borderLeft: `3px solid ${selected ? "#6366f1" : "transparent"}`,
                transition: "background 0.1s",
            }}
        >
            <SellerAvatar name={seller.party_name} size={34} selected={selected} />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: selected ? "#4338ca" : "#1e293b",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                        {seller.party_name || "Unnamed Seller"}
                    </span>
                    {seller.customer_assigned_account_id && (
                        <span style={{
                            fontSize: 11,
                            color: selected ? "#6366f1" : "#64748b",
                            background: selected ? "#e0e7ff" : "#f1f5f9",
                            borderRadius: 4, padding: "1px 6px",
                            whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                            {seller.customer_assigned_account_id}
                        </span>
                    )}
                </div>

                {(seller.contact_name || seller.contact_email) && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                        {seller.contact_name && (
                            <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>
                                {seller.contact_name}
                            </span>
                        )}
                        {seller.contact_name && seller.contact_email && (
                            <span style={{ fontSize: 11, color: "#cbd5e1" }}>·</span>
                        )}
                        {seller.contact_email && (
                            <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {seller.contact_email}
                            </span>
                        )}
                    </div>
                )}

                {seller.sellerId && (
                    <span style={{ fontSize: 10, color: "#cbd5e1", fontFamily: "monospace", letterSpacing: "0.02em" }}>
                        {seller.sellerId}
                    </span>
                )}
            </div>

            {selected && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            )}
        </div>
    );
}

function SellerDropdown({ sellerId, onChange, sellers, loading, onAddClick }) {
    const [open,   setOpen]   = useState(false);
    const [search, setSearch] = useState("");
    const containerRef        = useRef(null);

    const selectedSeller = sellers.find(s => s.sellerId === sellerId || s.customer_assigned_account_id === sellerId);

    useEffect(() => {
        function handleOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const filtered = sellers.filter(s => {
        const q = search.toLowerCase();
        return (
            s.party_name?.toLowerCase().includes(q) ||
            s.customer_assigned_account_id?.toLowerCase().includes(q) ||
            s.contact_name?.toLowerCase().includes(q) ||
            s.contact_email?.toLowerCase().includes(q) ||
            s.sellerId?.toLowerCase().includes(q)
        );
    });

    function handleSelect(seller) {
        onChange(seller.seller_id ?? seller.customer_assigned_account_id);
        setOpen(false);
        setSearch("");
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{
                fontSize: 12, fontWeight: 600, color: "#64748b",
                letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
                Seller <span style={{ color: "#e11d48", marginLeft: 3 }}>*</span>
            </label>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>

                {/* Dropdown trigger + list */}
                <div style={{ flex: 1, position: "relative" }} ref={containerRef}>

                    {/* Trigger bar — matches BuyerIdBar exactly */}
                    <div
                        onClick={() => {
                            setOpen(o => !o);
                            setSearch("");
                        }}
                        style={{
                            display: "flex", alignItems: "center", gap: 12,
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: open ? "8px 8px 0 0" : 8,
                            padding: "9px 12px",
                            cursor: "pointer",
                            transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = "#94a3b8"; }}
                        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {selectedSeller ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <SellerAvatar name={selectedSeller.party_name} selected />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                                        {selectedSeller.party_name}
                                    </span>
                                    {selectedSeller.customer_assigned_account_id && (
                                        <span style={{
                                            fontSize: 11, color: "#6366f1",
                                            background: "#e0e7ff",
                                            borderRadius: 4, padding: "1px 6px",
                                        }}>
                                            {selectedSeller.customer_assigned_account_id}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                                    {loading ? "Loading sellers…" : "Select a seller…"}
                                </span>
                            )}
                        </div>

                        {sellerId && (
                            <button
                                onClick={e => { e.stopPropagation(); onChange(""); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                            style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>

                    {/* Dropdown panel */}
                    {open && (
                        <div style={{
                            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderTop: "1px solid #f1f5f9",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                            overflow: "hidden",
                        }}>
                            {/* Search */}
                            <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    background: "#f8fafc", border: "1px solid #e2e8f0",
                                    borderRadius: 7, padding: "6px 10px",
                                }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        placeholder="Search by name, email, account ID…"
                                        style={{
                                            border: "none", background: "none", outline: "none",
                                            fontSize: 13, color: "#1e293b", flex: 1, minWidth: 0,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ maxHeight: 280, overflowY: "auto" }}>
                                {loading && (
                                    <div style={{ padding: "20px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                        Loading sellers…
                                    </div>
                                )}
                                {!loading && filtered.length === 0 && (
                                    <div style={{ padding: "20px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                        No sellers found
                                    </div>
                                )}
                                {!loading && filtered.map((s, i) => (
                                    <SellerRow
                                        key={s.sellerId || s.customer_assigned_account_id || i}
                                        seller={s}
                                        selected={(s.sellerId || s.customer_assigned_account_id) === sellerId}
                                        onSelect={() => handleSelect(s)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Plus button */}
                <button
                    onClick={onAddClick}
                    title="Add new seller"
                    style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        border: "1px solid #e2e8f0", background: "#fff",
                        color: "#475569",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.15s",
                        marginTop: 1,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#0f172a";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Main CreateOrderForm ─────────────────────────────────────────────────────
export function CreateOrderForm({ buyerId, onToast, onSuccess }) {
    const [form, setForm] = useState({
        order_date:    "",
        delivery_date: "",
        currency_code: "AUD",
        seller_id:     "",
        address: { street: "", city: "", state: "", postal_code: "", country_code: "AU" },
        items: [emptyItem()]
    });
    const [loading,       setLoading]       = useState(false);
    const [xmlResult,     setXmlResult]     = useState(null);
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [sellers,        setSellers]        = useState([]);
    const [sellersLoading, setSellersLoading] = useState(false);
    const [extractInput, setExtractInput] = useState("");
    const [extracting,   setExtracting]   = useState(false);

    // Load sellers on mount
    useEffect(() => {
        (async () => {
            setSellersLoading(true);
            try {
                const data = await getSellers();
                setSellers(data || []);
            } catch {
                
            } finally {
                setSellersLoading(false);
            }
        })();
    }, []);

    const setField   = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setAddress = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));
    const setItem    = (i, k, v) => setForm(f => {
        const items = [...f.items];
        items[i] = { ...items[i], [k]: v };
        return { ...f, items };
    });
    const addItem    = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

    const handleSellerCreated = (result) => {
        const newSeller = {
            sellerId: result.sellerId || result.id || result.customer_assigned_account_id,
            customer_assigned_account_id: result.customer_assigned_account_id || result.sellerId || result.id,
            party_name: result.party_name || "New Seller",
            contact_name: result.contact_name || "",
            contact_email: result.contact_email || "",
        };
        setSellers(prev => [...prev, newSeller]);
        setForm(f => ({ ...f, seller_id: newSeller.sellerId }));
        setForm(f => ({ ...f, seller_id: newSeller.customer_assigned_account_id }));
        setShowSellerForm(false);
    };

    const handleSubmit = async () => {
        if (!buyerId) {
            onToast("Please enter a Buyer ID first", "error");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                items: form.items.map(it => ({
                    ...it,
                    quantity:   parseInt(it.quantity),
                    unit_price: parseFloat(it.unit_price),
                })),
            };
            const result = await createOrder(payload, buyerId);
            setXmlResult(result);
            onToast("Order created successfully!", "success");
            onSuccess?.();
        } catch (err) {
            onToast(err?.error || "Failed to create order", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExtract = async () => {
        if (!extractInput.trim()) return;

        setExtracting(true);

        try {
            const result = await extractText(extractInput);

            if (result?.order?.order_date) setField("order_date", result.order.order_date);
            if (result?.order?.delivery_date) setField("delivery_date", result.order.delivery_date);
            if (result?.order?.currency_code) setField("currency_code", result.order.currency_code);

            if (result?.order?.address?.street) setAddress("street", result.order.address.street);
            if (result?.order?.address?.city) setAddress("city", result.order.address.city);
            if (result?.order?.address?.state) setAddress("state", result.order.address.state);
            if (result?.order?.address?.postal_code) setAddress("postal_code", result.order.address.postal_code);
            if (result?.order?.address?.country_code)setAddress("country_code", result.order.address.country_code);

            onToast("Fields extracted!", "success");
        } catch (err) {
            onToast("Extraction failed", "error");
        } finally {
            setExtracting(false);
        }
    };

    if (xmlResult) {
        return (
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Order Created</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>UBL XML response from the server</div>
                    </div>
                    <button
                        onClick={() => setXmlResult(null)}
                        style={{
                            padding: "8px 16px", borderRadius: 8,
                            border: "1px solid #e2e8f0", background: "#fff",
                            fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
                        }}
                    >
                        New Order
                    </button>
                </div>
                <pre style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
                    padding: 20, fontSize: 12, overflowX: "auto", lineHeight: 1.6,
                    color: "#334155", maxHeight: 500, overflowY: "auto",
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}>
                    {xmlResult}
                </pre>
            </div>
        );
    }

    // ── Seller sub-form view ──────────────────────────────────────────────────
    if (showSellerForm) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <SellerForm
                    onCreated={handleSellerCreated}
                    onCancel={() => setShowSellerForm(false)}
                    onToast={onToast}
                />

                {/* Order form preview below — greyed out so user knows it's still there */}
                <div style={{
                    marginTop: 32,
                    paddingTop: 24,
                    borderTop: "1px dashed #e2e8f0",
                    opacity: 0.35,
                    pointerEvents: "none",
                    userSelect: "none",
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 12 }}>
                        ORDER FORM (PAUSED)
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>
                        Your order form is waiting below. Complete the seller form above to return.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* AI Extraction */}
            <div>
                <SectionLabel>AI Extract</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <textarea
                        value={extractInput}
                        onChange={e => setExtractInput(e.target.value)}
                        placeholder="Paste unstructured order text here and let AI fill in the fields…"
                        rows={4}
                        style={{
                            width: "100%", padding: "10px 12px",
                            border: "1px solid #e2e8f0", borderRadius: 8,
                            fontSize: 13, color: "#1e293b", resize: "vertical",
                            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                        }}
                    />
                    <button
                        onClick={handleExtract}
                        disabled={extracting || !extractInput.trim()}
                        style={{
                            alignSelf: "flex-start",
                            padding: "9px 20px", borderRadius: 8, border: "none",
                            background: extracting || !extractInput.trim() ? "#94a3b8" : "#0f172a",
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            cursor: extracting || !extractInput.trim() ? "not-allowed" : "pointer",
                        }}
                    >
                        {extracting ? "Extracting…" : "Extract Fields"}
                    </button>
                </div>
            </div>

            {/* Seller */}
            <div>
                <SectionLabel>Seller</SectionLabel>
                <SellerDropdown
                    sellerId={form.seller_id}
                    onChange={v => setField("seller_id", v)}
                    sellers={sellers}
                    loading={sellersLoading}
                    onAddClick={() => setShowSellerForm(true)}
                />
            </div>

            {/* Order Details */}
            <div>
                <SectionLabel>Order Details</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <Field label="Order Date" required>
                        <Input type="date" value={form.order_date}
                            onChange={e => setField("order_date", e.target.value)} />
                    </Field>
                    <Field label="Delivery Date" required>
                        <Input type="date" value={form.delivery_date}
                            onChange={e => setField("delivery_date", e.target.value)} />
                    </Field>
                    <Field label="Currency Code" required>
                        <Input value={form.currency_code} placeholder="AUD" maxLength={3}
                            style={{ textTransform: "uppercase" }}
                            onChange={e => setField("currency_code", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Address */}
            <div>
                <SectionLabel>Delivery Address</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Field label="Street" required>
                        <Input value={form.address.street} placeholder="436 George St"
                            onChange={e => setAddress("street", e.target.value)} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                        {[
                            ["city",         "City",         "Sydney"],
                            ["state",        "State",        "NSW"],
                            ["postal_code",  "Postal Code",  "2000"],
                            ["country_code", "Country Code", "AU"],
                        ].map(([k, label, ph]) => (
                            <Field key={k} label={label} required>
                                <Input value={form.address[k]} placeholder={ph}
                                    maxLength={k === "country_code" ? 2 : undefined}
                                    style={k === "country_code" ? { textTransform: "uppercase" } : {}}
                                    onChange={e => setAddress(k, e.target.value)} />
                            </Field>
                        ))}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div>
                <SectionLabel>Items</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {form.items.map((item, i) => (
                        <div key={i} style={{
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            borderRadius: 10, padding: 16, position: "relative",
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 12, letterSpacing: "0.06em" }}>
                                ITEM {i + 1}
                            </div>
                            {form.items.length > 1 && (
                                <button
                                    onClick={() => removeItem(i)}
                                    style={{
                                        position: "absolute", top: 14, right: 14,
                                        background: "none", border: "none",
                                        cursor: "pointer", color: "#94a3b8",
                                        padding: 2, display: "flex",
                                    }}
                                >
                                    <Icon.X />
                                </button>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 12 }}>
                                <Field label="Item Name" required>
                                    <Input value={item.item_name} placeholder="Widget"
                                        onChange={e => setItem(i, "item_name", e.target.value)} />
                                </Field>
                                <Field label="Description">
                                    <Input value={item.item_description} placeholder="Industrial widget"
                                        onChange={e => setItem(i, "item_description", e.target.value)} />
                                </Field>
                                <Field label="Quantity" required>
                                    <Input type="number" min="1" value={item.quantity} placeholder="15"
                                        onChange={e => setItem(i, "quantity", e.target.value)} />
                                </Field>
                                <Field label="Unit Price" required>
                                    <Input type="number" min="0" step="0.01" value={item.unit_price} placeholder="50"
                                        onChange={e => setItem(i, "unit_price", e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addItem}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 14px", borderRadius: 8,
                            border: "1px dashed #cbd5e1", background: "transparent",
                            fontSize: 13, fontWeight: 600, color: "#64748b",
                            cursor: "pointer", width: "fit-content",
                        }}
                    >
                        <Icon.Plus /> Add Item
                    </button>
                </div>
            </div>

            <div style={{ paddingTop: 4 }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        padding: "11px 28px",
                        background: loading ? "#94a3b8" : "#0f172a",
                        color: "#fff", border: "none", borderRadius: 9,
                        fontSize: 14, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "0.02em", transition: "background 0.15s",
                    }}
                >
                    {loading ? "Creating…" : "Create Order"}
                </button>
            </div>
        </div>
    );
}