"use client";

import { useState, useCallback } from "react";
import { BuyerIdBar } from "../../src/components/orders/BuyerIdBar";
import { OrdersList } from "../../src/components/orders/OrdersList";
import { CreateOrderModal } from "../../src/components/orders/CreateOrderModal";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { Sidebar } from "../../src/components/ui/Sidebar";
import { Toast } from "../../src/components/ui/ui";

import { getAuth } from "../../src/lib/auth";
import { useTheme } from "../context/ThemeContext";

export default function OrdersPage() {
    const router = useRouter();
    const { theme } = useTheme();

    const [auth, setAuth] = useState(null);
    const [buyerId, setBuyerId] = useState("");
    const [activeTab, setActiveTab] = useState("orders");
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    if (!auth) return null;

    const sellerId = auth.seller?.seller_id;

    const isProfessional = theme === "professional";
    const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

    return (
        <>
            {hasAtmosphericBg && <MistBackground />}

            <style>{`
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    font-family: var(--font-sans);
                    /*
                     * Keep body transparent so the MistBackground WebGL canvas
                     * shows through. Professional theme gets its bg from the
                     * outer layout div below.
                     */
                    background: transparent;
                }
                select:focus, input:focus {
                    outline: none;
                    border-color: rgba(148,163,184,0.4) !important;
                }
            `}</style>

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    /*
                     * Atmospheric themes: transparent so the canvas shows through.
                     * Professional: solid white from the CSS token.
                     */
                    background: hasAtmosphericBg ? "transparent" : "var(--page-bg)",
                    fontFamily: "var(--font-sans)",
                }}
            >
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onCreateOrder={() => setShowCreate(true)}
                />

                <main
                    style={{
                        flex: 1,
                        padding: "36px 40px",
                        position: "relative",
                        zIndex: 1,
                        marginLeft: "-1px",
                    }}
                >
                    <BuyerIdBar
                        buyerId={buyerId}
                        onChange={setBuyerId}
                        onClear={() => setBuyerId("")}
                        onToast={showToast}
                    />

                    {/* Heading */}
                    <div style={{ marginBottom: 28 }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 28,
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                color: "var(--text-primary)",
                            }}
                        >
                            My Orders
                        </h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 13,
                                color: hasAtmosphericBg
                                    ? "rgb(0 0 0)"
                                    : "var(--text-secondary)",
                            }}
                        >
                            Browse and manage all orders for this buyer.
                        </p>
                    </div>

                    {/* ── CLOUDY / STORMY GLASS GRID WRAPPER ── */}
                    {hasAtmosphericBg && (
                        <div
                            className="
                                relative w-full
                                max-w-400 mx-auto
                                rounded-3xl p-10
                                overflow-hidden
                                backdrop-blur-[20px]
                                border border-white/30 border-s-8
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
                            {/* Content */}
                            <div style={{ position: "relative" }}>
                                <OrdersList
                                    buyerId={buyerId}
                                    buyerEmail={buyerEmail}
                                    onToast={showToast}
                                    activeTab={activeTab}
                                />
                            </div>
                        </div>
                    )}

                    {isProfessional && (
                        <div
                            style={{
                                position: "relative",
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: 14,
                                padding: "28px 32px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                            }}
                        >
                            <OrdersList
                                buyerId={buyerId}
                                onToast={showToast}
                                activeTab={activeTab}
                            />
                        </div>
                    )}
                </main>
            </div>

            {showCreate && (
                <CreateOrderModal
                    buyerId={buyerId}
                    onClose={() => setShowCreate(false)}
                    onToast={showToast}
                />
            )}

            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </>
    );
}
