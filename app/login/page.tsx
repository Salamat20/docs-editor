"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function login(userId: string) {
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Login failed. Try again.");
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Sign in</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Demo app: choose a test user. (Simulated login, no password.)
      </p>
      {USERS.map((u) => (
        <button
          key={u.id}
          onClick={() => login(u.id)}
          style={{ display: "block", width: "100%", padding: 12, marginBottom: 10, border: "1px solid #666", borderRadius: 6, cursor: "pointer" }}
        >
          Continue as {u.name}
        </button>
      ))}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}