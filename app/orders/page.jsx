"use client";

import { useState, useCallback } from "react";
import { BuyerIdBar } from "../../src/components/orders/BuyerIdBar";
import { OrdersList } from "../../src/components/orders/OrdersList";
import { CreateOrderModal } from "../../src/components/orders/CreateOrderModal";
import { MistBackground } from "../../src/components/ui/MistBackground";
import { Sidebar } from "../../src/components/ui/Sidebar";
import { Toast } from "../../src/components/ui/ui";

export default function OrdersPage() {
    const [buyerId, setBuyerId] = useState("");
    const [activeTab, setActiveTab] = useState("orders");
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    return (
        <>
            <MistBackground />

            <style>{`
                @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'DM Sans', 'Geist', ui-sans-serif, system-ui, sans-serif; }

                select:focus, input:focus {
                    outline: none;
                    border-color: rgba(148,163,184,0.4) !important;
                }
            `}</style>

            <div className="min-h-screen flex bg-transparent">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onCreateOrder={() => setShowCreate(true)}
                />

                <main 
                    className="flex-1 px-10 py-9"
                    style={{
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
                    <div className="mb-8">
                        <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-foreground">
                            My Orders
                        </h1>
                        <p className="mt-1 text-sm text-foreground/60">
                            Browse and manage all orders for this buyer.
                        </p>
                    </div>

                    {/* Glass container */}
                    <div
                        className="
                            relative
                            rounded-3xl
                            p-8

                            backdrop-blur-[18px]
                            bg-gradient-to-br from-white/40 to-white/10
                            border border-white/20

                            shadow-[0_8px_40px_rgba(0,0,0,0.12)]

                            dark:from-white/10 dark:to-white/5
                            dark:border-white/10
                        "
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/10 opacity-40 blur-2xl" />

                        <div className="relative">
                            <OrdersList
                                buyerId={buyerId}
                                onToast={showToast}
                                activeTab={activeTab}
                            />
                        </div>
                    </div>
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