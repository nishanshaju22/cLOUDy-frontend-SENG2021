"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { clearAuth } from "../../lib/auth";

const NAV_ITEMS = [
    {
        id: "orders",
        label: "Orders",
        icon: <Icon.Orders />,
    },
];

export function Sidebar({ activeTab, onTabChange, onCreateOrder }) {
    const [collapsed, setCollapsed] = useState(false);
    const [expandedItem, setExpandedItem] = useState("orders");
    const router = useRouter();

    const toggleExpand = (id) => {
        setExpandedItem((prev) => (prev === id ? null : id));
    };

    const handleLogout = () => {
        clearAuth();
        router.push("/login");
    };

    return (
        <aside
            style={{
                width: collapsed ? 72 : 240,
                minHeight: "100vh",
                position: "sticky",
                top: 0,
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
                flexShrink: 0,
                background:
                    "linear-gradient(160deg, rgba(57,10,35,0.82) 0%, rgba(115,88,102,0.78) 100%)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                    "inset -1px 0 0 rgba(255,255,255,0.06), 4px 0 24px rgba(0,0,0,0.18)",
            }}
        >
            <button
                onClick={() => setCollapsed((c) => !c)}
                title={collapsed ? "Expand" : "Collapse"}
                style={{
                    position: "absolute",
                    top: 22,
                    right: collapsed ? "50%" : 14,
                    transform: collapsed ? "translateX(50%)" : "none",
                    transition: "right 0.25s, transform 0.25s",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 10,
                    flexShrink: 0,
                }}
            >
                {collapsed ? <Icon.ChevronRight /> : <Icon.ChevronLeft />}
            </button>

            <div style={{ height: 70, flexShrink: 0 }} />

            {!collapsed && (
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        padding: "0 20px",
                        marginBottom: 8,
                    }}
                >
                    Main
                </div>
            )}

            <nav
                style={{
                    flex: 1,
                    padding: collapsed ? "0 10px" : "0 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {NAV_ITEMS.map((item) => {
                    const isExpanded = expandedItem === item.id;
                    const isActive =
                        activeTab === item.id ||
                        item.children?.some((c) => c.id === activeTab);

                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => {
                                    if (collapsed) {
                                        setCollapsed(false);
                                        setExpandedItem(item.id);
                                    } else {
                                        toggleExpand(item.id);
                                        onTabChange(item.id);
                                    }
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 11,
                                    padding: collapsed ? "11px 0" : "10px 12px",
                                    justifyContent: collapsed
                                        ? "center"
                                        : "flex-start",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    background: isActive
                                        ? "rgba(255,255,255,0.12)"
                                        : "transparent",
                                    color: isActive
                                        ? "#fff"
                                        : "rgba(255,255,255,0.6)",
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    transition: "background 0.15s, color 0.15s",
                                    position: "relative",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background =
                                            "rgba(255,255,255,0.07)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background =
                                            "transparent";
                                    }
                                }}
                            >
                                <span
                                    style={{
                                        flexShrink: 0,
                                        display: "flex",
                                    }}
                                >
                                    {item.icon}
                                </span>

                                {!collapsed && (
                                    <>
                                        <span
                                            style={{
                                                flex: 1,
                                                textAlign: "left",
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            style={{
                                                display: "flex",
                                                transition: "transform 0.2s",
                                                transform: isExpanded
                                                    ? "rotate(0deg)"
                                                    : "rotate(-90deg)",
                                                opacity: 0.5,
                                            }}
                                        ></span>
                                    </>
                                )}
                            </button>

                            {!collapsed && isExpanded && item.children && (
                                <div
                                    style={{
                                        marginLeft: 18,
                                        paddingLeft: 16,
                                        borderLeft:
                                            "1px solid rgba(255,255,255,0.12)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        marginTop: 2,
                                        marginBottom: 4,
                                    }}
                                >
                                    {item.children.map((child) => {
                                        const childActive =
                                            activeTab === child.id;

                                        return (
                                            <button
                                                key={child.id}
                                                onClick={() =>
                                                    onTabChange(child.id)
                                                }
                                                style={{
                                                    background: childActive
                                                        ? "rgba(255,255,255,0.10)"
                                                        : "transparent",
                                                    border: "none",
                                                    borderRadius: 8,
                                                    padding: "8px 10px",
                                                    textAlign: "left",
                                                    fontSize: 13,
                                                    fontWeight: childActive
                                                        ? 600
                                                        : 400,
                                                    color: childActive
                                                        ? "#fff"
                                                        : "rgba(255,255,255,0.5)",
                                                    cursor: "pointer",
                                                    transition:
                                                        "background 0.12s, color 0.12s",
                                                    whiteSpace: "nowrap",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!childActive) {
                                                        e.currentTarget.style.background =
                                                            "rgba(255,255,255,0.07)";
                                                        e.currentTarget.style.color =
                                                            "rgba(255,255,255,0.8)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!childActive) {
                                                        e.currentTarget.style.background =
                                                            "transparent";
                                                        e.currentTarget.style.color =
                                                            "rgba(255,255,255,0.5)";
                                                    }
                                                }}
                                            >
                                                {child.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div
                style={{
                    padding: collapsed ? "16px 10px" : "16px 14px",
                    flexShrink: 0,
                }}
            >
                {!collapsed ? (
                    <>
                        <div
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 14,
                                padding: "16px 14px",
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#fff",
                                    marginBottom: 4,
                                }}
                            >
                                New Order
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "rgba(255,255,255,0.45)",
                                    marginBottom: 14,
                                    lineHeight: 1.4,
                                }}
                            >
                                Create a purchase order quickly
                            </div>
                            <button
                                onClick={onCreateOrder}
                                style={{
                                    width: "100%",
                                    padding: "10px 0",
                                    borderRadius: 10,
                                    border: "none",
                                    background:
                                        "linear-gradient(135deg, #e07b2a 0%, #c45e10 100%)",
                                    color: "#fff",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 7,
                                    boxShadow:
                                        "0 4px 14px rgba(200,90,20,0.35)",
                                    transition: "opacity 0.15s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.88")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                }
                            >
                                <Icon.Plus /> Create Order
                            </button>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                width: "100%",
                                padding: "10px 0",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.18)",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.88")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onCreateOrder}
                            title="Create Order"
                            style={{
                                width: "100%",
                                padding: "11px 0",
                                borderRadius: 10,
                                border: "none",
                                background:
                                    "linear-gradient(135deg, #e07b2a 0%, #c45e10 100%)",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow:
                                    "0 4px 14px rgba(200,90,20,0.35)",
                                transition: "opacity 0.15s",
                                marginBottom: 10,
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.88")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                        >
                            <Icon.Plus />
                        </button>

                        <button
                            onClick={handleLogout}
                            title="Logout"
                            style={{
                                width: "100%",
                                padding: "11px 0",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.18)",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.88")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                            }
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}