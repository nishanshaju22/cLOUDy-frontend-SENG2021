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
    const [buyerEmail, setBuyerEmail] = useState("");
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
                        onChange={(id, email) => {
                            setBuyerId(id);
                            setBuyerEmail(email);
                        }}
                        onClear={() => {
                            setBuyerId("");
                            setBuyerEmail("");
                        }}
                        onToast={showToast}
                    />

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-foreground">
                            My Orders
                        </h1>
                        <p className="mt-1 text-sm text-amber-50">
                            Browse and manage all orders for this buyer.
                        </p>
                    </div>

                    {/* Glass container */}
                    <div
                        className="
                            relative
                            rounded-3xl
                            p-10

                            backdrop-blur-[36px]

                            border
                          border-white/30

                            shadow-[0_16px_70px_rgba(0,0,0,0.12)]

                            bg-[linear-gradient(to_bottom_right,rgba(250,255,253,0.22),rgba(52,46,55,0.62))]
                        "
                    >
                        {/* bg-[linear-gradient(to_bottom_right,rgba(30,101,172,0.22),rgba(30,101,172,0.22))] */}
                        {/* bg-[linear-gradient(to_bottom_right,rgba(160,200,240,0.22),rgba(160,200,240,0.22))] */}
                        {/* bg-[linear-gradient(to_bottom_right,rgba(17,59,100,0.22),rgba(17,59,100,0.22))] */}
                        {/* bg-[linear-gradient(to_bottom_right,rgba(105,56,92,0.22),rgba(105,56,92,0.22))] */}

                        {/* Top glass highlight */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                rounded-3xl

                                bg-[linear-gradient(to_bottom, rgba(255,255,255,0.35), rgba(255,255,255,0.06))]

                                opacity-60
                            "
                        />

                        {/* Frost diffusion layer */}
                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                rounded-3xl

                                bg-white/20
                                blur-2xl
                                opacity-40
                            "
                        />

                        {/* Content */}
                        <div className="relative">
                            <OrdersList
                                buyerId={buyerId}
                                buyerEmail={buyerEmail}
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