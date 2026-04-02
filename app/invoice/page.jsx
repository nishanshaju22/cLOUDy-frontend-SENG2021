"use client";

import { useEffect, useState } from "react";
import { getInvoices } from "../../api/invoice";

export default function InvoicePage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const data = await getInvoices();
            setInvoices(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>My Invoices</h2>
            <p style={{ fontSize: 13, color: "#64748b" }}>
                Browse and manage all invoices.
            </p>

            <div style={{ marginTop: 20 }}>
                {loading && <p>Loading...</p>}

                {!loading && invoices.length === 0 && (
                    <p>No invoices found</p>
                )}

                {invoices.map((inv) => (
                    <div
                        key={inv.invoiceId}
                        style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: "16px 20px",
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                {inv.invoiceId?.slice(0, 8)}…
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                                {inv.invoiceDescription}
                            </div>

                            <div style={{ fontSize: 12, color: "#64748b" }}>
                                {inv.currency || "AUD"} {parseFloat(inv.amount || 0).toFixed(2)}
                            </div>

                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                {inv.invoiceDate
                                    ? new Date(inv.invoiceDate).toLocaleDateString("en-AU")
                                    : "-"}
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "#e0f2fe",
                                color: "#0369a1",
                            }}
                        >
                            {inv.invoiceStatus}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}