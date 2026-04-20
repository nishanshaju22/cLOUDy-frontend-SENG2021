"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../src/lib/auth";

interface Star {
  x: number;
  y: number;
  r: number;
  sp: number;
  li: number;
  op: number;
  tw: number;
}

interface PuffDetail {
  dx: number;
  dy: number;
  r: number;
}

interface Puff {
  xFrac: number;
  radiusBase: number;
  yNoise: number;
  detail: PuffDetail[];
}

function WordmarkCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const draw = () => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const fontSize = Math.min(Math.max(window.innerWidth * 0.1, 52), 108);
    const font = `700 ${fontSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = font;

    const textW = ctx.measureText("cLOUDy").width;
    const textH = fontSize * 1.25;

    canvas.width = Math.ceil(textW * dpr) + 8;
    canvas.height = Math.ceil(textH * dpr);
    canvas.style.width = `${Math.ceil(textW) + 8}px`;
    canvas.style.height = `${Math.ceil(textH)}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = font;
    ctx.textBaseline = "top";

    const grad = ctx.createLinearGradient(0, 0, textW, 0);
    grad.addColorStop(0, "#7090d8");
    grad.addColorStop(0.1, "#8aaae8");
    grad.addColorStop(0.18, "#ffffff");
    grad.addColorStop(0.72, "#d8e8ff");
    grad.addColorStop(0.82, "#8aaae8");
    grad.addColorStop(1, "#6080c8");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = grad;
    ctx.fillText("cLOUDy", 4, 0);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.filter = "blur(8px)";
    ctx.fillStyle = "#8ab0ff";
    ctx.fillText("cLOUDy", 4, 0);
    ctx.restore();
  };

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return <canvas ref={ref} style={{ display: "block", margin: "0 auto 20px" }} />;
}

function CloudyCanvas({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let animId = 0;
    let stars: Star[] = [];
    let ox = 0;
    let oy = 0;
    let tax = 0;
    let tay = 0;
    let scrollY = 0;

    const cloudLayers = [
      { y: 0.62, speed: 0.18, scale: 1.0, alpha: 0.13, color: [80, 100, 200] as [number, number, number] },
      { y: 0.68, speed: 0.28, scale: 1.3, alpha: 0.18, color: [60, 80, 180] as [number, number, number] },
      { y: 0.74, speed: 0.38, scale: 1.55, alpha: 0.22, color: [40, 55, 160] as [number, number, number] },
      { y: 0.8, speed: 0.55, scale: 1.8, alpha: 0.3, color: [25, 35, 130] as [number, number, number] },
      { y: 0.87, speed: 0.75, scale: 2.1, alpha: 0.4, color: [15, 20, 100] as [number, number, number] },
      { y: 0.93, speed: 1.0, scale: 2.5, alpha: 0.55, color: [8, 10, 70] as [number, number, number] },
      { y: 1.0, speed: 1.3, scale: 3.0, alpha: 0.8, color: [4, 5, 40] as [number, number, number] },
    ];

    const puffs: Puff[][] = cloudLayers.map((_, li) =>
      Array.from({ length: 6 + li * 2 }, () => ({
        xFrac: Math.random(),
        radiusBase: 55 + Math.random() * 60,
        yNoise: (Math.random() - 0.5) * 18,
        detail: Array.from({ length: 5 + li }, () => ({
          dx: (Math.random() - 0.5) * 60,
          dy: (Math.random() - 0.5) * 20,
          r: 30 + Math.random() * 50,
        })),
      }))
    );

    const buildStars = () => {
      stars = [];
      const layers: [number, number, number, number][] = [
        [650, 0.65, 0.07, 0],
        [280, 1.25, 0.16, 1],
        [120, 1.9, 0.26, 2],
      ];

      layers.forEach(([n, r, sp, li]) => {
        for (let i = 0; i < n; i++) {
          stars.push({
            x: Math.random() * W * 2.6 - W * 0.8,
            y: Math.random() * H * 1.8 - H * 0.2,
            r,
            sp,
            li,
            op: 0.3 + Math.random() * 0.7,
            tw: Math.random() * Math.PI * 2,
          });
        }
      });
    };

    const resize = () => {
      W = canvas.width = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
      buildStars();
    };

    const drawCloud = (
      x: number,
      y: number,
      rb: number,
      detail: PuffDetail[],
      color: [number, number, number],
      alpha: number,
      scale: number
    ) => {
      const [cr, cg, cb] = color;

      const g = ctx.createRadialGradient(x, y, 0, x, y, rb * scale);
      g.addColorStop(0, `rgba(${cr + 30},${cg + 30},${cb + 50},${alpha})`);
      g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.7})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

      ctx.beginPath();
      ctx.arc(x, y, rb * scale, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      detail.forEach((d) => {
        const dx = x + d.dx * scale;
        const dy = y + d.dy * scale * 0.5;

        const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, d.r * scale);
        dg.addColorStop(0, `rgba(${cr + 20},${cg + 20},${cb + 40},${alpha * 0.8})`);
        dg.addColorStop(0.6, `rgba(${cr},${cg},${cb},${alpha * 0.4})`);
        dg.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(dx, dy, d.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = dg;
        ctx.fill();
      });
    };

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, W, H);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#000005");
      sky.addColorStop(0.4, "#080620");
      sky.addColorStop(0.65, "#0c0830");
      sky.addColorStop(0.82, "#100a3a");
      sky.addColorStop(1, "#06040f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ox += (tax - ox) * 0.032;
      oy += (tay - oy) * 0.032;
      scrollY = (scrollY + 0.06) % 1400;

      stars.forEach((s) => {
        const px = (((s.x + ox * (s.li + 1) * 18 + W * 0.5) % (W + 400)) + (W + 400)) % (W + 400) - 180;
        const py = (((s.y - scrollY * s.sp + oy * (s.li + 1) * 10 + H * 0.5) % (H + 400)) + (H + 400)) % (H + 400) - 180;

        if (py > H * 0.58) return;

        const tw = 0.5 + 0.5 * Math.sin(t * 0.0009 * (s.sp * 4) + s.tw);
        const op = s.op * (0.5 + 0.5 * tw);

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${op})`;
        ctx.fill();
      });

      cloudLayers.forEach((cl, li) => {
        const baseY = H * cl.y;
        const timOff = t * 0.00006 * cl.speed;

        puffs[li].forEach((p) => {
          const rawX = ((p.xFrac + timOff) % 1 + 1) % 1;
          const x = rawX * (W + 300) - 100;
          const y = baseY + p.yNoise;

          drawCloud(x, y, p.radiusBase, p.detail, cl.color, cl.alpha, cl.scale);
          drawCloud(x - (W + 300), y, p.radiusBase, p.detail, cl.color, cl.alpha, cl.scale);
        });
      });

      animId = window.requestAnimationFrame(drawFrame);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      tax = -((((e.clientX - rect.left) / rect.width) * 2) - 1) * 1.1;
      tay = -((((e.clientY - rect.top) / rect.height) * 2) - 1) * 0.6;
    };

    window.addEventListener("resize", resize);
    wrap.addEventListener("mousemove", onMouseMove);

    resize();
    animId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("mousemove", onMouseMove);
    };
  }, [wrapRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

export default function Home() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/orders");
    }
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={wrapRef} className="relative h-screen w-full overflow-hidden bg-black">
      <CloudyCanvas wrapRef={wrapRef} />

      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className="pointer-events-none absolute z-10"
          style={{
            width: 28,
            height: 28,
            top: pos.startsWith("t") ? 22 : undefined,
            bottom: pos.startsWith("b") ? 22 : undefined,
            left: pos.endsWith("l") ? 22 : undefined,
            right: pos.endsWith("r") ? 22 : undefined,
            borderTop: pos.startsWith("t") ? "1px solid rgba(140,170,255,0.18)" : undefined,
            borderBottom: pos.startsWith("b") ? "1px solid rgba(140,170,255,0.18)" : undefined,
            borderLeft: pos.endsWith("l") ? "1px solid rgba(140,170,255,0.18)" : undefined,
            borderRight: pos.endsWith("r") ? "1px solid rgba(140,170,255,0.18)" : undefined,
          }}
        />
      ))}

      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(22px)",
          transition: "opacity 1.8s ease, transform 1.8s ease",
        }}
      >
        <div
          className="mb-6 flex items-center gap-2 px-4 py-1.5"
          style={{
            background: "rgba(15,10,45,0.5)",
            border: "1px solid rgba(110,140,255,0.18)",
            borderRadius: 999,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              flexShrink: 0,
              background: "#4a7fd4",
              boxShadow: "0 0 6px rgba(74,127,212,0.8)",
            }}
          />
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(160,185,255,0.52)",
              whiteSpace: "nowrap",
            }}
          >
            Business Management Platform
          </span>
        </div>

        <WordmarkCanvas />

        <p
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: "clamp(14px, 1.6vw, 17px)",
            fontWeight: 400,
            color: "rgba(190,210,255,0.58)",
            letterSpacing: "0.01em",
            lineHeight: 1.65,
            maxWidth: 420,
            marginBottom: 32,
            fontStyle: "normal",
          }}
        >
          We are here to help you raise your business above the clouds.
        </p>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "#fff",
              background: "linear-gradient(135deg,#3552d8,#4c3bbe)",
              border: "1px solid rgba(100,130,255,0.3)",
              borderRadius: 8,
              padding: "11px 26px",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(55,80,210,0.35)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(55,80,210,0.5)";
              e.currentTarget.style.background = "linear-gradient(135deg,#4265f0,#5e50d0)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(55,80,210,0.35)";
              e.currentTarget.style.background = "linear-gradient(135deg,#3552d8,#4c3bbe)";
            }}
          >
            Register
          </Link>

          <Link
            href="/login"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "rgba(175,195,255,0.55)",
              background: "rgba(15,10,45,0.35)",
              border: "1px solid rgba(110,140,255,0.18)",
              borderRadius: 8,
              padding: "11px 22px",
              textDecoration: "none",
              display: "inline-block",
              backdropFilter: "blur(6px)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(130,165,255,0.38)";
              e.currentTarget.style.color = "rgba(210,225,255,0.82)";
              e.currentTarget.style.background = "rgba(30,20,70,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(110,140,255,0.18)";
              e.currentTarget.style.color = "rgba(175,195,255,0.55)";
              e.currentTarget.style.background = "rgba(15,10,45,0.35)";
            }}
          >
            Sign In
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {["Order Management", "Inventory Tracking", "Revenue Analytics"].map((feat) => (
            <span
              key={feat}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 11,
                color: "rgba(140,165,230,0.38)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 10px",
                border: "1px solid rgba(100,130,220,0.1)",
                borderRadius: 999,
                background: "rgba(10,8,30,0.3)",
                backdropFilter: "blur(4px)",
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}