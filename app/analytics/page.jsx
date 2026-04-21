"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { getSellerAnalyticsDashboard } from "../../src/api/order";
import { ToastContainer, useToast } from "../../src/components/ui/Toast";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { NightSkyBackground } from "../../src/components/ui/NightSkyBackground";
import { getAuth } from "../../src/lib/auth";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../../src/components/ui/Sidebar";
import { useRequireAuth } from "../../src/hooks/useRequireAuth";

const parsed = getAuth();
const SELLER_ID = parsed?.seller?.seller_id || parsed?.user?.seller_id;

const PIE_COLORS = ["#4ade80", "#60a5fa", "#f59e0b", "#f472b6", "#a78bfa", "#34d399"];
const BAR_GRADIENT_A = "#5b8def";
const BAR_GRADIENT_B = "#7c5cff";
const GREEN_BAR = "#34c759";

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { sellerId: currentSellerId, checkingAuth } = useRequireAuth();
  const { toasts, addToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");

  const isProfessional = theme === "professional";
  const hasMistBg = theme === "cloudy";
  const hasNightSkyBg = theme === "nightsky";
  const hasAtmosphericBg = hasMistBg || hasNightSkyBg;

  const fetchAnalytics = useCallback(async () => {
    if (!currentSellerId) {
      addToast("Seller not found. Please log in again.", "error");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getSellerAnalyticsDashboard(currentSellerId);
      setAnalytics(data);
    } catch (err) {
      addToast(
        err?.error || err?.response?.data?.error || "Failed to load analytics",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [currentSellerId, addToast]);

  useEffect(() => {
    if (checkingAuth) return;
    fetchAnalytics();
  }, [checkingAuth, fetchAnalytics]);

  if (checkingAuth || !currentSellerId) return null;

  const ordersByDate = analytics?.ordersByDate || [];
  const filteredOrdersByDate = filterOrdersByDate(ordersByDate, range);
  const summary = buildSummary(analytics, filteredOrdersByDate);

  const revenueChartData = filteredOrdersByDate.map((item) => ({
    date: shortDate(item.date),
    revenue: Number(item.revenue || 0),
    orders: Number(item.orders || 0),
    fullDate: item.date,
  }));

  const statusChartData = (analytics?.statusBreakdown || []).map((item) => ({
    name: item.status,
    value: Number(item.count || 0),
  }));

  const topProductsChartData = (analytics?.topProducts || []).map((item) => ({
    name: truncateLabel(item.itemName, 18),
    fullName: item.itemName,
    revenue: Number(item.totalRevenue || 0),
    quantity: Number(item.totalQuantity || 0),
  }));

  const topBuyersChartData = (analytics?.topBuyers || []).map((item) => ({
    name: truncateLabel(item.buyerName, 18),
    fullName: item.buyerName,
    spend: Number(item.totalSpend || 0),
    orders: Number(item.totalOrders || 0),
  }));

  const derivedStats = buildDerivedStats(analytics, filteredOrdersByDate);

  // Dynamic text colors per theme
  const titleColor = hasNightSkyBg
    ? "rgb(240 245 255)"
    : hasMistBg
    ? "rgb(10 30 20)"
    : "var(--text-primary)";

  const subtitleColor = hasNightSkyBg
    ? "rgb(180 200 255)"
    : hasMistBg
    ? "rgb(0 0 0)"
    : "var(--text-secondary)";

  return (
    <>
      {hasMistBg && <MistBackground />}

      {hasNightSkyBg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <NightSkyBackground
            cloudIntensity={1}
            starDensity="full"
            showTopo={true}
            showRings={true}
            vignetteStrength={0.52}
          />
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: transparent;
          font-family: var(--font-sans);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed !important;
        }
        select:focus, input:focus {
          outline: none;
          border-color: var(--border-strong) !important;
        }

        /* ── Night Sky glass overrides ── */
        .nightsky-glass input,
        .nightsky-glass select,
        .nightsky-glass label,
        .nightsky-glass p,
        .nightsky-glass option {
          color: rgb(220, 230, 255) !important;
        }
        .nightsky-glass input,
        .nightsky-glass select {
          background: rgba(20, 25, 60, 0.55) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
        }
        .nightsky-glass input::placeholder {
          color: rgba(180, 200, 255, 0.5) !important;
        }
        .nightsky-glass select,
        .nightsky-glass select * {
          color: rgb(220, 230, 255) !important;
          -webkit-text-fill-color: rgb(220, 230, 255) !important;
        }
      `}</style>

      <Sidebar />

      <div
        style={{
          minHeight: "100vh",
          background: hasAtmosphericBg ? "transparent" : "var(--page-bg)",
          fontFamily: "var(--font-sans)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Nav ── */}
        <nav
          style={{
            ...styles.nav,
            background: hasNightSkyBg
              ? "rgba(8, 10, 30, 0.65)"
              : hasMistBg
              ? "rgba(240, 250, 245, 0.6)"
              : "var(--nav-bg)",
            borderBottom: hasNightSkyBg
              ? "1px solid rgba(255,255,255,0.08)"
              : hasMistBg
              ? "1px solid rgba(255,255,255,0.35)"
              : "1px solid var(--nav-border)",
            backdropFilter: hasAtmosphericBg ? "blur(16px)" : undefined,
            WebkitBackdropFilter: hasAtmosphericBg ? "blur(16px)" : undefined,
            position: "relative",
            zIndex: 20,
          }}
        >
          <div style={styles.navLeft}>
            <span
              style={{
                ...styles.logo,
                color: hasNightSkyBg
                  ? "rgb(220 235 255)"
                  : hasMistBg
                  ? "rgb(10 30 20)"
                  : "var(--text-primary)",
              }}
            >
              Analytics
            </span>
          </div>

          <div style={styles.navRight}>
            <div
              style={{
                ...styles.filterWrap,
                background: hasNightSkyBg
                  ? "rgba(20, 25, 60, 0.55)"
                  : hasMistBg
                  ? "rgba(255,255,255,0.4)"
                  : "var(--search-bg)",
                border: hasAtmosphericBg
                  ? `1px solid ${hasNightSkyBg ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)"}`
                  : undefined,
              }}
            >
              <label
                htmlFor="range"
                style={{
                  fontSize: 13,
                  color: hasNightSkyBg
                    ? "rgb(180 200 255)"
                    : hasMistBg
                    ? "rgb(0 0 0)"
                    : "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                Range
              </label>
              <select
                id="range"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                style={{
                  ...styles.select,
                  color: hasNightSkyBg
                    ? "rgb(220 230 255)"
                    : hasMistBg
                    ? "rgb(10 30 20)"
                    : "var(--search-text)",
                  background: "transparent",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <option value="all">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <button
              onClick={fetchAnalytics}
              style={{
                ...styles.refreshBtn,
                background: hasNightSkyBg
                  ? "rgba(60, 80, 180, 0.45)"
                  : hasMistBg
                  ? "rgba(255,255,255,0.5)"
                  : "var(--surface)",
                color: hasNightSkyBg
                  ? "rgb(200 220 255)"
                  : hasMistBg
                  ? "rgb(10 30 20)"
                  : "var(--btn-ghost-text)",
                border: hasNightSkyBg
                  ? "1px solid rgba(255,255,255,0.15)"
                  : hasMistBg
                  ? "1px solid rgba(255,255,255,0.4)"
                  : "1px solid var(--btn-ghost-border)",
                backdropFilter: hasAtmosphericBg ? "blur(8px)" : undefined,
                fontFamily: "var(--font-sans)",
                position: "relative",
                zIndex: 999,
                pointerEvents: "auto",
              }}
            >
              Refresh
            </button>
          </div>
        </nav>

        {/* ── Main ── */}
        <main
          style={{
            ...styles.main,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={styles.pageHeader}>
            <div>
              <h1 style={{ ...styles.pageTitle, color: titleColor }}>
                Seller Analytics
              </h1>
              {!loading && (
                <p style={{ ...styles.pageSubtitle, color: subtitleColor }}>
                  Overview of orders, revenue, buyer activity and top products
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div style={styles.summaryGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} hasAtmosphericBg={hasAtmosphericBg} hasNightSkyBg={hasNightSkyBg} />
              ))}
            </div>
          ) : !analytics ? (
            <div style={styles.emptyState}>
              <div style={{ color: "var(--border-strong)", marginBottom: 4 }}>
                <ChartIcon />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: titleColor }}>
                Analytics unavailable
              </div>
              <div style={{ fontSize: 14, color: subtitleColor }}>
                Try refreshing the page after confirming seller data exists
              </div>
            </div>
          ) : (
            <>
              <div style={styles.summaryGrid}>
                <MetricCard title="Total Orders" value={summary.totalOrders} theme={theme} />
                <MetricCard title="Total Revenue" value={formatCurrency(summary.totalRevenue)} theme={theme} />
                <MetricCard title="Average Order Value" value={formatCurrency(summary.averageOrderValue)} theme={theme} />
                <MetricCard title="Repeat Buyers" value={summary.repeatBuyers} theme={theme} />
              </div>

              <div style={styles.insightGrid}>
                <MetricCard title="Top Product" value={derivedStats.topProductName} small theme={theme} />
                <MetricCard title="Top Buyer" value={derivedStats.topBuyerName} small theme={theme} />
                <MetricCard title="Best Day Revenue" value={formatCurrency(derivedStats.bestDayRevenue)} small theme={theme} />
                <MetricCard title="Average Orders / Day" value={derivedStats.avgOrdersPerDay} small theme={theme} />
              </div>

              <div style={styles.topGrid}>
                <Panel title="Revenue Over Time" theme={theme}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<RevenueTooltip theme={theme} />} />
                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill={BAR_GRADIENT_B} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Order Status Breakdown" theme={theme}>
                  <div style={styles.chartBox}>
                    {statusChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name">
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<StatusTooltip theme={theme} />} />
                          <Legend
                            formatter={(value) => (
                              <span style={{ color: hasNightSkyBg ? "rgb(200 220 255)" : hasMistBg ? "rgb(10 30 20)" : "var(--text-secondary)", fontSize: 12 }}>
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No status data available" theme={theme} />
                    )}
                  </div>
                </Panel>
              </div>

              <div style={styles.bottomGrid}>
                <Panel title="Orders Trend" theme={theme}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<OrdersTooltip theme={theme} />} />
                        <Line type="monotone" dataKey="orders" stroke={BAR_GRADIENT_A} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Top Products by Revenue" theme={theme}>
                  <div style={styles.chartBox}>
                    {topProductsChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                          <CartesianGrid stroke="rgba(148,163,184,0.18)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <YAxis type="category" dataKey="name" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip content={<TopProductTooltip theme={theme} />} />
                          <Bar dataKey="revenue" radius={[0, 8, 8, 0]} fill={BAR_GRADIENT_B} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No product data available" theme={theme} />
                    )}
                  </div>
                </Panel>
              </div>

              <div style={styles.bottomGrid}>
                <Panel title="Top Buyers by Spend" theme={theme}>
                  <div style={styles.chartBox}>
                    {topBuyersChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topBuyersChartData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                          <CartesianGrid stroke="rgba(148,163,184,0.18)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                          <YAxis type="category" dataKey="name" tick={{ fill: hasNightSkyBg ? "rgb(160,185,230)" : "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                          <Tooltip content={<TopBuyerTooltip theme={theme} />} />
                          <Bar dataKey="spend" radius={[0, 8, 8, 0]} fill={GREEN_BAR} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No buyer data available" theme={theme} />
                    )}
                  </div>
                </Panel>

                <Panel title="Quick Breakdown" theme={theme}>
                  <div style={styles.quickTableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, color: hasNightSkyBg ? "rgb(140 170 230)" : hasMistBg ? "rgb(30 60 40)" : "var(--text-secondary)", borderBottomColor: hasNightSkyBg ? "rgba(255,255,255,0.1)" : hasMistBg ? "rgba(0,0,0,0.12)" : "var(--border)" }}>Metric</th>
                          <th style={{ ...styles.th, color: hasNightSkyBg ? "rgb(140 170 230)" : hasMistBg ? "rgb(30 60 40)" : "var(--text-secondary)", borderBottomColor: hasNightSkyBg ? "rgba(255,255,255,0.1)" : hasMistBg ? "rgba(0,0,0,0.12)" : "var(--border)" }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Top Product Revenue", formatCurrency(derivedStats.topProductRevenue)],
                          ["Top Buyer Spend", formatCurrency(derivedStats.topBuyerSpend)],
                          ["Revenue Days Count", derivedStats.revenueDaysCount],
                          ["Statuses Tracked", statusChartData.length],
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td style={{ ...styles.tdPrimary, color: hasNightSkyBg ? "rgb(210 225 255)" : hasMistBg ? "rgb(10 40 20)" : "var(--text-primary)", borderBottomColor: hasNightSkyBg ? "rgba(255,255,255,0.08)" : hasMistBg ? "rgba(0,0,0,0.1)" : "var(--border)" }}>{label}</td>
                            <td style={{ ...styles.td, color: hasNightSkyBg ? "rgb(160 190 240)" : hasMistBg ? "rgb(30 60 40)" : "var(--text-secondary)", borderBottomColor: hasNightSkyBg ? "rgba(255,255,255,0.08)" : hasMistBg ? "rgba(0,0,0,0.1)" : "var(--border)" }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>
            </>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────

function Panel({ title, children, theme }) {
  const hasMistBg = theme === "cloudy";
  const hasNightSkyBg = theme === "nightsky";
  const hasAtmosphericBg = hasMistBg || hasNightSkyBg;

  const titleColor = hasNightSkyBg
    ? "rgb(220 235 255)"
    : hasMistBg
    ? "rgb(10 30 20)"
    : "var(--text-primary)";

  if (hasAtmosphericBg) {
    return (
      <div
        className={hasNightSkyBg ? "nightsky-glass" : ""}
        style={{
          position: "relative",
          width: "100%",
          borderRadius: 24,
          padding: 20,
          overflow: "hidden",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: hasNightSkyBg
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(255,255,255,0.45)",
          boxShadow: hasNightSkyBg
            ? "0 20px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 16px 70px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
          background: hasNightSkyBg
            ? "linear-gradient(135deg, rgba(20,25,60,0.62) 0%, rgba(10,12,40,0.58) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(240,250,248,0.50) 100%)",
        }}
      >
        {/* Frosted highlight stripe */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            background: hasNightSkyBg
              ? "linear-gradient(to bottom, rgba(100,140,255,0.08), rgba(0,0,0,0))"
              : "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
            opacity: 0.7,
          }}
        />
        {/* Frost diffusion blob */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            background: hasNightSkyBg
              ? "rgba(30,40,100,0.18)"
              : "rgba(255,255,255,0.22)",
            filter: "blur(18px)",
            opacity: 0.5,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={{ ...styles.panelTitle, color: titleColor }}>{title}</h3>
          {children}
        </div>
      </div>
    );
  }

  // Professional
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={styles.panelTitle}>{title}</h3>
      {children}
    </div>
  );
}

// ── MetricCard ─────────────────────────────────────────────────────────────────

function MetricCard({ title, value, small = false, theme }) {
  const hasMistBg = theme === "cloudy";
  const hasNightSkyBg = theme === "nightsky";
  const hasAtmosphericBg = hasMistBg || hasNightSkyBg;

  const titleColor = hasNightSkyBg
    ? "rgb(160 190 240)"
    : hasMistBg
    ? "rgb(30 70 50)"
    : "var(--text-secondary)";

  const valueColor = hasNightSkyBg
    ? "rgb(220 235 255)"
    : hasMistBg
    ? "rgb(10 30 20)"
    : "var(--text-primary)";

  if (hasAtmosphericBg) {
    return (
      <div
        style={{
          position: "relative",
          borderRadius: 20,
          padding: small ? 18 : 20,
          overflow: "hidden",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: hasNightSkyBg
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(255,255,255,0.45)",
          boxShadow: hasNightSkyBg
            ? "0 12px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
          background: hasNightSkyBg
            ? "linear-gradient(135deg, rgba(20,25,60,0.62) 0%, rgba(10,12,40,0.58) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(240,250,248,0.50) 100%)",
        }}
      >
        {/* Frosted highlight */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "55%",
            borderRadius: "20px 20px 0 0",
            background: hasNightSkyBg
              ? "linear-gradient(to bottom, rgba(100,140,255,0.07), rgba(0,0,0,0))"
              : "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: titleColor, marginBottom: 8, fontWeight: 600 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: small ? 22 : 28,
              fontWeight: 700,
              color: valueColor,
              letterSpacing: "-0.02em",
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    );
  }

  // Professional
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: small ? 18 : 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: small ? 22 : 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Misc helpers ───────────────────────────────────────────────────────────────

function EmptyMiniState({ text, theme }) {
  const hasNightSkyBg = theme === "nightsky";
  const hasMistBg = theme === "cloudy";
  return (
    <div style={styles.emptyMiniState}>
      <p style={{
        margin: 0,
        fontSize: 14,
        color: hasNightSkyBg ? "rgb(160 190 240)" : hasMistBg ? "rgb(30 60 40)" : "var(--text-secondary)",
      }}>
        {text}
      </p>
    </div>
  );
}

function tooltipBox(theme) {
  const hasNightSkyBg = theme === "nightsky";
  return {
    background: hasNightSkyBg ? "rgba(15,18,50,0.92)" : "rgba(255,255,255,0.96)",
    border: hasNightSkyBg ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(148,163,184,0.25)",
    borderRadius: 12,
    padding: "10px 12px",
    boxShadow: hasNightSkyBg ? "0 10px 40px rgba(0,0,0,0.6)" : "0 10px 30px rgba(0,0,0,0.08)",
    backdropFilter: "blur(12px)",
  };
}
function tooltipTitle(theme) {
  return { fontSize: 13, fontWeight: 700, color: theme === "nightsky" ? "rgb(210 230 255)" : "#1e293b", marginBottom: 6 };
}
function tooltipRow(theme) {
  return { fontSize: 12, color: theme === "nightsky" ? "rgb(160 190 240)" : "#475569" };
}

function RevenueTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBox(theme)}>
      <div style={tooltipTitle(theme)}>{label}</div>
      <div style={tooltipRow(theme)}>Revenue: {formatCurrency(payload[0].value)}</div>
    </div>
  );
}

function OrdersTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBox(theme)}>
      <div style={tooltipTitle(theme)}>{label}</div>
      <div style={tooltipRow(theme)}>Orders: {payload[0].value}</div>
    </div>
  );
}

function StatusTooltip({ active, payload, theme }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipBox(theme)}>
      <div style={tooltipTitle(theme)}>{payload[0].name}</div>
      <div style={tooltipRow(theme)}>Count: {payload[0].value}</div>
    </div>
  );
}

function TopProductTooltip({ active, payload, theme }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox(theme)}>
      <div style={tooltipTitle(theme)}>{d.fullName}</div>
      <div style={tooltipRow(theme)}>Revenue: {formatCurrency(d.revenue)}</div>
      <div style={tooltipRow(theme)}>Quantity: {d.quantity}</div>
    </div>
  );
}

function TopBuyerTooltip({ active, payload, theme }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipBox(theme)}>
      <div style={tooltipTitle(theme)}>{d.fullName}</div>
      <div style={tooltipRow(theme)}>Spend: {formatCurrency(d.spend)}</div>
      <div style={tooltipRow(theme)}>Orders: {d.orders}</div>
    </div>
  );
}

function SkeletonCard({ hasAtmosphericBg, hasNightSkyBg }) {
  if (hasAtmosphericBg) {
    return (
      <div
        style={{
          height: 120,
          borderRadius: 20,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: hasNightSkyBg
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.4)",
          background: hasNightSkyBg
            ? "linear-gradient(90deg, rgba(20,25,60,0.5) 25%, rgba(40,50,100,0.45) 50%, rgba(20,25,60,0.5) 75%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.45) 25%, rgba(220,240,235,0.5) 50%, rgba(255,255,255,0.45) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
    );
  }
  return (
    <div
      style={{
        height: 120,
        borderRadius: 16,
        background:
          "linear-gradient(90deg, var(--surface-raised) 25%, var(--border) 50%, var(--surface-raised) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

// ── Data helpers (unchanged) ───────────────────────────────────────────────────

function buildSummary(analytics, filteredOrdersByDate) {
  const fallback = { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, repeatBuyers: 0 };
  if (!analytics) return fallback;
  if (!filteredOrdersByDate.length) return analytics.summary || fallback;

  const totalOrders = filteredOrdersByDate.reduce((s, i) => s + Number(i.orders || 0), 0);
  const totalRevenue = filteredOrdersByDate.reduce((s, i) => s + Number(i.revenue || 0), 0);
  return {
    totalOrders,
    totalRevenue,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    repeatBuyers: analytics.summary?.repeatBuyers || 0,
  };
}

function buildDerivedStats(analytics, filteredOrdersByDate) {
  const topProduct = analytics?.topProducts?.[0];
  const topBuyer = analytics?.topBuyers?.[0];
  const bestDayRevenue = filteredOrdersByDate.length
    ? Math.max(...filteredOrdersByDate.map((d) => Number(d.revenue || 0)))
    : 0;
  const totalOrders = filteredOrdersByDate.reduce((s, i) => s + Number(i.orders || 0), 0);
  return {
    topProductName: topProduct?.itemName || "—",
    topBuyerName: topBuyer?.buyerName || "—",
    topProductRevenue: Number(topProduct?.totalRevenue || 0),
    topBuyerSpend: Number(topBuyer?.totalSpend || 0),
    bestDayRevenue,
    revenueDaysCount: filteredOrdersByDate.length,
    avgOrdersPerDay: filteredOrdersByDate.length > 0
      ? (totalOrders / filteredOrdersByDate.length).toFixed(1)
      : "0.0",
  };
}

function filterOrdersByDate(data, range) {
  if (range === "all") return data;
  const days = Number(range);
  if (!days) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter((item) => item.date && new Date(item.date) >= cutoff);
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function shortDate(dateStr) {
  return dateStr || "—";
}

function truncateLabel(text, max = 18) {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function ChartIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-7" />
    </svg>
  );
}

// ── Styles (layout only — no colors hardcoded) ────────────────────────────────

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: 68,
    gap: 20,
  },
  navLeft: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  logo: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: 10 },
  filterWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 30,
    padding: "0 14px",
    height: 44,
  },
  select: { border: "none", background: "transparent", outline: "none", fontSize: 13, cursor: "pointer" },
  refreshBtn: {
    padding: "10px 20px",
    borderRadius: 30,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  main: { maxWidth: 1500, margin: "0 auto", padding: "48px 40px 80px" },
  pageHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
  pageSubtitle: { fontSize: 13, margin: "6px 0 0" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 24, marginBottom: 24 },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 24, marginBottom: 24 },
  topGrid: { display: "grid", gridTemplateColumns: "1.3fr 0.85fr", gap: 28, marginBottom: 28 },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 },
  panelTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em" },
  chartBox: { width: "100%", height: 300 },
  quickTableWrap: { overflowX: "auto", minHeight: 300 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700, borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.04em" },
  td: { padding: "12px", fontSize: 14, borderBottom: "1px solid var(--border)" },
  tdPrimary: { padding: "12px", fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 360 },
  emptyMiniState: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160 },
};