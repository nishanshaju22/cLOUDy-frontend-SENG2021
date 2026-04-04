"use client";

import { useState } from "react";
import { Field, Input, SectionLabel } from "../ui/ui";
import { order_api } from "../../api/axios";

async function createBuyer(buyerData) {
    try {
        const response = await order_api.post("/v1/buyer", buyerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Something went wrong" };
    }
}

const emptyForm = () => ({
    customer_assigned_account_id: "",
    supplier_assigned_account_id: "",
    party_name: "",
    address: {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country_code: "AU",
    },
    tax_scheme: {
        registration_name: "",
        company_id: "",
        exemption_reason: "",
        scheme_id: "",
        tax_type_code: "",
    },
    contact: {
        name: "",
        telephone: "",
        telefax: "",
        email: "",
    },
});

export function AddBuyerButton({ onToast, onSuccess }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setAddr = (k, v) =>
        setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
    const setTax = (k, v) =>
        setForm((f) => ({ ...f, tax_scheme: { ...f.tax_scheme, [k]: v } }));
    const setCont = (k, v) =>
        setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }));

    const handleOpen = () => {
        setForm(emptyForm());
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const result = await createBuyer(form);
            onToast?.("Buyer created successfully!", "success");
            onSuccess?.(result);
            handleClose();
        } catch (err) {
            onToast?.(err?.error || "Failed to create buyer", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={open ? handleClose : handleOpen}
                title={open ? "Close" : "Add Buyer"}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid #e2e8f0",
                    background: open ? "#0f172a" : "#fff",
                    color: open ? "#fff" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: open
                        ? "0 4px 14px rgba(0,0,0,0.18)"
                        : "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
                    position: "relative",
                    zIndex: open ? 702 : 1,
                }}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{
                        transition:
                            "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                        transform: open ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                >
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>

            {open && (
                <div
                    onClick={handleClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 700,
                        background: "rgba(10,8,20,0.45)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                        animation: "fadeIn 0.18s ease",
                    }}
                />
            )}

            {open && (
                <FormPanel
                    form={form}
                    loading={loading}
                    set={set}
                    setAddr={setAddr}
                    setTax={setTax}
                    setCont={setCont}
                    onClose={handleClose}
                    onSubmit={handleSubmit}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0 }
                    to { opacity: 1 }
                }

                @keyframes panelIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </>
    );
}

function FormPanel({
    form,
    loading,
    set,
    setAddr,
    setTax,
    setCont,
    onClose,
    onSubmit,
}) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "fixed",
                top: 80,
                right: 100,
                zIndex: 701,
                width: "min(640px, calc(100vw - 48px))",
                animation: "panelIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow:
                        "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
                    maxHeight: "calc(100vh - 140px)",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        position: "sticky",
                        top: 0,
                        background: "#fff",
                        borderRadius: "16px 16px 0 0",
                        zIndex: 1,
                    }}
                >
                    <div
                        style={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: "#0f172a",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Add Buyer
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            marginTop: 3,
                        }}
                    >
                        Fill in the buyer details below
                    </div>
                </div>

                <div
                    style={{
                        padding: "20px 24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                    }}
                >
                    <div>
                        <SectionLabel>Account</SectionLabel>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                            }}
                        >
                            <Field label="Customer Account ID" required>
                                <Input
                                    value={form.customer_assigned_account_id}
                                    placeholder="XFB01"
                                    onChange={(e) =>
                                        set(
                                            "customer_assigned_account_id",
                                            e.target.value
                                        )
                                    }
                                />
                            </Field>

                            <Field label="Supplier Account ID">
                                <Input
                                    value={form.supplier_assigned_account_id}
                                    placeholder="GT00978567"
                                    onChange={(e) =>
                                        set(
                                            "supplier_assigned_account_id",
                                            e.target.value
                                        )
                                    }
                                />
                            </Field>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <Field label="Party / Company Name" required>
                                <Input
                                    value={form.party_name}
                                    placeholder="IYT Corporation"
                                    onChange={(e) =>
                                        set("party_name", e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                    </div>

                    <div>
                        <SectionLabel>Address</SectionLabel>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <Field label="Street" required>
                                <Input
                                    value={form.address.street}
                                    placeholder="436 George St"
                                    onChange={(e) =>
                                        setAddr("street", e.target.value)
                                    }
                                />
                            </Field>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr 1fr 1fr",
                                    gap: 10,
                                }}
                            >
                                {[
                                    ["city", "City", "Sydney"],
                                    ["state", "State", "NSW"],
                                    ["postal_code", "Postal Code", "2000"],
                                    ["country_code", "Country Code", "AU"],
                                ].map(([k, label, ph]) => (
                                    <Field key={k} label={label}>
                                        <Input
                                            value={form.address[k]}
                                            placeholder={ph}
                                            maxLength={
                                                k === "country_code"
                                                    ? 2
                                                    : undefined
                                            }
                                            style={
                                                k === "country_code"
                                                    ? {
                                                          textTransform:
                                                              "uppercase",
                                                      }
                                                    : {}
                                            }
                                            onChange={(e) =>
                                                setAddr(k, e.target.value)
                                            }
                                        />
                                    </Field>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionLabel>Contact</SectionLabel>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                            }}
                        >
                            <Field label="Name">
                                <Input
                                    value={form.contact.name}
                                    placeholder="Mr Fred Churchill"
                                    onChange={(e) =>
                                        setCont("name", e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Email">
                                <Input
                                    type="email"
                                    value={form.contact.email}
                                    placeholder="fred@iytcorporation.gov.uk"
                                    onChange={(e) =>
                                        setCont("email", e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Telephone">
                                <Input
                                    value={form.contact.telephone}
                                    placeholder="0127 2653214"
                                    onChange={(e) =>
                                        setCont("telephone", e.target.value)
                                    }
                                />
                            </Field>

                            <Field label="Telefax">
                                <Input
                                    value={form.contact.telefax}
                                    placeholder="0127 2653215"
                                    onChange={(e) =>
                                        setCont("telefax", e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                    </div>

                    <div
                        style={{
                            paddingTop: 4,
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                padding: "9px 20px",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#475569",
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onSubmit}
                            disabled={loading}
                            style={{
                                padding: "9px 24px",
                                borderRadius: 8,
                                border: "none",
                                background: loading
                                    ? "#94a3b8"
                                    : "#0f172a",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                                transition: "background 0.15s",
                            }}
                        >
                            {loading ? "Creating…" : "Create Buyer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}