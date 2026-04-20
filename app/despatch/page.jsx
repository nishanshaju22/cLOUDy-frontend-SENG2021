"use client";

import { useState, useCallback } from "react";
import { DespatchList } from "../../src/components/despatch/DespatchList";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { Toast } from "../../src/components/ui/ui";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "../../src/components/ui/Sidebar";

export default function DespatchPage() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState("despatch");
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    const hasAtmosphericBg = theme === "cloudy" || theme === "stormy";

    return (
        <>
            {hasAtmosphericBg && <MistBackground />}

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
                            color: "var(--text-primary)",
                            letterSpacing: "-0.03em",
                        }}>
                            Despatches
                        </h1>
                        <p style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: hasAtmosphericBg ? "rgb(0 0 0)" : "var(--text-secondary)",
                        }}>
                            View and manage all despatch advices.
                        </p>
                    </div>

                    {/* Content card */}
                    {hasAtmosphericBg ? (
                        <div
                            className="
                                relative w-full
                                max-w-400 mx-auto
                                rounded-3xl p-3
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
                                <DespatchList onToast={showToast} />
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
                            <DespatchList onToast={showToast} />
                        </div>
                    )}
                </main>
            </div>

            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </>
    );
}