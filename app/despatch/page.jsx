"use client";

import { useState, useCallback } from "react";
import { DespatchList } from "../../src/components/despatch/DespatchList";
import { Toast } from "../../src/components/ui/ui";
import Sidebar from "../../src/components/ui/Sidebar";

export default function DespatchPage() {
    const [activeTab,  setActiveTab]  = useState("despatch");
    const [toast,      setToast]      = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    return (
        <>
            <style>{`
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'DM Sans', 'Geist', ui-sans-serif, system-ui, sans-serif; }
                select:focus, input:focus { outline: none; border-color: #94a3b8 !important; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        // Navigate to orders page if they click Orders
                        if (tab !== "despatch") {
                            window.location.href = "/orders";
                        }
                    }}
                    onCreateOrder={() => {
                        window.location.href = "/orders";
                    }}
                />

                <main style={{ flex: 1, padding: "36px 40px" }}>

                    {/* Page heading */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{
                            margin: 0, fontSize: 22, fontWeight: 800,
                            color: "#0f172a", letterSpacing: "-0.03em",
                        }}>
                            Despatches
                        </h1>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
                            View and manage all despatch advices.
                        </p>
                    </div>

                    {/* Content card */}
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 14,
                        padding: "28px 32px",
                    }}>
                        <DespatchList onToast={showToast} />
                    </div>
                </main>
            </div>

            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </>
    );
}