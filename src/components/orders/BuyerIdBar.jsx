"use client";

import { inputStyle } from "./ui";
import { AddBuyerButton } from "./AddBuyerButton";

export function BuyerIdBar({ buyerId, onChange, onClear, onToast }) {
  return (
    <div style={{ position: "relative", marginBottom: 32 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "10px 16px",
      }}>
        <label style={{
          fontSize: 12, fontWeight: 700, color: "#64748b",
          whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase",
        }}>
          Buyer ID
        </label>

        <input
          value={buyerId}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter your buyer UUID…"
          style={{ ...inputStyle, border: "none", padding: 0, flex: 1, fontSize: 13 }}
        />

        {buyerId && (
          <button
            onClick={onClear}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#94a3b8", padding: 0, display: "flex",
            }}
          >
            {/* X icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Add buyer button */}
        <AddBuyerButton
          onToast={onToast}
          onSuccess={(buyer) => {
            if (buyer?.buyerId) onChange(buyer.buyerId);
          }}
        />
      </div>
    </div>
  );
}