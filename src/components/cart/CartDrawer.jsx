"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { updateCartItem, removeFromCart } from "../../api/order";
import { getBuyers, createBuyer, checkout } from "../../api/order";
import { SpinnerIcon } from "../products/ProductCard";

// ─── Shared primitives matching CreateOrderForm style ─────────────────────────

function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: 11, fontWeight: 700, color: "#94a3b8",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 10,
        }}>
            {children}
        </div>
    );
}

function Field({ label, required, error, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{
                fontSize: 12, fontWeight: 600, color: "#64748b",
                letterSpacing: "0.03em",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}>
                {label}
                {required && <span style={{ color: "#e11d48", marginLeft: 3 }}>*</span>}
            </label>
            {children}
            {error && <span style={{ fontSize: 11, color: "#e11d48" }}>{error}</span>}
        </div>
    );
}

function Input({ style, ...props }) {
    return (
        <input
            style={{
                width: "100%",
                padding: "8px 11px",
                fontSize: 13,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                outline: "none",
                color: "#0f172a",
                background: "#fff",
                boxSizing: "border-box",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                transition: "border-color 0.15s",
                ...style,
            }}
            onFocus={e => e.target.style.borderColor = "#94a3b8"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            {...props}
        />
    );
}

// ─── Buyer avatar (mirrors SellerAvatar) ──────────────────────────────────────

function BuyerAvatar({ name, size = 28, selected }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: selected
                ? "linear-gradient(135deg, #0ea5e9, #38bdf8)"
                : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.36, fontWeight: 700,
            color: selected ? "#fff" : "#64748b",
        }}>
            {initials}
        </div>
    );
}

// ─── Buyer dropdown ───────────────────────────────────────────────────────────

function BuyerDropdown({ buyerId, onChange, buyers, loading, onAddClick, newBuyerPrefill, setView }) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState("");
    const containerRef        = useRef(null);

    const selected = buyers.find(b => b.buyerId === buyerId);

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

    const filtered = buyers.filter(b => {
        const q = search.toLowerCase();
        return (
            b.party_name?.toLowerCase().includes(q) ||
            b.contact_email?.toLowerCase().includes(q) ||
            b.customer_assigned_account_id?.toLowerCase().includes(q) ||
            b.buyerId?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1, position: "relative" }} ref={containerRef}>
                {/* Trigger */}
                <div
                    onClick={() => { setOpen(o => !o); setSearch(""); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "#fff", border: "1px solid #e2e8f0",
                        borderRadius: open ? "8px 8px 0 0" : 8,
                        padding: "9px 12px", cursor: "pointer",
                        transition: "border-color 0.15s",
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {selected ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <BuyerAvatar name={selected.party_name} selected />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                                    {selected.party_name}
                                </span>
                                {selected.customer_assigned_account_id && (
                                    <span style={{
                                        fontSize: 11, color: "#0ea5e9",
                                        background: "#e0f2fe",
                                        borderRadius: 4, padding: "1px 6px",
                                    }}>
                                        {selected.customer_assigned_account_id}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span style={{ fontSize: 13, color: "#94a3b8" }}>
                                {loading ? "Loading buyers…" : "Select a buyer…"}
                            </span>
                        )}
                    </div>

                    {buyerId && (
                        <button
                            onClick={e => { e.stopPropagation(); onChange(""); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}
                        >
                            <XSmallIcon />
                        </button>
                    )}

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                        style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </div>

                {/* Dropdown panel */}
                {open && (
                    <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 300,
                        background: "#fff", border: "1px solid #e2e8f0",
                        borderTop: "1px solid #f1f5f9", borderRadius: "0 0 8px 8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                    }}>
                        {/* Search */}
                        <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: "#f8fafc", border: "1px solid #e2e8f0",
                                borderRadius: 7, padding: "6px 10px",
                            }}>
                                <SearchSmallIcon />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    placeholder="Search by name, email, account ID…"
                                    style={{
                                        border: "none", background: "none", outline: "none",
                                        fontSize: 13, color: "#0f172a", flex: 1, minWidth: 0,
                                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                                    }}
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            {loading && (
                                <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                    Loading buyers…
                                </div>
                            )}
                            {!loading && filtered.length === 0 && (
                                <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                    No buyers found
                                </div>
                            )}
                            {!loading && filtered.map((b, i) => (
                                <BuyerRow
                                    key={b.buyerId || i}
                                    buyer={b}
                                    selected={b.buyerId === buyerId}
                                    onSelect={() => { onChange(b.buyerId); setOpen(false); setSearch(""); }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add buyer button — with AI prefill indicator */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                <button
                    onClick={() => setView("new-buyer")}
                    title="Add new buyer"
                    style={{
                        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                        border: "1px solid #e2e8f0", background: "#fff",
                        color: "#475569", display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", transition: "all 0.15s",
                        marginTop: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#475569"; }}
                >
                    <PlusSmallIcon />
                </button>
                {newBuyerPrefill && !buyerId && (
                    <div style={{
                        position: "absolute", top: -3, right: -3,
                        width: 12, height: 12, borderRadius: "50%",
                        background: "#f59e0b", border: "2px solid #fff",
                    }} title="AI has prefilled buyer details" />
                )}
            </div>
        </div>
    );
}

function BuyerRow({ buyer, selected, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", cursor: "pointer",
                background: selected ? "#f0f9ff" : hovered ? "#f8fafc" : "transparent",
                borderLeft: `3px solid ${selected ? "#0ea5e9" : "transparent"}`,
                transition: "background 0.1s",
            }}
        >
            <BuyerAvatar name={buyer.party_name} size={32} selected={selected} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected ? "#0369a1" : "#0f172a" }}>
                        {buyer.party_name || "Unnamed Buyer"}
                    </span>
                    {buyer.customer_assigned_account_id && (
                        <span style={{
                            fontSize: 11, color: selected ? "#0ea5e9" : "#64748b",
                            background: selected ? "#e0f2fe" : "#f1f5f9",
                            borderRadius: 4, padding: "1px 6px",
                        }}>
                            {buyer.customer_assigned_account_id}
                        </span>
                    )}
                </div>
                {buyer.contact_email && (
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{buyer.contact_email}</div>
                )}
            </div>
            {selected && <CheckSmallIcon />}
        </div>
    );
}

// ─── New Buyer sub-form (mirrors SellerForm pattern) ──────────────────────────

const emptyBuyerForm = () => ({
    party_name: "",
    customer_assigned_account_id: "",
    supplier_assigned_account_id: "",
    address: { street: "", city: "", state: "", postal_code: "", country_code: "AU" },
    contact: { name: "", telephone: "", telefax: "", email: "" },
    tax_scheme: { registration_name: "", company_id: "", exemption_reason: "", scheme_id: "", tax_type_code: "" },
});

function NewBuyerForm({ onCreated, onCancel, onToast, prefill }) {
    const [form, setForm] = useState(emptyBuyerForm());
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setAddr = (k, v) => setForm(f => ({ ...f, address:    { ...f.address,    [k]: v } }));
    const setCont = (k, v) => setForm(f => ({ ...f, contact:    { ...f.contact,    [k]: v } }));
    const setTax = (k, v) => setForm(f => ({ ...f, tax_scheme: { ...f.tax_scheme, [k]: v } }));

    useEffect(() => {
        if (!prefill) return;
        setForm({
            party_name: prefill.party_name || "",
            customer_assigned_account_id: prefill.customer_assigned_account_id || "",
            supplier_assigned_account_id: prefill.supplier_assigned_account_id || "",
            address: {
                street: prefill.address?.street || "",
                city: prefill.address?.city || "",
                state: prefill.address?.state || "",
                postal_code: prefill.address?.postal_code || "",
                country_code: prefill.address?.country_code || "AU",
            },
            contact: {
                name: prefill.contact?.name || "",
                telephone: prefill.contact?.telephone || "",
                telefax: prefill.contact?.telefax || "",
                email: prefill.contact?.email || "",
            },
            tax_scheme: {
                registration_name: prefill.tax_scheme?.registration_name || "",
                company_id: prefill.tax_scheme?.company_id || "",
                exemption_reason: prefill.tax_scheme?.exemption_reason  || "",
                scheme_id: prefill.tax_scheme?.scheme_id || "",
                tax_type_code: prefill.tax_scheme?.tax_type_code || "",
            },
        });
    }, [prefill]);

    const handleSubmit = async () => {
        if (!form.party_name.trim()) {
            onToast("Party name is required", "error"); return;
        }
        if (!form.customer_assigned_account_id.trim()) {
            onToast("Customer account ID is required", "error"); return;
        }
        setLoading(true);
        try {
            const result = await createBuyer(form);
            onToast("Buyer created!", "success");
            onCreated(result);
        } catch (err) {
            onToast(err?.error || "Failed to create buyer", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>New Buyer</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        Created buyer will auto-select for checkout
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 8,
                        border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#475569",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#475569"; }}
                >
                    <ChevronLeftIcon /> Back
                </button>
            </div>

            {prefill && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 8,
                    background: "#fffbeb", border: "1px solid #fde68a",
                    fontSize: 12, color: "#92400e",
                }}>
                    <span>✦</span>
                    <span>Fields prefilled by AI — please review before creating</span>
                </div>
            )}

            {/* Account */}
            <div>
                <SectionLabel>Account</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Party / Company Name" required>
                        <Input value={form.party_name} placeholder="Acme Corp"
                            onChange={e => set("party_name", e.target.value)} />
                    </Field>
                    <Field label="Customer Account ID" required>
                        <Input value={form.customer_assigned_account_id} placeholder="ACC001"
                            onChange={e => set("customer_assigned_account_id", e.target.value)} />
                    </Field>
                    <Field label="Supplier Account ID">
                        <Input value={form.supplier_assigned_account_id} placeholder="SUP-001"
                            onChange={e => set("supplier_assigned_account_id", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Address */}
            <div>
                <SectionLabel>Address</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Field label="Street">
                        <Input value={form.address.street} placeholder="123 Main St"
                            onChange={e => setAddr("street", e.target.value)} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                            ["city",         "City",         "Sydney"],
                            ["state",        "State",        "NSW"],
                            ["postal_code",  "Postal Code",  "2000"],
                            ["country_code", "Country",      "AU"],
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Name">
                        <Input value={form.contact.name} placeholder="Jane Smith"
                            onChange={e => setCont("name", e.target.value)} />
                    </Field>
                    <Field label="Email">
                        <Input type="email" value={form.contact.email} placeholder="jane@acme.com"
                            onChange={e => setCont("email", e.target.value)} />
                    </Field>
                    <Field label="Telephone">
                        <Input value={form.contact.telephone} placeholder="+61 2 0000 0000"
                            onChange={e => setCont("telephone", e.target.value)} />
                    </Field>
                    <Field label="Telefax">
                        <Input value={form.contact.telefax} placeholder="+61 2 0000 0001"
                            onChange={e => setCont("telefax", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Tax */}
            <div>
                <SectionLabel>Tax Scheme</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Registration Name">
                        <Input value={form.tax_scheme.registration_name} placeholder="Acme Corp"
                            onChange={e => setTax("registration_name", e.target.value)} />
                    </Field>
                    <Field label="Company ID">
                        <Input value={form.tax_scheme.company_id} placeholder="ABN 00 000 000 000"
                            onChange={e => setTax("company_id", e.target.value)} />
                    </Field>
                    <Field label="Scheme ID">
                        <Input value={form.tax_scheme.scheme_id} placeholder="GST"
                            onChange={e => setTax("scheme_id", e.target.value)} />
                    </Field>
                    <Field label="Tax Type Code">
                        <Input value={form.tax_scheme.tax_type_code} placeholder="GST"
                            onChange={e => setTax("tax_type_code", e.target.value)} />
                    </Field>
                    <Field label="Exemption Reason" style={{ gridColumn: "span 2" }}>
                        <Input value={form.tax_scheme.exemption_reason} placeholder="N/A"
                            onChange={e => setTax("exemption_reason", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={onCancel} style={btnStyles.secondary}>Cancel</button>
                <button onClick={handleSubmit} disabled={loading} style={btnStyles.primary}>
                    {loading ? <><SpinnerIcon size={12} color="#fff" /> Creating…</> : "Create Buyer"}
                </button>
            </div>
        </div>
    );
}

// ─── Checkout form ────────────────────────────────────────────────────────────

function CheckoutForm({ cart, onToast, onClose, onSuccess, sellerId, prefill }) {
    const [view, setView] = useState("checkout"); // "checkout" | "new-buyer" | "success"

    const [buyers, setBuyers] = useState([]);
    const [buyersLoading, setBuyersLoading] = useState(false);

    const [buyerId, setBuyerId] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [currencyCode, setCurrencyCode] = useState("AUD");
    const [sameAsBuyer, setSameAsBuyer] = useState(false);
    const [address, setAddress] = useState({
        street: "", city: "", state: "", postal_code: "", country_code: "AU",
    });

    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [errors, setErrors] = useState({});
    const [newBuyerPrefill, setNewBuyerPrefill] = useState(null);

    const setAddr = (k, v) => setAddress(a => ({ ...a, [k]: v }));

    useEffect(() => {
        if (!prefill) return;
        const o = prefill.order;
        const b = prefill.buyer;
        const existingBuyerId = prefill.buyer_id;

        if (o?.delivery_date) setDeliveryDate(o.delivery_date);
        if (o?.currency_code) setCurrencyCode(o.currency_code);

        if (o?.address) {
            if (o.address.street) setAddr("street", o.address.street);
            if (o.address.city) setAddr("city", o.address.city);
            if (o.address.state) setAddr("state", o.address.state);
            if (o.address.postal_code) setAddr("postal_code", o.address.postal_code);
            if (o.address.country_code) setAddr("country_code", o.address.country_code);
        }

        if (existingBuyerId) {
            setBuyerId(existingBuyerId);
            setView("checkout");
        } else if (b) {
            setNewBuyerPrefill(b);
            setView("new-buyer");
        }
    }, [prefill]);

    const fetchBuyers = useCallback(async () => {
        setBuyersLoading(true);
        try {
            const data = await getBuyers();
            setBuyers(data);
        } catch {
            onToast("Failed to load buyers", "error");
        } finally {
            setBuyersLoading(false);
        }
    }, []);

    useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

    // When sameAsBuyer toggled on, fill address from selected buyer
    useEffect(() => {
        if (!sameAsBuyer) return;
        const buyer = buyers.find(b => b.buyerId === buyerId);
        if (buyer?.address) {
            setAddress({
                street:       buyer.address.street       || "",
                city:         buyer.address.city         || "",
                state:        buyer.address.state        || "",
                postal_code:  buyer.address.postal_code  || "",
                country_code: buyer.address.country_code || "AU",
            });
        }
    }, [sameAsBuyer, buyerId, buyers]);

    const handleBuyerCreated = (result) => {
        const newBuyer = {
            buyerId: result.buyerId,
            party_name: result.party_name    || "New Buyer",
            customer_assigned_account_id: result.customer_assigned_account_id || "",
            contact_email: result.contact_email || "",
        };
        setBuyers(prev => [...prev, newBuyer]);
        setBuyerId(newBuyer.buyerId);
        setView("checkout");
    };

    const validate = () => {
        const errs = {};
        if (!buyerId) errs.buyerId = "Please select a buyer";
        if (!deliveryDate) errs.deliveryDate = "Delivery date is required";
        if (!sameAsBuyer) {
            if (!address.street) errs.street = "Required";
            if (!address.city) errs.city = "Required";
            if (!address.state) errs.state = "Required";
            if (!address.postal_code)  errs.postal_code = "Required";
            if (!address.country_code) errs.country_code = "Required";
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);

        const data = {
            "address": {
                "street": address.street,
                "city": address.city,
                "state": address.state,
                "postal_code": address.postal_code,
                "country_code": address.country_code
            },
            "delivery_date": deliveryDate,
            "currency_code": currencyCode,
            "buyer_id": buyerId
        }

        try {
            const response = await checkout(sellerId, data);
            console.log(response)
            setResult(response);
            setView("success");
            onSuccess?.();
        } catch (err) {
            console.log(err)
            onToast(err?.error || "Checkout failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success view ──────────────────────────────────────────────────────────
    if (view === "success") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 24px 24px" }}>
                <div style={successBanner}>
                    <CheckCircleIcon />
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d" }}>
                            Order placed successfully!
                        </div>
                        <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>
                            {result?.orders?.length === 1
                                ? "1 order created"
                                : `${result?.orders?.length} orders created`}
                        </div>
                    </div>
                </div>

                {result?.orders?.map((order, i) => (
                    <div key={i} style={orderCard}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.06em" }}>
                            ORDER {i + 1}
                        </div>
                        <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
                            {order.orderId}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                            {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                        </div>
                    </div>
                ))}

                <button onClick={onClose} style={{ ...btnStyles.primary, marginTop: 8 }}>
                    Done
                </button>
            </div>
        );
    }

    // ── New buyer sub-form view ───────────────────────────────────────────────
    if (view === "new-buyer") {
        return (
            <div style={{ padding: "0 24px 24px", overflowY: "auto", flex: 1 }}>
                <NewBuyerForm
                    onCreated={handleBuyerCreated}
                    onCancel={() => setView("checkout")}
                    onToast={onToast}
                    prefill={newBuyerPrefill}
                />
                {/* Greyed checkout preview */}
                <div style={{
                    marginTop: 28, paddingTop: 20,
                    borderTop: "1px dashed #e2e8f0",
                    opacity: 0.3, pointerEvents: "none", userSelect: "none",
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em" }}>
                        CHECKOUT (PAUSED)
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                        Complete the buyer form above to return
                    </div>
                </div>
            </div>
        );
    }

    // ── Main checkout view ────────────────────────────────────────────────────
    const selectedBuyer = buyers.find(b => b.buyerId === buyerId);

    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

                    {/* Buyer */}
                    <div>
                        <SectionLabel>Buyer</SectionLabel>
                        <BuyerDropdown
                            buyerId={buyerId}
                            onChange={id => { setBuyerId(id); setSameAsBuyer(false); setErrors(e => ({ ...e, buyerId: undefined })); }}
                            buyers={buyers}
                            loading={buyersLoading}
                            onAddClick={() => setView("new-buyer")}
                            newBuyerPrefill={newBuyerPrefill}
                            setView={setView}
                        />
                        {errors.buyerId && (
                            <div style={{ fontSize: 11, color: "#e11d48", marginTop: 4 }}>{errors.buyerId}</div>
                        )}
                    </div>

                    {/* Order details */}
                    <div>
                        <SectionLabel>Order Details</SectionLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <Field label="Delivery Date" required error={errors.deliveryDate}>
                                <Input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={e => { setDeliveryDate(e.target.value); setErrors(er => ({ ...er, deliveryDate: undefined })); }}
                                />
                            </Field>
                            <Field label="Currency">
                                <Input
                                    value={currencyCode}
                                    placeholder="AUD"
                                    maxLength={3}
                                    style={{ textTransform: "uppercase" }}
                                    onChange={e => setCurrencyCode(e.target.value.toUpperCase())}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Delivery address */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <SectionLabel>Delivery Address</SectionLabel>
                            {buyerId && (
                                <label style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    fontSize: 12, color: "#64748b", cursor: "pointer",
                                    marginBottom: 10,
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={sameAsBuyer}
                                        onChange={e => setSameAsBuyer(e.target.checked)}
                                        style={{ accentColor: "#0f172a", width: 14, height: 14, cursor: "pointer" }}
                                    />
                                    Same as buyer
                                </label>
                            )}
                        </div>

                        {sameAsBuyer ? (
                            <div style={addressPreview}>
                                {selectedBuyer?.address ? (
                                    <>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                                            {selectedBuyer.address.street}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                            {[
                                                selectedBuyer.address.city,
                                                selectedBuyer.address.state,
                                                selectedBuyer.address.postal_code,
                                                selectedBuyer.address.country_code,
                                            ].filter(Boolean).join(", ")}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                                        No address on file for this buyer
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <Field label="Street" required error={errors.street}>
                                    <Input value={address.street} placeholder="123 Main St"
                                        onChange={e => { setAddr("street", e.target.value); setErrors(er => ({ ...er, street: undefined })); }} />
                                </Field>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    <Field label="City" required error={errors.city}>
                                        <Input value={address.city} placeholder="Sydney"
                                            onChange={e => { setAddr("city", e.target.value); setErrors(er => ({ ...er, city: undefined })); }} />
                                    </Field>
                                    <Field label="State" required error={errors.state}>
                                        <Input value={address.state} placeholder="NSW"
                                            onChange={e => { setAddr("state", e.target.value); setErrors(er => ({ ...er, state: undefined })); }} />
                                    </Field>
                                    <Field label="Postal Code" required error={errors.postal_code}>
                                        <Input value={address.postal_code} placeholder="2000"
                                            onChange={e => { setAddr("postal_code", e.target.value); setErrors(er => ({ ...er, postal_code: undefined })); }} />
                                    </Field>
                                    <Field label="Country" required error={errors.country_code}>
                                        <Input value={address.country_code} placeholder="AU"
                                            maxLength={2}
                                            style={{ textTransform: "uppercase" }}
                                            onChange={e => { setAddr("country_code", e.target.value.toUpperCase()); setErrors(er => ({ ...er, country_code: undefined })); }} />
                                    </Field>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order summary */}
                    <div>
                        <SectionLabel>Order Summary</SectionLabel>
                        <div style={summaryBox}>
                            {cart?.sellers?.map(seller => (
                                <div key={seller.sellerId}>
                                    <div style={summarySellerLabel}>{seller.sellerName}</div>
                                    {seller.items?.map(item => (
                                        <div key={item.cartItemId} style={summaryRow}>
                                            <div style={{ flex: 1 }}>
                                                <span style={summaryItemName}>{item.productName}</span>
                                                <span style={summaryQty}> × {item.quantity}</span>
                                            </div>
                                            <span style={summaryPrice}>
                                                ${parseFloat(item.lineTotal).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div style={summarySubtotalRow}>
                                        <span>Subtotal</span>
                                        <span>${parseFloat(seller.subtotal).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            <div style={summaryTotalRow}>
                                <span>Total</span>
                                <span>${parseFloat(cart?.grandTotal || 0).toFixed(2)} {currencyCode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky footer */}
            <div style={footerStyles}>
                <button onClick={handleSubmit} disabled={submitting} style={btnStyles.primary}>
                    {submitting
                        ? <><SpinnerIcon size={13} color="#fff" /> Placing Order…</>
                        : "Place Order"
                    }
                </button>
            </div>
        </div>
    );
}

// ─── Main CartDrawer ──────────────────────────────────────────────────────────

export function CartDrawer({ cart, onClose, onToast, onRefresh, sellerId, prefill }) {
    // "cart" | "checkout"
    const [view, setView] = useState("cart");

    const isEmpty = !cart || cart.itemCount === 0;

    // Reset to cart view when drawer closes/reopens
    useEffect(() => { setView("cart"); }, []);

    const handleCheckoutSuccess = () => {
        onRefresh();
    };

    return createPortal(
        <>
            <div onClick={onClose} style={backdropStyle} />
            <div style={drawerStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {view === "checkout" && (
                            <button
                                onClick={() => setView("cart")}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex", marginRight: 2 }}
                            >
                                <ChevronLeftIcon />
                            </button>
                        )}
                        <CartIcon />
                        <span style={headerTitle}>
                            {view === "checkout" ? "Checkout" : "Cart"}
                        </span>
                        {view === "cart" && !isEmpty && (
                            <span style={badgeStyle}>{cart.itemCount}</span>
                        )}
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}><XIcon /></button>
                </div>

                {/* Body */}
                {view === "cart" ? (
                    <>
                        <div style={{ flex: 1, overflowY: "auto" }}>
                            {isEmpty ? (
                                <div style={emptyState}>
                                    <EmptyCartIcon />
                                    <div style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>Your cart is empty</div>
                                    <div style={{ fontSize: 13, color: "#757575" }}>Add products to get started</div>
                                </div>
                            ) : (
                                cart.sellers?.map(seller => (
                                    <SellerGroup
                                        key={seller.sellerId}
                                        seller={seller}
                                        onToast={onToast}
                                        onRefresh={onRefresh}
                                        currencyCode={cart.currencyCode}
                                    />
                                ))
                            )}
                        </div>

                        {!isEmpty && (
                            <div style={footerStyles}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Total</span>
                                    <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>
                                        ${parseFloat(cart.grandTotal).toFixed(2)} {cart.currencyCode}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setView("checkout")}
                                    style={btnStyles.primary}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <CheckoutForm
                        cart={cart}
                        onToast={onToast}
                        onClose={onClose}
                        onSuccess={handleCheckoutSuccess}
                        sellerId={sellerId}
                        prefill={prefill}
                    />
                )}
            </div>
        </>,
        document.body
    );
}

// ─── Cart item components (unchanged from before) ─────────────────────────────

function SellerGroup({ seller, onToast, onRefresh, currencyCode }) {
    return (
        <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 8px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#757575" }}>
                    {seller.sellerName}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                    ${parseFloat(seller.subtotal).toFixed(2)}
                </span>
            </div>
            {seller.items?.map(item => (
                <CartItem
                    key={item.cartItemId}
                    item={item}
                    sellerId={seller.sellerId}
                    onToast={onToast}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}

function CartItem({ item, sellerId, onToast, onRefresh }) {
    const [qty, setQty] = useState(item.quantity);
    const [updating, setUpdating] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleQtyChange = async (newQty) => {
        if (newQty < 1 || !sellerId) return;
        setQty(newQty);
        setUpdating(true);
        try {
            await updateCartItem(sellerId, item.productId, newQty);
            onRefresh();
        } catch {
            setQty(item.quantity);
            onToast("Failed to update quantity", "error");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemove = async () => {
        if (!sellerId) return;
        setRemoving(true);
        try {
            await removeFromCart(sellerId, item.productId);
            onRefresh();
            onToast("Item removed", "success");
        } catch {
            onToast("Failed to remove item", "error");
            setRemoving(false);
        }
    };

    return (
        <div style={{ display: "flex", gap: 14, padding: "12px 24px", alignItems: "flex-start" }}>
            <div style={{ width: 72, height: 72, background: "#f5f5f5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{item.productName}</div>
                {item.productDescription && (
                    <div style={{ fontSize: 12, color: "#757575", lineHeight: 1.4 }}>{item.productDescription}</div>
                )}
                <div style={{ fontSize: 12, color: "#757575", marginTop: 2 }}>
                    ${parseFloat(item.unitPrice).toFixed(2)} each
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    {sellerId ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #e5e5e5", borderRadius: 20, overflow: "hidden" }}>
                            <button onClick={() => handleQtyChange(qty - 1)} disabled={updating || qty <= 1}
                                style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                −
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 24, textAlign: "center", color: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {updating ? <SpinnerIcon size={11} color="#111" /> : qty}
                            </span>
                            <button onClick={() => handleQtyChange(qty + 1)} disabled={updating}
                                style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                +
                            </button>
                        </div>
                    ) : (
                        <span style={{ fontSize: 12, color: "#757575" }}>Qty: {qty}</span>
                    )}
                    {sellerId && (
                        <button onClick={handleRemove} disabled={removing}
                            style={{ background: "none", border: "none", fontSize: 12, color: "#757575", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                            {removing ? "Removing…" : "Remove"}
                        </button>
                    )}
                </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111", flexShrink: 0, paddingTop: 2 }}>
                ${parseFloat(item.lineTotal).toFixed(2)}
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const backdropStyle = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.32)", zIndex: 400,
    backdropFilter: "blur(1px)",
};

const drawerStyle = {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "min(480px, 100vw)",
    background: "#fff", zIndex: 401,
    boxShadow: "-8px 0 48px rgba(0,0,0,0.12)",
    display: "flex", flexDirection: "column",
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
    overflow: "hidden",
    animation: "slideIn 0.22s ease",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const headerStyle = {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
};

const headerTitle = {
    fontSize: 17, fontWeight: 600, color: "#111",
};

const badgeStyle = {
    fontSize: 11, fontWeight: 700, color: "#fff",
    background: "#111", borderRadius: "50%",
    width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
};

const closeBtnStyle = {
    background: "none", border: "none",
    cursor: "pointer", color: "#94a3b8",
    padding: 4, display: "flex",
};

const emptyState = {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 12, height: 320, color: "#999",
};

const footerStyles = {
    padding: "16px 24px 24px",
    borderTop: "1px solid #f0f0f0",
    flexShrink: 0,
};

const btnStyles = {
    primary: {
        width: "100%", padding: "13px 0",
        background: "#111", color: "#fff",
        border: "none", borderRadius: 30,
        fontSize: 14, fontWeight: 600,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        gap: 6, letterSpacing: "0.02em",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        transition: "opacity 0.15s",
    },
    secondary: {
        padding: "9px 18px", border: "1px solid #e2e8f0",
        borderRadius: 8, background: "#fff",
        fontSize: 13, fontWeight: 600,
        cursor: "pointer", color: "#475569",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
};

const addressPreview = {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "12px 14px",
};

const summaryBox = {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 10, overflow: "hidden",
};

const summarySellerLabel = {
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    letterSpacing: "0.07em", textTransform: "uppercase",
    padding: "10px 14px 6px",
    borderBottom: "1px solid #f0f0f0",
};

const summaryRow = {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 14px",
};

const summaryItemName = { fontSize: 13, color: "#0f172a", fontWeight: 500 };
const summaryQty = { fontSize: 13, color: "#94a3b8" };
const summaryPrice = { fontSize: 13, color: "#0f172a", fontWeight: 500 };

const summarySubtotalRow = {
    display: "flex", justifyContent: "space-between",
    padding: "8px 14px 10px",
    fontSize: 12, color: "#64748b",
    borderTop: "1px solid #f0f0f0",
};

const summaryTotalRow = {
    display: "flex", justifyContent: "space-between",
    padding: "12px 14px",
    fontSize: 14, fontWeight: 700, color: "#0f172a",
    borderTop: "2px solid #e2e8f0",
    background: "#fff",
};

const successBanner = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: 10,
};

const orderCard = {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "12px 14px",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function EmptyCartIcon() {
    return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function XIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function XSmallIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
}
function ChevronLeftIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>;
}
function PlusSmallIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function SearchSmallIcon() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
}
function CheckSmallIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>;
}
function CheckCircleIcon() {
    return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;
}