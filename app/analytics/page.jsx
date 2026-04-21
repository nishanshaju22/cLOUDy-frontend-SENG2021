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

  const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

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

  return (
    <>
      {hasAtmosphericBg && <MistBackground />}

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
        <nav
          style={{
            ...styles.nav,
            background: "var(--nav-bg)",
            borderBottom: "1px solid var(--nav-border)",
            position: "relative",
            zIndex: 20,
          }}
        >
          <div style={styles.navLeft}>
            <span style={{ ...styles.logo, color: "var(--text-primary)" }}>
              Analytics
            </span>
          </div>

          <div style={styles.navRight}>
            <div
              style={{
                ...styles.filterWrap,
                background: "var(--search-bg)",
              }}
            >
              <label
                htmlFor="range"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
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
                  color: "var(--search-text)",
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
                background: "var(--surface)",
                color: "var(--btn-ghost-text)",
                border: "1px solid var(--btn-ghost-border)",
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

        <main
          style={{
            ...styles.main,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={styles.pageHeader}>
            <div>
              <h1 style={{ ...styles.pageTitle, color: "var(--text-primary)" }}>
                Seller Analytics
              </h1>
              {!loading && (
                <p
                  style={{
                    ...styles.pageSubtitle,
                    color: "var(--text-secondary)",
                  }}
                >
                  Overview of orders, revenue, buyer activity and top products
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div style={styles.summaryGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : !analytics ? (
            <div style={styles.emptyState}>
              <div style={{ color: "var(--border-strong)", marginBottom: 4 }}>
                <ChartIcon />
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Analytics unavailable
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                Try refreshing the page after confirming seller data exists
              </div>
            </div>
          ) : (
            <>
              <div style={styles.summaryGrid}>
                <MetricCard title="Total Orders" value={summary.totalOrders} />
                <MetricCard
                  title="Total Revenue"
                  value={formatCurrency(summary.totalRevenue)}
                />
                <MetricCard
                  title="Average Order Value"
                  value={formatCurrency(summary.averageOrderValue)}
                />
                <MetricCard
                  title="Repeat Buyers"
                  value={summary.repeatBuyers}
                />
              </div>

              <div style={styles.insightGrid}>
                <MetricCard
                  title="Top Product"
                  value={derivedStats.topProductName}
                  small
                />
                <MetricCard
                  title="Top Buyer"
                  value={derivedStats.topBuyerName}
                  small
                />
                <MetricCard
                  title="Best Day Revenue"
                  value={formatCurrency(derivedStats.bestDayRevenue)}
                  small
                />
                <MetricCard
                  title="Average Orders / Day"
                  value={derivedStats.avgOrdersPerDay}
                  small
                />
              </div>

              <div style={styles.topGrid}>
                <Panel title="Revenue Over Time" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<RevenueTooltip />} />
                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill={BAR_GRADIENT_B} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Order Status Breakdown" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.chartBox}>
                    {statusChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<StatusTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No status data available" />
                    )}
                  </div>
                </Panel>
              </div>

              <div style={styles.bottomGrid}>
                <Panel title="Orders Trend" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<OrdersTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke={BAR_GRADIENT_A}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="Top Products by Revenue" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.chartBox}>
                    {topProductsChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topProductsChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            stroke="rgba(148,163,184,0.18)"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                          />
                          <Tooltip content={<TopProductTooltip />} />
                          <Bar dataKey="revenue" radius={[0, 8, 8, 0]} fill={BAR_GRADIENT_B} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No product data available" />
                    )}
                  </div>
                </Panel>
              </div>

              <div style={styles.bottomGrid}>
                <Panel title="Top Buyers by Spend" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.chartBox}>
                    {topBuyersChartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topBuyersChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid
                            stroke="rgba(148,163,184,0.18)"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                          />
                          <Tooltip content={<TopBuyerTooltip />} />
                          <Bar dataKey="spend" radius={[0, 8, 8, 0]} fill={GREEN_BAR} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyMiniState text="No buyer data available" />
                    )}
                  </div>
                </Panel>

                <Panel title="Quick Breakdown" hasAtmosphericBg={hasAtmosphericBg}>
                  <div style={styles.quickTableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Metric</th>
                          <th style={styles.th}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={styles.tdPrimary}>Top Product Revenue</td>
                          <td style={styles.td}>
                            {formatCurrency(derivedStats.topProductRevenue)}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tdPrimary}>Top Buyer Spend</td>
                          <td style={styles.td}>
                            {formatCurrency(derivedStats.topBuyerSpend)}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tdPrimary}>Revenue Days Count</td>
                          <td style={styles.td}>{derivedStats.revenueDaysCount}</td>
                        </tr>
                        <tr>
                          <td style={styles.tdPrimary}>Statuses Tracked</td>
                          <td style={styles.td}>{statusChartData.length}</td>
                        </tr>
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

function Panel({ title, children, hasAtmosphericBg }) {
  if (hasAtmosphericBg) {
    return (
      <div
        className="
          relative w-full
          rounded-3xl p-5
          overflow-hidden
          backdrop-blur-[20px]
          border border-white/30
          shadow-[0_16px_70px_rgba(0,0,0,0.12)]
          bg-[linear-gradient(to_bottom_right,rgba(250,255,253,0.6),rgba(250,255,253,0.6))]
        "
      >
        <div
          className="
            pointer-events-none absolute inset-0
            rounded-3xl
            bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),rgba(255,255,255,0.06))]
            opacity-60
          "
        />
        <div
          className="
            pointer-events-none absolute inset-0
            rounded-3xl
            bg-white/20 blur-2xl opacity-40
          "
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={styles.panelTitle}>{title}</h3>
          {children}
        </div>
      </div>
    );
  }

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

function MetricCard({ title, value, small = false }) {
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
      <div
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
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

function EmptyMiniState({ text }) {
  return (
    <div style={styles.emptyMiniState}>
      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{text}</p>
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.title}>{label}</div>
      <div style={tooltipStyles.row}>Revenue: {formatCurrency(payload[0].value)}</div>
    </div>
  );
}

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.title}>{label}</div>
      <div style={tooltipStyles.row}>Orders: {payload[0].value}</div>
    </div>
  );
}

function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.title}>{payload[0].name}</div>
      <div style={tooltipStyles.row}>Count: {payload[0].value}</div>
    </div>
  );
}

function TopProductTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.title}>{d.fullName}</div>
      <div style={tooltipStyles.row}>Revenue: {formatCurrency(d.revenue)}</div>
      <div style={tooltipStyles.row}>Quantity: {d.quantity}</div>
    </div>
  );
}

function TopBuyerTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.title}>{d.fullName}</div>
      <div style={tooltipStyles.row}>Spend: {formatCurrency(d.spend)}</div>
      <div style={tooltipStyles.row}>Orders: {d.orders}</div>
    </div>
  );
}

function SkeletonCard() {
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

function buildSummary(analytics, filteredOrdersByDate) {
  const fallback = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    repeatBuyers: 0,
  };

  if (!analytics) return fallback;

  if (!filteredOrdersByDate.length) {
    return analytics.summary || fallback;
  }

  const totalOrders = filteredOrdersByDate.reduce(
    (sum, item) => sum + Number(item.orders || 0),
    0
  );
  const totalRevenue = filteredOrdersByDate.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  );

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

  const totalOrders = filteredOrdersByDate.reduce(
    (sum, item) => sum + Number(item.orders || 0),
    0
  );

  return {
    topProductName: topProduct?.itemName || "—",
    topBuyerName: topBuyer?.buyerName || "—",
    topProductRevenue: Number(topProduct?.totalRevenue || 0),
    topBuyerSpend: Number(topBuyer?.totalSpend || 0),
    bestDayRevenue,
    revenueDaysCount: filteredOrdersByDate.length,
    avgOrdersPerDay:
      filteredOrdersByDate.length > 0
        ? (totalOrders / filteredOrdersByDate.length).toFixed(1)
        : "0.0",
  };
}

function filterOrdersByDate(data, range) {
  if (range === "all") return data;

  const days = Number(range);
  if (!days) return data;

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days);

  return data.filter((item) => {
    if (!item.date) return false;
    return new Date(item.date) >= cutoff;
  });
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return `$${num.toFixed(2)}`;
}

function shortDate(dateStr) {
  if (!dateStr) return "—";
  return dateStr;
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

const tooltipStyles = {
  box: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 12,
    padding: "10px 12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 6,
  },
  row: {
    fontSize: 12,
    color: "#475569",
  },
};

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
    backdropFilter: "blur(8px)",
    gap: 20,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  filterWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 30,
    padding: "0 14px",
    height: 44,
  },
  select: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    cursor: "pointer",
  },
  refreshBtn: {
    padding: "10px 20px",
    borderRadius: 30,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  main: {
    maxWidth: 1500,
    margin: "0 auto",
    padding: "48px 40px 80px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: 13,
    margin: "6px 0 0",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 24,
    marginBottom: 24,
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 24,
    marginBottom: 24,
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.85fr",
    gap: 28,
    marginBottom: 28,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 28,
    marginBottom: 28,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },
  chartBox: {
    width: "100%",
    height: 300,
  },
  quickTableWrap: {
    overflowX: "auto",
    minHeight: 300,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    color: "var(--text-secondary)",
    fontWeight: 700,
    borderBottom: "1px solid var(--border)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "12px",
    fontSize: 14,
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--border)",
  },
  tdPrimary: {
    padding: "12px",
    fontSize: 14,
    color: "var(--text-primary)",
    fontWeight: 600,
    borderBottom: "1px solid var(--border)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 360,
  },
  emptyMiniState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
};