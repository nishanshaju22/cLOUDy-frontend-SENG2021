"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { BuyerIdBar } from "../../src/components/orders/BuyerIdBar";
import { OrdersList } from "../../src/components/orders/OrdersList";
import { CreateOrderModal } from "../../src/components/orders/CreateOrderModal";
import { Toast } from "../../src/components/ui/ui";

import { getAuth } from "../../src/lib/auth";
import Sidebar from "../../src/components/ui/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { NightSkyBackground } from "../../src/components/ui/NightSkyBackground";

export default function OrdersPage() {
    const router = useRouter();
    const { theme } = useTheme();

    const [auth, setAuth] = useState(null);
    const [buyerId, setBuyerId] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [activeTab, setActiveTab] = useState("orders");
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);

    // Auth check
    useEffect(() => {
        const stored = getAuth();

        if (!stored?.user || !stored?.seller) {
            router.replace("/login");
            return;
        }

        setAuth(stored);
    }, [router]);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    if (!auth) return null;

    const sellerId = auth.seller?.seller_id;

    const isProfessional = theme === "professional";
    const hasMistBg = theme === "cloudy";
    const hasNightSkyBg = theme === "nightsky";
    const hasAtmosphericBg = hasMistBg || hasNightSkyBg;

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
                @keyframes slideUp {
                    from { transform: translateY(12px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to   { transform: translateX(0);    }
                }
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
                    border-color: var(--border-strong) !important;
                }
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
                <Sidebar/>

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
                        onChange={(id, email) => {
                            setBuyerId(id);
                            setBuyerEmail(email);
                        }}
                        onClear={() => {
                            setBuyerId("");
                            setBuyerEmail("");
                        }}
                        onToast={showToast}
                        sellerId={sellerId}
                    />

                    {/* Heading */}
                    <div style={{ marginBottom: 28 }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 28,
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                color: hasNightSkyBg
                                    ? "rgb(240 245 255)"
                                    : "var(--text-primary)",
                            }}
                        >
                            My Orders
                        </h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 13,
                                color: hasMistBg
                                    ? "rgb(0 0 0)"
                                    : hasNightSkyBg
                                        ? "rgb(180 200 255)"
                                        : "var(--text-secondary)",
                            }}
                        >
                            Browse and manage all orders for this buyer.
                        </p>
                    </div>

                    {/* ── CLOUDY / STORMY GLASS GRID WRAPPER ── */}
                    {hasAtmosphericBg && (
                        <div
                            className={`
                                ${hasNightSkyBg ? "nightsky-glass" : ""}
                                relative w-full
                                max-w-400 mx-auto
                                rounded-3xl p-10
                                overflow-hidden
                                backdrop-blur-[20px]
                                border border-s-8
                                ${hasNightSkyBg ? "border-white/10" : "border-white/30"}
                                ${hasNightSkyBg 
                                    ? "bg-[linear-gradient(to_bottom_right,rgba(20,25,60,0.55),rgba(10,12,35,0.55))]"
                                    : "bg-[linear-gradient(to_bottom_right,rgba(250,255,253,0.6),rgba(250,255,253,0.6))]"
                                }
                                ${hasNightSkyBg
                                    ? "shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                                    : "shadow-[0_16px_70px_rgba(0,0,0,0.12)]"
                                }
                            `}
                            style={{
                                color: hasNightSkyBg ? "rgb(220 230 255)" : undefined,
                            }}
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
                                className={`
                                    pointer-events-none absolute inset-0
                                    rounded-3xl blur-2xl
                                    ${hasNightSkyBg ? "bg-blue-950/20 opacity-20" : "bg-white/20 opacity-40"}
                                `}
                            />
                            {/* Content */}
                            <div style={{ position: "relative" }}>
                                <OrdersList
                                    buyerId={buyerId}
                                    buyerEmail={buyerEmail}
                                    onToast={showToast}
                                    activeTab={activeTab}
                                    theme={theme}
                                    sellerId={sellerId}
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
                                buyerEmail={buyerEmail}
                                onToast={showToast}
                                activeTab={activeTab}
                                sellerId={sellerId}
                                theme={theme}
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
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}

const styles = {
    layout: {
        minHeight: "100vh",
        display: "flex",
        background: "var(--page-bg)",
        fontFamily: "var(--font-sans)",
    },

    main: {
        flex: 1,
        padding: "36px 40px",
        position: "relative",
        zIndex: 1,
    },

    heading: {
        marginBottom: 28,
    },

    title: {
        margin: 0,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "var(--text-primary)",
    },

    subtitle: {
        margin: "4px 0 0",
        fontSize: 13,
        color: "var(--text-secondary)",
    },

    card: {
        position: "relative",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 14,
        padding: "28px 32px",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        overflow: "hidden",
    },

    cardHighlight: {
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        borderRadius: 14,
        background: "var(--glass-highlight)",
        opacity: 0.6,
    },
};
