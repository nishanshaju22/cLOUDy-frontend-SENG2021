"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return { toasts, addToast };
}

export function ToastContainer({ toasts }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div style={styles.container}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>,
        document.body
    );
}
function Toast({ toast }) {
    const isError = toast.type === "error";
    return (
        <div style={{
            ...styles.toast,
            background: isError ? "#111" : "#111",
            borderLeft: `3px solid ${isError ? "#ef4444" : "#22c55e"}`,
        }}>
            <span style={styles.icon}>
                {isError ? "✕" : "✓"}
            </span>
            <span style={styles.message}>{toast.message}</span>
        </div>
    );
}

const styles = {
    container: {
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
        pointerEvents: "none",
        alignItems: "center",
    },
    toast: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        minWidth: 240,
        animation: "fadeUp 0.2s ease",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    icon: {
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
    },
    message: {
        fontSize: 13,
        fontWeight: 500,
        color: "#fff",
    },
};