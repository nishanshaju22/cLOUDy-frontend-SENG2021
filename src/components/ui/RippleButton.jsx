"use client";

import { useState, useRef } from "react";

export function RippleButton({
    children,
    onClick,
    disabled,
    style,
    rippleColor="rgba(34,211,238,0.25)",
    ...props
}) {
    const [ripples, setRipples] = useState([]);
    const btnRef = useRef(null);

    const handleClick = (e) => {
        if (disabled) return;

        const btn  = btnRef.current;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x    = e.clientX - rect.left - size / 2;
        const y    = e.clientY - rect.top  - size / 2;
        const key  = Date.now();

        setRipples(prev => [...prev, { key, x, y, size }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.key !== key)), 600);

        onClick?.(e);
    };

    return (
        <div
            ref={btnRef}
            onClick={handleClick}
            disabled={disabled}
            style={{
                position: "relative",
                overflow: "hidden",
                cursor: disabled ? "not-allowed" : "pointer",
                ...style,
            }}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map(r => (
                <span
                    key={r.key}
                    style={{
                        position: "absolute",
                        left: r.x,
                        top:  r.y,
                        width:  r.size,
                        height: r.size,
                        background: rippleColor,
                        borderRadius: "50%",
                        transform: "scale(0)",
                        animation: "rippleEffect 0.6s ease-out forwards",
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Content sits above ripple */}
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                {children}
            </span>

            <style>{`
                @keyframes rippleEffect {
                    0%   { transform: scale(0); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}