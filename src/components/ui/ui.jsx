"use client";

import { useState, useEffect } from "react";
import { Icon } from "./icons";

const statusStyles = {
    CREATED:   { bg: "#A5EFFD", color: "#33731A", border: "#33731A" },
    PROCESSED: { bg: "#A5EFFD", color: "#15803d", border: "#15803d" },
    FINALISED: { bg: "#A5EFFD", color: "#7c3aed", border: "#ddd6fe" },
    CANCELED:  { bg: "#A5EFFD", color: "#DD1D13", border: "#DD1D13" },
};

export function StatusBadge({ status, adviceStatus }) {
    console.log(adviceStatus)

    if (status == 'CREATED' && adviceStatus != undefined) {
        status = 'PROCESSED'
    }

    const s = statusStyles[status] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: s.bg,
            color: s.color,
            border: `1px solid ${s.border}`,
        }}>
            {status}
        </span>
    );
}

export function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 1000,
            background: type === "error" ? "#fff1f2" : "#f0fdf4",
            border: `1px solid ${type === "error" ? "#fecdd3" : "#bbf7d0"}`,
            color: type === "error" ? "#be123c" : "#15803d",
            borderRadius: 10, padding: "12px 20px",
            fontSize: 13, fontWeight: 500,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", gap: 10,
            animation: "slideUp 0.2s ease",
        }}> 
            {msg}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", opacity: 0.6 }}>
                <Icon.X />
            </button>
        </div>
    );
}

export function Field({ label, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}{required && <span style={{ color: "#e11d48", marginLeft: 3 }}>*</span>}
        </label>
        {children}
    </div>
  );
}

export const inputStyle = {
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1e293b",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
};

export function Input({ style, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
            style={{ ...inputStyle, borderColor: focused ? "#94a3b8" : "#e2e8f0", ...style }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

export function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#94a3b8",
            borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 16,
        }}>
            {children}
        </div>
    );
}