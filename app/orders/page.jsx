"use client";

import { useState, useCallback } from "react";
import { BuyerIdBar } from "../../src/components/orders/BuyerIdBar";
import { OrdersList } from "../../src/components/orders/OrdersList";
import { CreateOrderModal } from "../../src/components/orders/CreateOrderModal";
import { Sidebar } from "../../src/components/ui/Sidebar";
import { Toast } from "../../src/components/ui/ui";

/*
  THEMING NOTES
  ─────────────
  This page reads from CSS custom properties defined in globals.css.
  The "professional" theme renders a flat white layout identical to the
  Inventory / Products pages.

  When you later implement "cloudy" or "stormy":
    • Set --glass-bg, --glass-blur, --glass-border, --glass-shadow,
      --glass-highlight in that theme block.
    • Add your MistBackground (or equivalent) component back — it only
      renders when the theme is NOT "professional".
    • Nothing in this JSX file needs to change.
*/

export default function OrdersPage() {
    const [buyerId, setBuyerId] = useState("");
    const [buyerEmail, setBuyerEmail] = useState("");
    const [activeTab, setActiveTab] = useState("orders");
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
    }, []);

    const SELLER_ID = process.env.NEXT_PUBLIC_SELLER_ID || "be45f62d-06cf-4f9e-a23e-bc68ba7ab0d1";

    return (
        <>
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
                    background: var(--page-bg);
                }
                select:focus, input:focus {
                    outline: none;
                    border-color: var(--border-strong) !important;
                }
            `}</style>

            <div style={styles.layout}>
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onCreateOrder={() => setShowCreate(true)}
                />

                <main style={styles.main}>
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
                        sellerId={SELLER_ID}
                    />

                    {/* Page heading */}
                    <div style={styles.heading}>
                        <h1 style={styles.title}>My Orders</h1>
                        <p style={styles.subtitle}>
                            Browse and manage all orders for this buyer.
                        </p>
                    </div>

                    {/*
                        The "content card" below uses CSS variables for every
                        visual property. In "professional" these resolve to a
                        plain white card. In "cloudy" / "stormy" they resolve
                        to a frosted-glass panel — no JSX changes needed.
                    */}
                    <div style={styles.card}>
                        {/* Glass highlight overlay — invisible in professional */}
                        <div style={styles.cardHighlight} aria-hidden />

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

    /*
     * This card is the key theme-aware element.
     *
     * Professional → flat white surface, plain border, no blur
     * Cloudy       → frosted blue-white glass, backdrop-blur, soft shadow
     * Stormy       → dark glass, high contrast, dramatic shadow
     *
     * All of that is controlled entirely from globals.css.
     */
    card: {
        position: "relative",
        background: "var(--glass-bg)",        // white in professional, gradient in glass themes
        border: "1px solid var(--glass-border)",
        borderRadius: 14,
        padding: "28px 32px",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        overflow: "hidden",
    },

    /*
     * Subtle highlight stripe at the top of the card.
     * Invisible (transparent) in professional, glassy sheen in other themes.
     */
    cardHighlight: {
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        borderRadius: 14,
        background: "var(--glass-highlight)",
        opacity: 0.6,
    },
};