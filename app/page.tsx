"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string; updated_at: string; owner_id?: string };
type User = { id: string; name: string };

const box = { border: "1px solid #444", borderRadius: 8, padding: 16, marginBottom: 20 };
const btn = { padding: "8px 14px", border: "1px solid #666", borderRadius: 6, cursor: "pointer", marginRight: 8 };

export default function Home() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [owned, setOwned] = useState<Item[]>([]);
  const [shared, setShared] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load my documents; if not logged in, go to the login page
  useEffect(() => {
    fetch("/api/documents")
      .then(async (res) => {
        if (res.status === 401) return router.push("/login");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user);
        setOwned(data.owned);
        setShared(data.shared);
      })
      .catch(() => setError("Could not load documents."))
      .finally(() => setLoading(false));
  }, [router]);

  async function createDoc() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled document" }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/docs/${data.id}`);
    else setError(data.error || "Could not create document.");
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so the same file can be picked again
    if (!file) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/docs/${data.id}`);
    else setError(data.error || "Upload failed.");
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/login");
  }

  if (loading) return <main style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</main>;

  const list = (items: Item[], empty: string, showOwner = false) =>
    items.length === 0 ? (
      <p style={{ opacity: 0.6 }}>{empty}</p>
    ) : (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((d) => (
          <li key={d.id} style={{ padding: "8px 0", borderBottom: "1px solid #333" }}>
            <Link href={`/docs/${d.id}`} style={{ fontWeight: 600 }}>{d.title}</Link>
            <span style={{ opacity: 0.6, fontSize: 13, marginLeft: 10 }}>
              {showOwner && d.owner_id ? `by ${d.owner_id} · ` : ""}
              edited {new Date(d.updated_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    );

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16, fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26 }}>My documents</h1>
        <div>
          <span style={{ marginRight: 12, opacity: 0.8 }}>Signed in as {user?.name}</span>
          <button onClick={logout} style={btn}>Log out</button>
        </div>
      </header>

      <div style={{ marginBottom: 24 }}>
        <button onClick={createDoc} disabled={busy} style={{ ...btn, opacity: busy ? 0.5 : 1 }}>+ New document</button>
        <button onClick={() => fileInput.current?.click()} disabled={busy} style={{ ...btn, opacity: busy ? 0.5 : 1 }}>
          Upload .txt / .md
        </button>
        <input ref={fileInput} type="file" accept=".txt,.md,.markdown" onChange={uploadFile} hidden />
      </div>

      {error && <p style={{ color: "crimson", marginBottom: 16 }}>{error}</p>}

      <section style={box}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Owned by me</h2>
        {list(owned, "No documents yet. Create one or upload a file.")}
      </section>

      <section style={box}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Shared with me</h2>
        {list(shared, "Nothing shared with you yet.", true)}
      </section>
    </main>
  );
}