"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../src/api/auth";
import { isLoggedIn, setAuth } from "../../src/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    party_name: "",
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

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: form.email,
        username: form.username,
        password: form.password,
        seller: {
          party_name: form.party_name,
          customer_assigned_account_id: `SELLER-${Date.now()}`,
          contact: {
            name: form.contact_name,
            email: form.contact_email,
            telephone: form.contact_telephone,
          },
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country_code: form.country_code,
          },
          tax_scheme: {
            registration_name: form.registration_name,
            company_id: form.company_id,
            exemption_reason: "",
            scheme_id: form.scheme_id,
            tax_type_code: form.tax_type_code,
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

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Create account</h1>

        <input placeholder="Email" value={form.email} onChange={(e) => updateField("email", e.target.value)} style={styles.input} />
        <input placeholder="Username" value={form.username} onChange={(e) => updateField("username", e.target.value)} style={styles.input} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => updateField("password", e.target.value)} style={styles.input} />

        <input placeholder="Company name" value={form.party_name} onChange={(e) => updateField("party_name", e.target.value)} style={styles.input} />
        <input placeholder="Contact name" value={form.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} style={styles.input} />
        <input placeholder="Contact email" value={form.contact_email} onChange={(e) => updateField("contact_email", e.target.value)} style={styles.input} />
        <input placeholder="Contact telephone" value={form.contact_telephone} onChange={(e) => updateField("contact_telephone", e.target.value)} style={styles.input} />

        <input placeholder="Street" value={form.street} onChange={(e) => updateField("street", e.target.value)} style={styles.input} />
        <input placeholder="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} style={styles.input} />
        <input placeholder="State" value={form.state} onChange={(e) => updateField("state", e.target.value)} style={styles.input} />
        <input placeholder="Postal code" value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} style={styles.input} />

        <input placeholder="Registration name" value={form.registration_name} onChange={(e) => updateField("registration_name", e.target.value)} style={styles.input} />
        <input placeholder="Company ID" value={form.company_id} onChange={(e) => updateField("company_id", e.target.value)} style={styles.input} />

        {error ? <p style={styles.error}>{error}</p> : null}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating..." : "Register"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={styles.linkButton}
        >
          Already have an account?
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  button: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  linkButton: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: 14,
  },
};