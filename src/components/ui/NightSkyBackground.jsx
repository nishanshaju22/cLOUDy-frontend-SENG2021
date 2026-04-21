"use client";

import { useEffect, useRef } from "react";

export function NightSkyBackground({
  cloudIntensity = 1,
  starDensity = "full",
  showTopo = true,
  showRings = true,
  vignetteStrength = 0.52,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let animId;
    let stars = [];
    let ox = 0;
    let oy = 0;
    let tax = 0;
    let tay = 0;
    let scrollY = 0;

    const densityMap = { minimal: 0.3, normal: 0.6, full: 1 };
    const ds = densityMap[starDensity] ?? 1;

    const cloudLayers = [
      { y: 0.62, speed: 0.18, scale: 1.0, alpha: 0.13 * cloudIntensity, color: [80, 100, 200] },
      { y: 0.68, speed: 0.28, scale: 1.3, alpha: 0.18 * cloudIntensity, color: [60, 80, 180] },
      { y: 0.74, speed: 0.38, scale: 1.55, alpha: 0.22 * cloudIntensity, color: [40, 55, 160] },
      { y: 0.8, speed: 0.55, scale: 1.8, alpha: 0.3 * cloudIntensity, color: [25, 35, 130] },
      { y: 0.87, speed: 0.75, scale: 2.1, alpha: 0.4 * cloudIntensity, color: [15, 20, 100] },
      { y: 0.93, speed: 1.0, scale: 2.5, alpha: 0.55 * cloudIntensity, color: [8, 10, 70] },
      { y: 1.0, speed: 1.3, scale: 3.0, alpha: 0.8 * cloudIntensity, color: [4, 5, 40] },
    ];

    const puffs = cloudLayers.map((_, li) =>
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

    function buildStars() {
      stars = [];

      [
        [Math.round(650 * ds), 0.65, 0.07, 0],
        [Math.round(280 * ds), 1.25, 0.16, 1],
        [Math.round(120 * ds), 1.9, 0.26, 2],
      ].forEach(([n, r, sp, li]) => {
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
    }

    function resize() {
      const parent = canvas.parentElement;
      W = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      H = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      buildStars();
    }

    function drawCloud(x, y, rb, detail, color, alpha, scale) {
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
        dg.addColorStop(1, `rgba(0,0,0,0)`);

        ctx.beginPath();
        ctx.arc(dx, dy, d.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = dg;
        ctx.fill();
      });
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#000005");
      sky.addColorStop(0.4, "#080620");
      sky.addColorStop(0.65, "#0c0830");
      sky.addColorStop(0.82, "#100a3a");
      sky.addColorStop(1, "#06040f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      const hg = ctx.createRadialGradient(W / 2, H * 0.72, 0, W / 2, H * 0.72, W * 0.65);
      hg.addColorStop(0, "rgba(50,30,140,0.28)");
      hg.addColorStop(0.4, "rgba(30,15,90,0.14)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, W, H);

      ox += (tax - ox) * 0.032;
      oy += (tay - oy) * 0.032;
      scrollY = (scrollY + 0.06) % 1400;

      stars.forEach((s) => {
        const px =
          ((s.x + ox * (s.li + 1) * 18 + W * 0.5) % (W + 400) + (W + 400)) % (W + 400) - 180;

        const py =
          ((s.y - scrollY * s.sp + oy * (s.li + 1) * 10 + H * 0.5) % (H + 400) + (H + 400)) %
            (H + 400) -
          180;

        if (py > H * 0.58) return;

        const tw = 0.5 + 0.5 * Math.sin(t * 0.0009 * (s.sp * 4) + s.tw);
        const op = s.op * (0.5 + 0.5 * tw);

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${op})`;
        ctx.fill();

        if (s.li === 2 && tw > 0.78) {
          ctx.beginPath();
          ctx.arc(px, py, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(150,185,255,${(tw - 0.78) * 0.1})`;
          ctx.fill();
        }
      });

      if (showRings) {
        const cx = W / 2;
        const cy = H * 0.38;

        for (let j = 0; j < 3; j++) {
          for (let i = 0; i < 5; i++) {
            const phase = t * 0.000022 - 0.007 * j + i * 0.011;
            const rad = (((phase % 1) + 1) % 1) * Math.min(W, H) * 0.45 + i * 14;
            const al = (0.045 - i * 0.007) * (j === 0 ? 1 : j === 1 ? 0.6 : 0.35);
            const cols = ["rgba(65,125,255,", "rgba(90,65,215,", "rgba(45,165,195,"];

            const rg = ctx.createRadialGradient(cx, cy, Math.max(0, rad - 2), cx, cy, rad + 2);
            rg.addColorStop(0, cols[j] + "0)");
            rg.addColorStop(0.5, cols[j] + al + ")");
            rg.addColorStop(1, cols[j] + "0)");

            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(1, rad), 0, Math.PI * 2);
            ctx.strokeStyle = rg;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      }

      if (showTopo) {
        const topoH = H * 0.42;
        const topoY = H - topoH;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, topoY, W, topoH);
        ctx.clip();

        for (let i = 0; i < 18; i++) {
          const frac = i / 18;
          const baseY = topoY + frac * topoH;
          const amp = 8 + frac * 28;
          const freq = 0.008 + frac * 0.012;
          const spd = t * 0.0004 * (0.5 + frac * 0.8);
          const al = 0.06 + frac * 0.22;
          const purple = Math.floor(80 + frac * 120);
          const blue = Math.floor(20 + frac * 40);

          ctx.beginPath();
          ctx.moveTo(0, baseY);

          for (let x = 0; x <= W; x += 3) {
            ctx.lineTo(
              x,
              baseY +
                Math.sin(x * freq + spd) * amp +
                Math.sin(x * freq * 1.7 + spd * 1.3 + 1.2) * amp * 0.4
            );
          }

          ctx.strokeStyle = `rgba(${purple},${blue},255,${al})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      if (cloudIntensity > 0) {
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
      }

      const bf = ctx.createLinearGradient(0, H * 0.88, 0, H);
      bf.addColorStop(0, "rgba(0,0,0,0)");
      bf.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = bf;
      ctx.fillRect(0, H * 0.88, W, H * 0.12);

      const v = ctx.createRadialGradient(
        W / 2,
        H / 2,
        H * 0.18,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.75
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, `rgba(0,0,0,${vignetteStrength})`);
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(drawFrame);
    }

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      tax = -(((e.clientX - rect.left) / rect.width) * 2 - 1) * 1.1;
      tay = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * 0.6;
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) {
      ro.observe(canvas.parentElement);
    }

    window.addEventListener("mousemove", onMouse);
    resize();
    animId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, [cloudIntensity, starDensity, showTopo, showRings, vignetteStrength]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
      }}
    />
  );
}

export function NightSkyPage({ children, ...bgProps }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <NightSkyBackground {...bgProps} />

      {["tl", "tr", "bl", "br"].map((pos) => (
        <div
          key={pos}
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 5,
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

      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}