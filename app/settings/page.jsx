"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  MapPin,
  Receipt,
  Shield,
  Save,
  LogOut,
  Check,
} from "lucide-react";
import { getAuth, setAuth, clearAuth, isLoggedIn } from "../../src/lib/auth";
import { updateSellerSettings } from "../../src/api/seller";
import Sidebar from "../../src/components/ui/Sidebar";

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
      { y: 0.62, speed: 0.18, scale: 1.0, alpha: 0.11, color: [80, 100, 200] },
      { y: 0.68, speed: 0.28, scale: 1.3, alpha: 0.15, color: [60, 80, 180] },
      { y: 0.74, speed: 0.38, scale: 1.55, alpha: 0.18, color: [40, 55, 160] },
      { y: 0.8, speed: 0.55, scale: 1.8, alpha: 0.26, color: [25, 35, 130] },
      { y: 0.87, speed: 0.75, scale: 2.1, alpha: 0.35, color: [15, 20, 100] },
      { y: 0.93, speed: 1.0, scale: 2.5, alpha: 0.5, color: [8, 10, 70] },
      { y: 1.0, speed: 1.3, scale: 3.0, alpha: 0.75, color: [4, 5, 40] },
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
      hg.addColorStop(0, "rgba(50,30,140,0.22)");
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

const inputStyle = {
  width: "100%",
  background: "rgba(10,10,28,0.55)",
  border: "1px solid rgba(80,100,200,0.2)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  color: "#d1d5db",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  backdropFilter: "blur(4px)",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.04em",
  color: "rgba(150,175,230,0.5)",
  marginBottom: 5,
  textTransform: "uppercase",
  fontFamily: "system-ui, sans-serif",
};

function focusIn(e) {
  e.currentTarget.style.borderColor = "rgba(100,140,255,0.55)";
}

function focusOut(e) {
  e.currentTarget.style.borderColor = "rgba(80,100,200,0.2)";
}

function Section({ icon, title, children }) {
  return (
    <div
      style={{
        background: "rgba(6,5,20,0.65)",
        border: "1px solid rgba(80,110,220,0.16)",
        borderRadius: 14,
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 20px",
          borderBottom: "1px solid rgba(80,100,200,0.12)",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: "rgba(55,80,200,0.18)",
            border: "1px solid rgba(90,120,220,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(140,175,255,0.65)",
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(200,215,255,0.8)",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SaveToast({ show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        background: "rgba(6,5,20,0.9)",
        border: "1px solid rgba(80,130,220,0.3)",
        borderRadius: 10,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        opacity: show ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#3552d8,#4c3bbe)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={11} color="#fff" />
      </div>
      <span
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          color: "rgba(200,215,255,0.85)",
        }}
      >
        Changes saved successfully
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [authData, setAuthData] = useState(null);
  const [sellerId, setSellerId] = useState("");

  const [form, setForm] = useState({
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

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const auth = getAuth();
    setAuthData(auth);

    const seller = auth?.seller || {};
    setSellerId(seller.seller_id || seller.sellerId || "");

    setForm({
      party_name: seller.party_name || "",
      customer_assigned_account_id: seller.customer_assigned_account_id || "",

      contact_name: seller.contact?.name || "",
      contact_email: seller.contact?.email || "",
      contact_telephone: seller.contact?.telephone || "",

      street: seller.address?.street || "",
      city: seller.address?.city || "",
      state: seller.address?.state || "",
      postal_code: seller.address?.postal_code || "",
      country_code: seller.address?.country_code || "AU",

      registration_name: seller.tax_scheme?.registration_name || "",
      company_id: seller.tax_scheme?.company_id || "",
      exemption_reason: seller.tax_scheme?.exemption_reason || "",
      scheme_id: seller.tax_scheme?.scheme_id || "GST",
      tax_type_code: seller.tax_scheme?.tax_type_code || "GST",
    });

    const t = setTimeout(() => setVisible(true), 350);
    return () => clearTimeout(t);
  }, [router]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function hasAny(values) {
    return values.some((v) => String(v || "").trim() !== "");
  }

  async function handleSave() {
    if (!sellerId) {
      setError("Seller ID not found in local storage");
      return;
    }

    setLoading(true);
    setError("");

    const hasContact = hasAny([form.contact_name, form.contact_email, form.contact_telephone]);
    const hasAddress = hasAny([form.street, form.city, form.state, form.postal_code, form.country_code]);
    const hasTax = hasAny([
      form.registration_name,
      form.company_id,
      form.exemption_reason,
      form.scheme_id,
      form.tax_type_code,
    ]);

    const payload = {
      party_name: form.party_name,
      customer_assigned_account_id: form.customer_assigned_account_id,
      contact: hasContact
        ? {
            name: form.contact_name || null,
            email: form.contact_email || null,
            telephone: form.contact_telephone || null,
          }
        : null,
      address: hasAddress
        ? {
            street: form.street || null,
            city: form.city || null,
            state: form.state || null,
            postal_code: form.postal_code || null,
            country_code: form.country_code || null,
          }
        : null,
      tax_scheme: hasTax
        ? {
            registration_name: form.registration_name || null,
            company_id: form.company_id || null,
            exemption_reason: form.exemption_reason || null,
            scheme_id: form.scheme_id || null,
            tax_type_code: form.tax_type_code || null,
          }
        : null,
    };

    try {
      await updateSellerSettings(sellerId, payload);

      const currentAuth = getAuth();
      const updatedSeller = {
        ...(currentAuth?.seller || {}),
        party_name: form.party_name,
        customer_assigned_account_id: form.customer_assigned_account_id,
        contact: hasContact
          ? {
              name: form.contact_name || null,
              email: form.contact_email || null,
              telephone: form.contact_telephone || null,
            }
          : null,
        address: hasAddress
          ? {
              street: form.street || null,
              city: form.city || null,
              state: form.state || null,
              postal_code: form.postal_code || null,
              country_code: form.country_code || null,
            }
          : null,
        tax_scheme: hasTax
          ? {
              registration_name: form.registration_name || null,
              company_id: form.company_id || null,
              exemption_reason: form.exemption_reason || null,
              scheme_id: form.scheme_id || null,
              tax_type_code: form.tax_type_code || null,
            }
          : null,
      };

      setAuth({
        ...currentAuth,
        seller: updatedSeller,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err?.error || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    localStorage.removeItem("auth");
    router.push("/login");
  }

  return (
    <div style = {{ display: "flex", minHeight: "100vh"}}>
        <Sidebar />
    
        <div className="relative min-h-screen overflow-x-hidden" style={{ flex: 1 }}>
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
            className="relative flex justify-center px-4 py-10"
            style={{
            zIndex: 2,
            minHeight: "100vh",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 1.2s ease, transform 1.2s ease",
            }}
        >
            <div style={{ width: "100%", maxWidth: 1240 }}>
            <div style={{ marginBottom: 24 }}>
                <h1
                style={{
                    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#f1f5f9",
                    marginBottom: 6,
                }}
                >
                Settings
                </h1>
                <p
                style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 13,
                    color: "rgba(150,170,220,0.5)",
                }}
                >
                View your account info and update your seller details.
                </p>
            </div>

            <div
                style={{
                display: "grid",
                gridTemplateColumns: "320px minmax(0,1fr)",
                gap: 18,
                alignItems: "start",
                }}
            >
                <div>
                <Section icon={<User size={15} />} title="Account">
                    <Field label="Username">
                    <input
                        type="text"
                        value={authData?.user?.username || ""}
                        readOnly
                        style={{ ...inputStyle, opacity: 0.85 }}
                    />
                    </Field>

                    <Field label="Email">
                    <input
                        type="email"
                        value={authData?.user?.email || ""}
                        readOnly
                        style={{ ...inputStyle, opacity: 0.85 }}
                    />
                    </Field>

                    <div
                    style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(55,80,200,0.08)",
                        border: "1px solid rgba(80,110,220,0.14)",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 12,
                        color: "rgba(140,165,230,0.55)",
                        lineHeight: 1.6,
                    }}
                    >
                    You can change your information or sign out on this page
                    </div>
                </Section>

                <Section icon={<LogOut size={15} />} title="Session">
                    <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "rgba(180,40,40,0.12)",
                        border: "1px solid rgba(200,80,80,0.22)",
                        borderRadius: 9,
                        padding: "10px 18px",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(220,130,130,0.75)",
                        cursor: "pointer",
                    }}
                    >
                    <LogOut size={14} /> Sign out
                    </button>
                </Section>
                </div>

                <div>
                <Section icon={<Building2 size={15} />} title="Seller Information">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Company name">
                        <input
                        type="text"
                        value={form.party_name}
                        onChange={(e) => updateField("party_name", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Customer assigned account ID">
                        <input
                        type="text"
                        value={form.customer_assigned_account_id}
                        onChange={(e) => updateField("customer_assigned_account_id", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>
                    </div>
                </Section>

                <Section icon={<User size={15} />} title="Contact">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <Field label="Name">
                        <input
                        type="text"
                        value={form.contact_name}
                        onChange={(e) => updateField("contact_name", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Email">
                        <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => updateField("contact_email", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Telephone">
                        <input
                        type="text"
                        value={form.contact_telephone}
                        onChange={(e) => updateField("contact_telephone", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>
                    </div>
                </Section>

                <Section icon={<MapPin size={15} />} title="Address">
                    <Field label="Street">
                    <input
                        type="text"
                        value={form.street}
                        onChange={(e) => updateField("street", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                    />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                    <Field label="City">
                        <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="State">
                        <input
                        type="text"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Postal code">
                        <input
                        type="text"
                        value={form.postal_code}
                        onChange={(e) => updateField("postal_code", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Country code">
                        <input
                        type="text"
                        value={form.country_code}
                        onChange={(e) => updateField("country_code", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>
                    </div>
                </Section>

                <Section icon={<Receipt size={15} />} title="Tax Scheme">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Registration name">
                        <input
                        type="text"
                        value={form.registration_name}
                        onChange={(e) => updateField("registration_name", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Company ID">
                        <input
                        type="text"
                        value={form.company_id}
                        onChange={(e) => updateField("company_id", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>
                    </div>

                    <Field label="Exemption reason">
                    <input
                        type="text"
                        value={form.exemption_reason}
                        onChange={(e) => updateField("exemption_reason", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                    />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Scheme ID">
                        <input
                        type="text"
                        value={form.scheme_id}
                        onChange={(e) => updateField("scheme_id", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>

                    <Field label="Tax type code">
                        <input
                        type="text"
                        value={form.tax_type_code}
                        onChange={(e) => updateField("tax_type_code", e.target.value)}
                        style={inputStyle}
                        onFocus={focusIn}
                        onBlur={focusOut}
                        />
                    </Field>
                    </div>
                </Section>

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

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
                    <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: loading
                        ? "linear-gradient(135deg,#334155,#475569)"
                        : "linear-gradient(135deg,#3552d8,#4c3bbe)",
                        color: "#fff",
                        borderRadius: 9,
                        padding: "12px 24px",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 18px rgba(55,80,210,0.3)",
                    }}
                    >
                    <Save size={14} />
                    {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>

        <SaveToast show={showToast} />
        </div>
    </div>
    );
}