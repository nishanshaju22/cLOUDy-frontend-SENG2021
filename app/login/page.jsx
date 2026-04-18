"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../src/api/auth";
import { isLoggedIn, setAuth } from "../../src/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/orders");
    }
  }, [router]);

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

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <input
          type="text"
          placeholder="Username or email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error ? <p style={styles.error}>{error}</p> : null}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/register")}
          style={styles.linkButton}
        >
          Create account
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
    maxWidth: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
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