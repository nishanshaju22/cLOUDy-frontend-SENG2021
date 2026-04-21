"use client";

import { useState, useEffect, useCallback } from "react";
import { getInvoices, getInvoiceSummary, getInvoiceById, deleteInvoice, updateInvoice, getInvoicePdf } from "../../src/api/invoice";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../../src/components/ui/Sidebar";

const STATUS_COLORS = {
    DRAFT:  { bg: "#fefce8", color: "#854d0e", border: "#fde68a" },
    FINAL:  { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
    PAID:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    ISSUED: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
};
const STATUS_OPTIONS = ["DRAFT", "FINAL", "PAID", "ISSUED"];
function normalizeStatus(s) { return s ? s.toUpperCase() : "DRAFT"; }
function formatMoney(val) {
    if (val === undefined || val === null) return "—";
    return "$" + Number(val).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoicesPage() {
    const { theme } = useTheme();
    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [isManaging, setIsManaging] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(null);
    const { toasts, addToast } = useToast();

    const isProfessional   = theme === "professional";
    const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            const data = await getInvoices(params);
            setInvoices(data.data || []);
        } catch { addToast("Failed to load invoices", "error"); }
        finally { setLoading(false); }
    }, [statusFilter]);

    const fetchSummary = useCallback(async () => {
        try { const data = await getInvoiceSummary(); setSummary(data); } catch {}
    }, []);

    useEffect(() => { fetchInvoices(); fetchSummary(); }, [fetchInvoices, fetchSummary]);

    const handleRowClick = async (inv) => {
        setSelectedInvoice(inv); setDrawerLoading(true);
        try { const full = await getInvoiceById(inv.invoiceId); setSelectedInvoice(full); } catch {}
        finally { setDrawerLoading(false); }
    };

    const handleDelete = async (invoiceId) => {
        if (!confirm("Delete this invoice?")) return;
        setDeleting(invoiceId);
        try {
            await deleteInvoice(invoiceId); await fetchInvoices(); await fetchSummary();
            if (selectedInvoice?.invoiceId === invoiceId || selectedInvoice?.id === invoiceId) setSelectedInvoice(null);
            addToast("Invoice deleted", "success");
        } catch (err) { addToast(err?.errorMessage || "Failed to delete invoice", "error"); }
        finally { setDeleting(null); }
    };

    const handleStatusUpdate = async (invoiceId, status) => {
        try { await updateInvoice(invoiceId, { status: status.toLowerCase() }); await fetchInvoices(); addToast("Status updated", "success"); }
        catch (err) { addToast(err?.errorMessage || "Failed to update status", "error"); }
    };

    const handlePdf = async (invoiceId) => {
        setPdfLoading(invoiceId);
        try {
            const data = await getInvoicePdf(invoiceId);
            if (data) {
                const blob = new Blob([data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `invoice-${invoiceId}.pdf`; a.click();
                URL.revokeObjectURL(url); addToast("PDF downloaded", "success");
            }
        } catch { addToast("Failed to generate PDF", "error"); }
        finally { setPdfLoading(null); }
    };

    const filtered = invoices.filter(inv => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return inv.invoiceId?.toLowerCase().includes(q) || inv.description?.toLowerCase().includes(q) || inv.supplierName?.toLowerCase().includes(q) || inv.customerName?.toLowerCase().includes(q);
    });

    /* ── Shared nav ── */
    function Nav() {
        return (
            <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, gap: 20, background: "var(--nav-bg)", borderBottom: "1px solid var(--nav-border)", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Invoices</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--search-bg)", borderRadius: 30, padding: "0 14px", height: 38 }}>
                        <SearchIcon />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--search-text)", width: 180, fontFamily: "var(--font-sans)" }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 30, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setIsManaging(m => !m)} style={{ padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", background: isManaging ? "var(--btn-primary-bg)" : "var(--btn-ghost-bg)", color: isManaging ? "var(--btn-primary-text)" : "var(--btn-ghost-text)", border: `1px solid ${isManaging ? "var(--btn-primary-border)" : "var(--btn-ghost-border)"}` }}>
                        {isManaging ? "Done" : "Manage"}
                    </button>
                </div>
            </nav>
        );
    }

    /* ── Shared table content ── */
    function TableContent() {
        return (
            <>
                {summary && (
                    <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
                        <SummaryCard label="Total Invoices" value={summary.totalInvoices?.toLocaleString()} />
                        <SummaryCard label="Total Amount" value={formatMoney(summary.totalAmount)} />
                        <SummaryCard label="Average Amount" value={formatMoney(summary.averageInvoiceAmount)} />
                        {summary.statusBreakdown && Object.entries(summary.statusBreakdown).map(([k, v]) => <SummaryCard key={k} label={normalizeStatus(k)} value={v} />)}
                    </div>
                )}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                        {search ? `Results for "${search}"` : "All Invoices"}
                    </h1>
                    {!loading && <p style={{ fontSize: 13, color: hasAtmosphericBg ? "rgb(0 0 0)" : "var(--text-secondary)", margin: "6px 0 0" }}>{filtered.length} {filtered.length === 1 ? "invoice" : "invoices"}</p>}
                </div>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 300 }}>
                        <div style={{ color: "var(--border-strong)", marginBottom: 4 }}><EmptyIcon /></div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{search ? "No invoices match your search" : "No invoices yet"}</div>
                        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{search ? "Try a different search term" : "Invoices will appear here once orders are created"}</div>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr>
                                    {["Invoice ID", "Description", "Issue Date", "Status", "Amount", ""].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(inv => {
                                    const status = normalizeStatus(inv.status);
                                    const sc = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
                                    const invId = inv.invoiceId || inv.id;
                                    return (
                                        <tr key={invId} style={{ cursor: "pointer" }} onClick={() => handleRowClick(inv)}>
                                            <td style={td}><span style={{ fontWeight: 600 }}>{invId}</span></td>
                                            <td style={{ ...td, color: "var(--text-secondary)" }}>{inv.description || "—"}</td>
                                            <td style={td}>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("en-AU") : "—"}</td>
                                            <td style={td}>
                                                {isManaging ? (
                                                    <select value={status} onClick={e => e.stopPropagation()} onChange={e => handleStatusUpdate(invId, e.target.value)} style={{ display: "inline-block", fontSize: 11, fontWeight: 700, borderRadius: 4, padding: "3px 8px", cursor: "pointer", ...sc, border: `1px solid ${sc.border}` }}>
                                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.04em", ...sc }}>{status}</span>
                                                )}
                                            </td>
                                            <td style={td}>{formatMoney(inv.totalAmount)}</td>
                                            <td style={{ ...td, textAlign: "right" }} onClick={e => e.stopPropagation()}>
                                                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                    <button onClick={() => handlePdf(invId)} disabled={pdfLoading === invId} style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }} title="Download PDF">
                                                        {pdfLoading === invId ? <svg style={{ animation: "spin 0.7s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> : <PdfIcon />}
                                                    </button>
                                                    {isManaging && (
                                                        <button onClick={() => handleDelete(invId)} disabled={deleting === invId} style={{ padding: "5px 8px", borderRadius: 6, border: "none", background: "var(--error-bg)", color: "var(--error)", cursor: "pointer", display: "inline-flex", alignItems: "center" }} title="Delete">
                                                            {deleting === invId ? <svg style={{ animation: "spin 0.7s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> : <TrashIcon />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <Sidebar />
            {hasAtmosphericBg && <MistBackground />}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
                * { box-sizing: border-box; }
                body { margin: 0; background: transparent; font-family: var(--font-sans); }
                button:disabled { opacity: 0.6; cursor: not-allowed !important; }
                tr:hover td { background: var(--surface-raised) !important; }
            `}</style>

            {/* ── CLOUDY / STORMY — glass card ── */}
            {hasAtmosphericBg && (
                <div style={{ minHeight: "100vh", background: "transparent", fontFamily: "var(--font-sans)" }}>
                    <Nav />
                    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 1 }}>
                        <div
                            className="
                                relative w-full
                                max-w-400 mx-auto
                                rounded-3xl p-10
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
                            <div style={{ position: "relative" }}>
                                <TableContent />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PROFESSIONAL — flat card ── */}
            {isProfessional && (
                <div style={{ minHeight: "100vh", background: "var(--page-bg)", fontFamily: "var(--font-sans)" }}>
                    <Nav />
                    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
                        <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <TableContent />
                        </div>
                    </main>
                </div>
            )}

            {selectedInvoice && (
                <InvoiceDetailDrawer invoice={selectedInvoice} loading={drawerLoading} onClose={() => setSelectedInvoice(null)} onPdf={handlePdf} pdfLoading={pdfLoading} />
            )}
            <ToastContainer toasts={toasts} />
        </>
    );
}

function SummaryCard({ label, value }) {
    return (
        <div style={{ flex: "1 1 140px", background: "#f5f5f5", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</div>
        </div>
    );
}

function InvoiceDetailDrawer({ invoice, loading, onClose, onPdf, pdfLoading }) {
    const id = invoice.invoiceId || invoice.id;
    const status = (invoice.status || "").toUpperCase();
    const sc = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
    const xml = invoice.invoiceUBLXML || invoice.invoiceXML || invoice.orderDocumentXML;
    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200, backdropFilter: "blur(2px)" }} />
            <div style={{ position: "fixed", top: 0, right: 0, width: "min(520px, 100vw)", height: "100vh", background: "#ffffff", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", borderRadius: "20px 0 0 20px", fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>Invoice Detail</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => onPdf(id)} disabled={pdfLoading === id} style={{ padding: "7px 14px", borderRadius: 30, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                            {pdfLoading === id ? <><svg style={{ animation: "spin 0.7s linear infinite" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Generating…</> : <><PdfIcon /> Download PDF</>}
                        </button>
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, display: "flex" }}><CloseIcon /></button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 14, background: "#f5f5f5", borderRadius: 4, animation: "shimmer 1.4s infinite", width: i % 2 === 0 ? "60%" : "90%" }} />)
                    ) : (
                        <>
                            <div><span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, borderRadius: 4, padding: "4px 10px", letterSpacing: "0.04em", ...sc }}>{status}</span></div>
                            {[["Invoice ID", id], ["Issue Date", invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-AU") : "—"], ["Description", invoice.description || "—"], ["Supplier", invoice.supplierName || "—"], ["Customer", invoice.customerName || "—"], ["Currency", invoice.currency || "—"], ["Total Amount", invoice.totalAmount ? formatMoney(invoice.totalAmount) : "—"], ["Created At", invoice.createdAt ? new Date(invoice.createdAt).toLocaleString("en-AU") : "—"], ["Updated At", invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleString("en-AU") : "—"]].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
                                    <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{value}</span>
                                </div>
                            ))}
                            {xml && <div><div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Invoice XML</div><pre style={{ fontSize: 11, background: "#f5f5f5", borderRadius: 6, padding: 12, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "var(--text-secondary)", marginTop: 8, maxHeight: 300, overflowY: "auto" }}>{xml}</pre></div>}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function SkeletonRow() {
    return (
        <div style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            {[120, 200, 80, 70, 60].map((w, i) => <div key={i} style={{ height: 14, width: w, background: "#f5f5f5", borderRadius: 4, animation: "shimmer 1.4s infinite" }} />)}
        </div>
    );
}

const td = { padding: "14px 16px", borderBottom: "1px solid var(--border)", color: "var(--text-primary)", verticalAlign: "middle" };
const styles = {
    page: { minHeight: "100vh", background: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "rgba(255,255,255,0.96)", borderBottom: "1px solid #f0f0f0", backdropFilter: "blur(8px)", gap: 20 },
    navLeft: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
    logo: { fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" },
    navRight: { display: "flex", alignItems: "center", gap: 10 },
    searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", borderRadius: 30, padding: "0 14px", height: 38, color: "#999" },
    searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111", width: 180, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    select: { padding: "7px 12px", borderRadius: 30, border: "1px solid #e5e5e5", background: "#fff", fontSize: 13, fontWeight: 500, color: "#111", cursor: "pointer", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    navBtn: { padding: "7px 16px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", flexShrink: 0 },
    main: { maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" },
    summaryRow: { display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" },
    summaryCard: { flex: "1 1 140px", background: "#f9f9f9", borderRadius: 10, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 },
    summaryValue: { fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" },
    summaryLabel: { fontSize: 12, color: "#757575", fontWeight: 500 },
    pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 },
    pageTitle: { fontSize: 28, fontWeight: 700, color: "#111", margin: 0, letterSpacing: "-0.02em" },
    pageSubtitle: { fontSize: 13, color: "#757575", margin: "6px 0 0" },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#757575", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #f0f0f0" },
    tr: { cursor: "pointer" },
    td: { padding: "14px 16px", borderBottom: "1px solid #f5f5f5", color: "#111", verticalAlign: "middle" },
    invoiceId: { fontWeight: 600, fontSize: 13 },
    description: { color: "#757575" },
    statusBadge: { display: "inline-block", fontSize: 11, fontWeight: 700, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.04em" },
    pdfBtn: { padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e5e5", background: "#fff", color: "#111", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 },
    pdfBtnLarge: { padding: "7px 14px", borderRadius: 30, border: "1px solid #e5e5e5", background: "#fff", color: "#111", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    deleteBtn: { padding: "5px 8px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#be123c", cursor: "pointer", display: "inline-flex", alignItems: "center" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 360 },
    emptyIcon: { color: "#ddd", marginBottom: 4 },
    emptyText: { fontSize: 18, fontWeight: 600, color: "#111" },
    emptySub: { fontSize: 14, color: "#757575" },
    backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, backdropFilter: "none" },
    drawer: { position: "fixed", top: 0, right: 0, width: "min(520px, 100vw)", height: "100vh", background: "#fff", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", borderRadius: "20px 0px 0px 20px" },
    drawerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f0f0f0" },
    drawerTitle: { fontSize: 17, fontWeight: 600, color: "#111" },
    closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#757575", padding: 4, display: "flex" },
    drawerBody: { flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 },
    drawerRow: { display: "flex", flexDirection: "column", gap: 4 },
    drawerLabel: { fontSize: 11, fontWeight: 700, color: "#757575", letterSpacing: "0.05em", textTransform: "uppercase" },
    drawerValue: { fontSize: 14, color: "#111" },
    xmlBox: { fontSize: 11, background: "#f5f5f5", borderRadius: 6, padding: 12, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#555", marginTop: 8, maxHeight: 300, overflowY: "auto" },
};

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function EmptyIcon() { return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function CloseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function PdfIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>; }