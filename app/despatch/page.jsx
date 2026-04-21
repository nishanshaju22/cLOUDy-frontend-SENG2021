"use client";

import { useState, useCallback } from "react";
import { DespatchList } from "../../src/components/despatch/DespatchList";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { NightSkyBackground } from "../../src/components/ui/NightSkyBackground";
import { Toast } from "../../src/components/ui/ui";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../../src/components/ui/Sidebar";
import { DespatchDrawer } from "../../src/components/despatch/DespatchDrawer";
import { getAuth } from "../../src/lib/auth";

const parsed = getAuth();
const SELLER_ID = parsed?.user?.seller_id;

export default function DespatchPage() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("despatch");
    const [toast, setToast] = useState(null);
    const [selected, setSelected] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

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
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                * { box-sizing: border-box; }
                body { margin: 0; font-family: var(--font-sans); background: transparent; }
                select:focus, input:focus { outline: none; border-color: var(--border-strong) !important; }
            `}</style>

            <div style={{
                minHeight: "100vh",
                display: "flex",
                background: hasAtmosphericBg ? "transparent" : "var(--page-bg)",
                fontFamily: "var(--font-sans)",
            }}>
                <Sidebar/>

                <main style={{ flex: 1, padding: "36px 40px", position: "relative", zIndex: 1 }}>
                    {/* Page heading */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 800,
                            color: hasNightSkyBg ? "rgb(240 245 255)" : "var(--text-primary)",
                            letterSpacing: "-0.03em",
                        }}>
                            Despatches
                        </h1>
                        <p style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: hasMistBg
                            ? "rgb(0 0 0)"
                            : hasNightSkyBg
                                ? "rgb(180 200 255)"
                                : "var(--text-secondary)",
                        }}>
                            View and manage all despatch advices.
                        </p>
                    </div>

                    {/* Content card */}
                    {hasAtmosphericBg ? (
                        <div
                            className={`
                                relative w-full
                                max-w-400 mx-auto
                                rounded-3xl p-3
                                overflow-hidden
                                backdrop-blur-[20px]
                                border
                                ${hasNightSkyBg ? "border-white/20" : "border-white/30"}
                                ${hasNightSkyBg
                                    ? "shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                                    : "shadow-[0_16px_70px_rgba(0,0,0,0.12)]"
                                }
                                ${hasNightSkyBg
                                    ? "bg-[linear-gradient(to_bottom_right,rgba(200,220,255,0.22),rgba(180,200,255,0.12))]"
                                    : "bg-[linear-gradient(to_bottom_right,rgba(250,255,253,0.6),rgba(250,255,253,0.6))]"
                                }
                            `}
                            style={{
                                color: hasNightSkyBg ? "rgb(220 230 255)": undefined,
                            }}
                        >
                            {/* Top glass highlight */}
                            <div
                                className={`
                                    pointer-events-none absolute inset-0
                                    rounded-3xl
                                    ${hasNightSkyBg
                                        ? "bg-[linear-gradient(to_bottom,rgba(120,160,255,0.12),rgba(0,0,0,0))]"
                                        : "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),rgba(255,255,255,0.06))]"
                                    }
                                    opacity-60
                                `}
                            />

                            {/* Frost diffusion layer */}
                            <div
                                className={`
                                    pointer-events-none absolute inset-0
                                    rounded-3xl
                                    ${hasNightSkyBg ? "bg-blue-300/20 blue-2xl opacity-20" : "bg-white/20 blur-2xl opacity-40"}
                                `}
                            />
                            <div style={{ position: "relative" }}>
                                <DespatchList 
                                    onToast={showToast} 
                                    onSelect={setSelected}
                                    sellerId={SELLER_ID}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 14,
                            padding: "28px 32px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}>
                            <DespatchList 
                                onToast={showToast}
                                onSelect={setSelected}
                                sellerId={SELLER_ID}
                            />
                        </div>
                    )}
                </main>
            </div>

            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}

            {selected && (
                <DespatchDrawer
                    despatch={selected}
                    onClose={() => setSelected(null)}
                    onToast={showToast}
                    onRefresh={() => {}}
                    sellerId={SELLER_ID}
                />
            )}
        </>
    );
}