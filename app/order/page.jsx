"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "../../src/components/orders/Sidebar";
import { BuyerIdBar } from "../../src/components/orders/BuyerIdBar";
import { OrdersList } from "../../src/components/orders/OrdersList";
import { CreateOrderModal } from "../../src/components/orders/CreateOrderModal";
import { Toast } from "../../src/components/orders/ui";

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
                onTabChange={setActiveTab}
                onCreateOrder={() => setShowCreate(true)}
            />

            <main style={{ flex: 1, padding: "36px 40px" }}>
                <BuyerIdBar
                    buyerId={buyerId}
                    onChange={setBuyerId}
                    onClear={() => setBuyerId("")}
                    onToast={showToast}
                />

                {/* Page heading */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                        My Orders
                    </h1>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
                        Browse and manage all orders for this buyer.
                    </p>
                </div>

                {/* Content card */}
                <div style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "28px 32px",
                    }}>
                    <OrdersList
                    buyerId={buyerId}
                    onToast={showToast}
                    activeTab={activeTab}
                    />
                </div>
            </main>
        </div>

        {/* Create Order modal */}
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