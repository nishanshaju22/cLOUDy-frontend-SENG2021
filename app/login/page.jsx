"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser } from "../../src/api/auth";
import { isLoggedIn, setAuth } from "../../src/lib/auth";

// ─── Full-page background canvas ──────────────────────────────────────────────
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
        const px = ((s.x + ox * (s.li + 1) * 18 + W * 0.5) % (W + 400) + (W + 400)) % (W + 400) - 180;
        const py = ((s.y - scrollY * s.sp + oy * (s.li + 1) * 10 + H * 0.5) % (H + 400) + (H + 400)) % (H + 400) - 180;
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

    const onMouseMove = (e) => {
      tax = -((e.clientX / window.innerWidth) * 2 - 1) * 1.1;
      tay = -((e.clientY / window.innerHeight) * 2 - 1) * 0.6;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);
    resize();
    animId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

// ─── Canvas wordmark ──────────────────────────────────────────────────────────
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

// ─── Left branding panel ──────────────────────────────────────────────────────
function BrandingPanel() {
  return (
    <div
      className="hidden md:flex items-center justify-center h-full w-full"
      style={{
        zIndex: 2,
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Wordmark fontSize={82} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
          <div style={{ width: 36, height: 1, background: "linear-gradient(to right,transparent,rgba(140,170,255,0.35))" }} />
          <div style={{ width: 4, height: 4, background: "rgba(155,185,255,0.45)", transform: "rotate(45deg)" }} />
          <div style={{ width: 36, height: 1, background: "linear-gradient(to left,transparent,rgba(140,170,255,0.35))" }} />
        </div>

        <p style={{ color: "rgba(195,215,255,0.65)", marginBottom: 8 }}>
          Sign in to manage your business
        </p>

        <p style={{ color: "rgba(150,175,255,0.38)", fontSize: 12 }}>
          Fast systems. LOUD results.
        </p>
      </div>
    </div>
  );
}
// ─── Main login page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/orders");
    }
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(login, password);
      setAuth({
        user: data.user,
        seller: data.seller,
      });
      router.push("/orders");
    } catch (err) {
      setError(err?.error || "Login failed");
    } finally {
      setLoading(false);
    }
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
    fontSize: 13,
    color: "rgba(160,180,240,0.65)",
    marginBottom: 6,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CloudyBackground />

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

        <div className="flex items-center justify-center h-full px-8 md:px-16" style={{ minWidth: 680 }}>
          <div
            style={{
              background: "rgba(6,5,20,0.72)",
              border: "1px solid rgba(80,110,220,0.18)",
              borderRadius: 22,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(80,110,255,0.08)",
              backdropFilter: "blur(20px)",
              padding: "48px 42px",
              width: "100%",
              maxWidth: 500,
            }}
          >
            <div
              style={{
                height: 1,
                background: "linear-gradient(to right,transparent,rgba(100,140,255,0.4),transparent)",
                marginBottom: 28,
              }}
            />

            <div className="md:hidden flex justify-center mb-6">
              <Wordmark fontSize={36} />
            </div>

            <h2
              style={{
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: 4,
                letterSpacing: "-0.01em",
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontSize: 14,
                color: "rgba(150,170,220,0.55)",
                marginBottom: 28,
              }}
            >
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  Username or email <span style={{ color: "#6080ff" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,140,255,0.6)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(80,100,200,0.22)")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Password <span style={{ color: "#6080ff" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 42 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(100,140,255,0.6)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(80,100,200,0.22)")}
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
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error ? (
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    color: "#f87171",
                    fontSize: 14,
                  }}
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: loading
                    ? "linear-gradient(135deg,#334155,#475569)"
                    : "linear-gradient(135deg,#3552d8,#4c3bbe)",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 4px 20px rgba(55,80,210,0.3)",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg,#4265f0,#5e50d0)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(55,80,210,0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "linear-gradient(135deg,#3552d8,#4c3bbe)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(55,80,210,0.3)";
                  }
                }}
              >
                {loading ? "Logging in..." : <>Sign in <ArrowRight size={15} /></>}
              </button>
            </form>

            <div
              style={{
                height: 1,
                background: "linear-gradient(to right,transparent,rgba(80,110,255,0.25),transparent)",
                margin: "28px 0 0",
              }}
            />

            <p
              style={{
                marginTop: 18,
                textAlign: "center",
                fontSize: 12,
                color: "rgba(100,120,170,0.4)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
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
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}