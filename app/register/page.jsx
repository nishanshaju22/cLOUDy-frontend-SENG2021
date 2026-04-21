"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { registerUser } from "../../src/api/auth";
import { isLoggedIn, setAuth } from "../../src/lib/auth";

// ─── Full-page background canvas ─────────────────────────────────────────────
function CloudyBackground() {
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

    const cloudLayers = [
      { y: 0.62, speed: 0.18, scale: 1.0, alpha: 0.13, color: [80, 100, 200] },
      { y: 0.68, speed: 0.28, scale: 1.3, alpha: 0.18, color: [60, 80, 180] },
      { y: 0.74, speed: 0.38, scale: 1.55, alpha: 0.22, color: [40, 55, 160] },
      { y: 0.8, speed: 0.55, scale: 1.8, alpha: 0.3, color: [25, 35, 130] },
      { y: 0.87, speed: 0.75, scale: 2.1, alpha: 0.4, color: [15, 20, 100] },
      { y: 0.93, speed: 1.0, scale: 2.5, alpha: 0.55, color: [8, 10, 70] },
      { y: 1.0, speed: 1.3, scale: 3.0, alpha: 0.8, color: [4, 5, 40] },
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
        [650, 0.65, 0.07, 0],
        [280, 1.25, 0.16, 1],
        [120, 1.9, 0.26, 2],
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
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
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

      const bf = ctx.createLinearGradient(0, H * 0.88, 0, H);
      bf.addColorStop(0, "rgba(0,0,0,0)");
      bf.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = bf;
      ctx.fillRect(0, H * 0.88, W, H * 0.12);

      const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.52)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(drawFrame);
    }

    const onMouse = (e) => {
      tax = -(e.clientX / window.innerWidth * 2 - 1) * 1.1;
      tay = -(e.clientY / window.innerHeight * 2 - 1) * 0.6;
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", resize);
    resize();
    animId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

function Wordmark({ fontSize }) {
  const ref = useRef(null);

  function draw() {
    const lc = ref.current;
    if (!lc) return;
    const lx = lc.getContext("2d");
    if (!lx) return;
    const dpr = window.devicePixelRatio || 1;
    const font = `700 ${fontSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    lx.font = font;
    const textW = lx.measureText("cLOUDy").width;
    const textH = fontSize * 1.3;
    lc.width = Math.ceil(textW * dpr) + 8;
    lc.height = Math.ceil(textH * dpr);
    lc.style.width = Math.ceil(textW) + 8 + "px";
    lc.style.height = Math.ceil(textH) + "px";
    lx.scale(dpr, dpr);
    lx.font = font;
    lx.textBaseline = "top";

    const grad = lx.createLinearGradient(0, 0, textW, 0);
    grad.addColorStop(0, "#7090d8");
    grad.addColorStop(0.1, "#8aaae8");
    grad.addColorStop(0.18, "#ffffff");
    grad.addColorStop(0.72, "#d8e8ff");
    grad.addColorStop(0.82, "#8aaae8");
    grad.addColorStop(1, "#6080c8");

    lx.fillStyle = grad;
    lx.fillText("cLOUDy", 4, 0);

    lx.save();
    lx.globalAlpha = 0.15;
    lx.filter = "blur(6px)";
    lx.fillStyle = "#8ab0ff";
    lx.fillText("cLOUDy", 4, 0);
    lx.restore();
  }

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [fontSize]);

  return <canvas ref={ref} style={{ display: "block" }} />;
}

function BrandingPanel() {
  return (
    <div
      className="hidden md:flex h-full w-full items-center justify-center"
      style={{ zIndex: 2, position: "relative" }}
    >
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div className="flex justify-center">
          <Wordmark fontSize={76} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            margin: "20px 0",
          }}
        >
          <div style={{ width: 36, height: 1, background: "linear-gradient(to right,transparent,rgba(140,170,255,0.35))" }} />
          <div style={{ width: 4, height: 4, background: "rgba(155,185,255,0.45)", transform: "rotate(45deg)" }} />
          <div style={{ width: 36, height: 1, background: "linear-gradient(to left,transparent,rgba(140,170,255,0.35))" }} />
        </div>

        <p
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(195,215,255,0.68)",
            letterSpacing: "0.01em",
            lineHeight: 1.7,
            marginBottom: 12,
          }}
        >
          Elevate your Business above the Clouds.
        </p>

        <p
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 12,
            color: "rgba(150,175,255,0.38)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Fast systems. LOUD results.
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            color: "rgba(160,185,255,0.5)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Step {step} of {total}
        </span>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            color: "rgba(120,150,255,0.4)",
            letterSpacing: "0.03em",
          }}
        >
          {pct}%
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 4,
          borderRadius: 999,
          background: "rgba(80,100,200,0.15)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: "linear-gradient(to right, #3552d8, #6050d0, #4a90e8)",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background:
                i < step
                  ? "linear-gradient(135deg,#4a7fd4,#6050d0)"
                  : "rgba(80,100,200,0.2)",
              boxShadow: i < step ? "0 0 8px rgba(74,127,212,0.6)" : "none",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(10,10,28,0.6)",
  border: "1px solid rgba(80,100,200,0.22)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  color: "#d1d5db",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  backdropFilter: "blur(4px)",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "rgba(160,180,240,0.6)",
  marginBottom: 5,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  letterSpacing: "0.01em",
};

const focus = (e) => (e.currentTarget.style.borderColor = "rgba(100,140,255,0.6)");
const blur = (e, invalid = false) => {
  e.currentTarget.style.borderColor = invalid
    ? "rgba(220,80,80,0.5)"
    : "rgba(80,100,200,0.22)";
};

function ContactAddressStep({ form, updateField }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: 4,
          letterSpacing: "-0.01em",
        }}
      >
        Contact & Address
      </h2>

      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          color: "rgba(150,170,220,0.55)",
          marginBottom: 22,
        }}
      >
        These fields are optional. Leave them blank if you want them sent as null.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Contact name</label>
        <input
          type="text"
          placeholder="Enter your preferred name"
          value={form.contact_name}
          onChange={(e) => updateField("contact_name", e.target.value)}
          style={inputStyle}
          onFocus={focus}
          onBlur={(e) => blur(e)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Contact email</label>
          <input
            type="email"
            placeholder="Enter your contact email"
            value={form.contact_email}
            onChange={(e) => updateField("contact_email", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
        <div>
          <label style={labelStyle}>Telephone</label>
          <input
            type="text"
            placeholder="+61 4XX XXX XXX"
            value={form.contact_telephone}
            onChange={(e) => updateField("contact_telephone", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Street</label>
        <input
          type="text"
          placeholder="Enter your street address"
          value={form.street}
          onChange={(e) => updateField("street", e.target.value)}
          style={inputStyle}
          onFocus={focus}
          onBlur={(e) => blur(e)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>City</label>
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
        <div>
          <label style={labelStyle}>State</label>
          <input
            type="text"
            placeholder="State code"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Postal code</label>
          <input
            type="text"
            placeholder="Postal Code"
            value={form.postal_code}
            onChange={(e) => updateField("postal_code", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
        <div>
          <label style={labelStyle}>Country code</label>
          <input
            type="text"
            placeholder="Country Code"
            value={form.country_code}
            onChange={(e) => updateField("country_code", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
      </div>
    </div>
  );
}

function TaxSchemeStep({ form, updateField }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: 4,
          letterSpacing: "-0.01em",
        }}
      >
        Tax Scheme
      </h2>

      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          color: "rgba(150,170,220,0.55)",
          marginBottom: 22,
        }}
      >
        These fields are optional too. Empty values will be sent as null.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Registration name</label>
        <input
          type="text"
          placeholder="Enter your Company's name"
          value={form.registration_name}
          onChange={(e) => updateField("registration_name", e.target.value)}
          style={inputStyle}
          onFocus={focus}
          onBlur={(e) => blur(e)}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Company ID</label>
        <input
          type="text"
          placeholder="Company ID"
          value={form.company_id}
          onChange={(e) => updateField("company_id", e.target.value)}
          style={inputStyle}
          onFocus={focus}
          onBlur={(e) => blur(e)}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Exemption reason</label>
        <input
          type="text"
          placeholder="Optional"
          value={form.exemption_reason}
          onChange={(e) => updateField("exemption_reason", e.target.value)}
          style={inputStyle}
          onFocus={focus}
          onBlur={(e) => blur(e)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Scheme ID</label>
          <input
            type="text"
            placeholder="GST"
            value={form.scheme_id}
            onChange={(e) => updateField("scheme_id", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
        <div>
          <label style={labelStyle}>Tax type code</label>
          <input
            type="text"
            placeholder="GST"
            value={form.tax_type_code}
            onChange={(e) => updateField("tax_type_code", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "rgba(55,80,200,0.08)",
          border: "1px solid rgba(80,110,220,0.15)",
          borderRadius: 8,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            flexShrink: 0,
            marginTop: 1,
            background: "rgba(74,127,212,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "rgba(140,175,255,0.8)",
          }}
        >
          i
        </div>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
            color: "rgba(140,165,230,0.5)",
            lineHeight: 1.6,
          }}
        >
          You can change these settings or logout from the settings page.
        </p>
      </div>
    </div>
  );
}

function LaterStepCard({
  step,
  totalSteps,
  children,
  onBack,
  onNext,
  onSkipThis,
  onSkipAll,
  isLast,
  loading,
}) {
  return (
    <div
      style={{
        background: "rgba(6,5,20,0.72)",
        border: "1px solid rgba(80,110,220,0.18)",
        borderRadius: 22,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(80,110,255,0.08)",
        backdropFilter: "blur(20px)",
        padding: "44px 40px",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          height: 1,
          background: "linear-gradient(to right,transparent,rgba(100,140,255,0.4),transparent)",
          marginBottom: 26,
        }}
      />

      <ProgressBar step={step} total={totalSteps} />

      <div style={{ animation: "fadeSlideIn 0.35s ease forwards" }}>{children}</div>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(10,10,28,0.55)",
              border: "1px solid rgba(80,100,200,0.22)",
              borderRadius: 9,
              padding: "10px 18px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: "rgba(175,195,255,0.55)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: loading
                ? "linear-gradient(135deg,#334155,#475569)"
                : "linear-gradient(135deg,#3552d8,#4c3bbe)",
              color: "#fff",
              borderRadius: 9,
              padding: "11px 20px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(55,80,210,0.3)",
            }}
          >
            {isLast ? (loading ? "Creating account..." : "Finish") : "Continue"} <ArrowRight size={14} />
          </button>
        </div>

        {!isLast && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onSkipThis}
              style={{
                flex: 1,
                padding: "9px 12px",
                background: "transparent",
                border: "1px solid rgba(80,100,200,0.15)",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(130,155,220,0.4)",
              }}
            >
              Skip this page
            </button>

            <button
              type="button"
              onClick={onSkipAll}
              disabled={loading}
              style={{
                flex: 1,
                padding: "9px 12px",
                background: "transparent",
                border: "1px solid rgba(80,100,200,0.15)",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(130,155,220,0.4)",
              }}
            >
              Skip all
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          height: 1,
          background: "linear-gradient(to right,transparent,rgba(80,110,255,0.25),transparent)",
          marginTop: 28,
        }}
      />
    </div>
  );
}

function RegisterCard() {
  const router = useRouter();

  const totalSteps = 3;
  const [step, setStep] = useState(1);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    party_name: "",
    customer_assigned_account_id: "",

    contact_name: "",
    contact_email: "",
    contact_telephone: "",

    street: "",
    city: "",
    state: "",
    postal_code: "",
    country_code: "AU",

    registration_name: "",
    company_id: "",
    exemption_reason: "",
    scheme_id: "GST",
    tax_type_code: "GST",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/orders");
    }
  }, [router]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  function validateFirstStep() {
    if (
      !form.email ||
      !form.username ||
      !form.password ||
      !form.confirmPassword ||
      !form.party_name ||
      !form.customer_assigned_account_id
    ) {
      setError("Please fill all required fields");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  }

  async function submitRegistration(options = {}) {
    const {
      nullContact = false,
      nullAddress = false,
      nullTax = false,
    } = options;

    setLoading(true);
    setError("");

    try {
      const payload = {
        email: form.email,
        username: form.username,
        password: form.password,
        seller: {
          party_name: form.party_name,
          customer_assigned_account_id: form.customer_assigned_account_id,
          contact: {
            name: nullContact ? null : form.contact_name || null,
            email: nullContact ? null : form.contact_email || null,
            telephone: nullContact ? null : form.contact_telephone || null,
          },
          address: {
            street: nullAddress ? null : form.street || null,
            city: nullAddress ? null : form.city || null,
            state: nullAddress ? null : form.state || null,
            postal_code: nullAddress ? null : form.postal_code || null,
            country_code: nullAddress ? null : form.country_code || null,
          },
          tax_scheme: {
            registration_name: nullTax ? null : form.registration_name || null,
            company_id: nullTax ? null : form.company_id || null,
            exemption_reason: nullTax ? null : form.exemption_reason || null,
            scheme_id: nullTax ? null : form.scheme_id || null,
            tax_type_code: nullTax ? null : form.tax_type_code || null,
          },
        },
      };

      const data = await registerUser(payload);

      setAuth({
        user: data.user,
        seller: data.seller,
      });

      router.push("/orders");
    } catch (err) {
      setError(err?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function handleFirstContinue() {
    if (!validateFirstStep()) return;
    setStep(2);
  }

  function handleBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleNextLater() {
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function handleSkipThis() {
    if (step === 2) {
      setStep(3);
    }
  }

  async function handleSkipAllFromStep2() {
    await submitRegistration({
      nullContact: true,
      nullAddress: true,
      nullTax: true,
    });
  }

  async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();

    if (!validateFirstStep()) {
      setStep(1);
      return;
    }

    await submitRegistration();
  }

  if (step === 2) {
    return (
      <LaterStepCard
        step={2}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNextLater}
        onSkipThis={handleSkipThis}
        onSkipAll={handleSkipAllFromStep2}
        isLast={false}
        loading={loading}
      >
        <ContactAddressStep form={form} updateField={updateField} />
      </LaterStepCard>
    );
  }

  if (step === 3) {
    return (
      <LaterStepCard
        step={3}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleSubmit}
        onSkipThis={() => {}}
        onSkipAll={() => {}}
        isLast={true}
        loading={loading}
      >
        <TaxSchemeStep form={form} updateField={updateField} />
      </LaterStepCard>
    );
  }

  return (
    <div
      style={{
        background: "rgba(6,5,20,0.72)",
        border: "1px solid rgba(80,110,220,0.18)",
        borderRadius: 22,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(80,110,255,0.08)",
        backdropFilter: "blur(20px)",
        padding: "44px 40px",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          height: 1,
          background: "linear-gradient(to right,transparent,rgba(100,140,255,0.4),transparent)",
          marginBottom: 26,
        }}
      />

      <div className="md:hidden flex justify-center mb-6">
        <Wordmark fontSize={36} />
      </div>

      <div style={{ marginTop: 18 }}>
        <ProgressBar step={step} total={totalSteps} />
      </div>

      <form onSubmit={handleSubmit}>
        <h2
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          Create your account
        </h2>

        <p
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontSize: 13,
            color: "rgba(150,170,220,0.55)",
            marginBottom: 24,
          }}
        >
          Get started with cLOUDy today.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Email <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="yEnter your email address"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Username <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter you username"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Company name <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="cLOUDyyyy Pty Ltd"
            value={form.party_name}
            onChange={(e) => updateField("party_name", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Customer assigned account ID <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="SELLER-010"
            value={form.customer_assigned_account_id}
            onChange={(e) => updateField("customer_assigned_account_id", e.target.value)}
            style={inputStyle}
            onFocus={focus}
            onBlur={(e) => blur(e)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Password <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              style={{ ...inputStyle, paddingRight: 42 }}
              onFocus={focus}
              onBlur={(e) => blur(e)}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(130,155,220,0.55)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Confirm password <span style={{ color: "#6080ff" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              style={{
                ...inputStyle,
                paddingRight: 42,
                borderColor: !passwordsMatch
                  ? "rgba(220,80,80,0.5)"
                  : "rgba(80,100,200,0.22)",
              }}
              onFocus={focus}
              onBlur={(e) => blur(e, !passwordsMatch)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(130,155,220,0.55)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {!passwordsMatch && (
            <p
              style={{
                fontSize: 11,
                color: "rgba(220,100,100,0.7)",
                marginTop: 4,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Passwords do not match
            </p>
          )}
        </div>

        {error ? (
          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: "#f87171",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {error}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleFirstContinue}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(135deg,#3552d8,#4c3bbe)",
              color: "#fff",
              borderRadius: 10,
              padding: "14px 20px",
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(55,80,210,0.3)",
              border: "none",
            }}
          >
            Continue <ArrowRight size={15} />
          </button>
        </div>
      </form>

      <div
        style={{
          height: 1,
          background: "linear-gradient(to right,transparent,rgba(80,110,255,0.25),transparent)",
          margin: "24px 0 0",
        }}
      />

      <p
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 12,
          color: "rgba(100,120,170,0.4)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(120,160,255,0.6)",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(160,195,255,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(120,160,255,0.6)")}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default function CloudyRegister() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CloudyBackground />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {["tl", "tr", "bl", "br"].map((pos) => (
        <div
          key={pos}
          className="fixed pointer-events-none"
          style={{
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

      <div
        className="relative w-full h-full flex items-center"
        style={{
          zIndex: 2,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.6s ease, transform 1.6s ease",
        }}
      >
        <div className="flex-1 h-full">
          <BrandingPanel />
        </div>

        <div
          className="flex h-full w-1/2 items-center justify-center px-10 md:px-14 overflow-y-auto"
          style={{
            borderLeft: "1px solid rgba(80,110,220,0.14)",
          }}
        >
          <div className="w-full h-full flex items-center">
            <RegisterCard />
          </div>
        </div>
      </div>
    </div>
  );
}