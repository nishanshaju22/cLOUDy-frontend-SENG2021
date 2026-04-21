"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const NAV_ITEMS = [
  { path: "/",          label: "Home",       icon: "/icons/home.png", scale: 2.5 },
  { path: "/orders",    label: "Orders",     icon: "/icons/orders.png", scale: 1.3 },
  { path: "/products",  label: "Catalogues", icon: "/icons/catalogues.png", scale: 1.2 },
  { path: "/inventory", label: "Inventory",  icon: "/icons/inventory.png", scale: 1.1},
  { path: "/invoice",   label: "Invoice",    icon: "/icons/invoice.png", scale: 1.2 },
  { path: "/despatch",  label: "Despatch",   icon: "/icons/despatch.png", scale: 1.85 },
];

const BOTTOM_ITEMS = [
  { path: "/settings", label: "Settings", icon: "/icons/settings.png", scale: 1.15 },
  { path: "/profile",  label: "Profile",  icon: "/icons/profile.png", scale: 1 },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [visible, setVisible] = useState(false);

  const isActive = (path) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  useEffect(() => {
    const onMove = (e) => {
      const fromBottom = window.innerHeight - e.clientY;
      setVisible(fromBottom < 70);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <style>{`
        .dock-wrap {
          position: fixed;
          bottom: 16px;
          left: 50%;
          z-index: 1000;
          pointer-events: none;
          transform: translateX(-50%) translateY(100%);
          opacity: 0;
          transition: transform 0.2s ease-in, opacity 0.15s ease-in;
        }

        .dock-wrap.visible {
          pointer-events: all;
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          transition: transform 0.28s cubic-bezier(0.34, 1.26, 0.64, 1);
        }
        .dock-inner {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 18px;
          padding: 12px 20px 10px;

          border-radius: 24px;
          overflow: visable;

          backdrop-filter: blur(36px);
          -webkit-backdrop-filter: blur(36px);

          border: 0.5px solid rgba(255, 255, 255, 0.28);

          background: linear-gradient(
            to bottom right,
            rgba(52, 46, 55, 0.55),
            rgba(250, 255, 253, 0.55)
          );

          box-shadow:
            0 16px 70px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
        .dock-content {
          position: relative;
          display: flex;
          gap: 18px;
          align-items: flex-end;
          z-index: 2;
        }
        .dock-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          position: relative;
        }
        .dock-item:hover .dock-label {
          opacity: 1;
          transform: translateX(-50%) translateY(-2px);
        }
        .dock-label {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(0px);
          background: rgba(24, 24, 28, 0.88);
          color: rgba(255, 255, 255, 0.92);
          font-size: 11.5px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 7px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.12s, transform 0.12s;
          border: 0.5px solid rgba(255, 255, 255, 0.14);
          letter-spacing: 0.01em;
          z-index: 20;
          font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        .dock-icon {
            width: 58px;
            height: 58px;
            border-radius: 14px;
            overflow: hidden;
            position: relative;
            flex-shrink: 0;
            background: rgba(255, 255, 255, 0.08);
            border: 0.5px solid rgba(255, 255, 255, 0.12);

            display: flex;
            align-items: center;
            justify-content: center;
        }
        .dock-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: transparent;
          flex-shrink: 0;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .dock-dot.active {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        .dock-sep {
          width: 2px;
          height: 50px;
          align-self: center;
          flex-shrink: 0;
          border-radius: 999px;

          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.35)
          );
        }
        .dock-highlight {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: 24px;

          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.35),
            rgba(255, 255, 255, 0.05)
          );

          opacity: 0.6;
          z-index: 1;
        }
        .dock-frost {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: 24px;

          background: rgba(255, 255, 255, 0.2);
          opacity: 0.25;
          filter: blur(24px);
          z-index: 1;
        }
      `}</style>

      <div className={`dock-wrap ${visible ? "visible" : ""}`}>
        <div className="dock-inner">

          <div className="dock-highlight" />

          {/* Frost diffusion */}
          <div className="dock-frost" />

          {/* Actual content */}
          <div className="dock-content">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.path}
                className="dock-item"
                onClick={() => router.push(item.path)}
              >
                <div className="dock-icon">
                  <Image
                      src={item.icon}
                      alt={item.label}
                      fill
                      style={{
                          objectFit: "contain",
                          transform: `scale(${item.scale})`,
                      }}
                      sizes="58px"
                  />
                </div>
                <div className={`dock-dot ${isActive(item.path) ? "active" : ""}`} />
                <div className="dock-label">{item.label}</div>
              </div>
            ))}

            <div className="dock-sep" />

            {BOTTOM_ITEMS.map((item) => (
              <div
                key={item.path}
                className="dock-item"
                onClick={() => router.push(item.path)}
              >
                <div className="dock-icon">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    fill
                    style={{
                        objectFit: "contain",
                        transform: `scale(${item.scale})`,
                    }}
                    sizes="58px"
                  />
                </div>
                <div className={`dock-dot ${isActive(item.path) ? "active" : ""}`} />
                <div className="dock-label">{item.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}