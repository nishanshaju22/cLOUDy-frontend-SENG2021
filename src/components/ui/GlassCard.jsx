export function GlassCard({ children, style, className }) {
    return (
        <div
            className={className}
            style={{
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}