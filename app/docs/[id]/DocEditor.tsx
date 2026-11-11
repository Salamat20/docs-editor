"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type User = { id: string; name: string };
const USERS: User[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
];
const btn = { padding: "6px 12px", border: "1px solid #666", borderRadius: 6, cursor: "pointer", marginRight: 6 };

function Toolbar({ editor }: { editor: Editor }) {
  const tool = (label: string, active: boolean, run: () => void) => (
    <button
      type="button"
      onClick={run}
      style={{ ...btn, background: active ? "#555" : "transparent", color: "inherit", fontWeight: 600 }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 8, borderBottom: "1px solid #444" }}>
      {tool("B", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
      {tool("I", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
      {tool("U", editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run())}
      {tool("H1", editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
      {tool("H2", editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
      {tool("• List", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
      {tool("1. List", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
    </div>
  );
}

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("none");
  const [ownerId, setOwnerId] = useState("");
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [shareTo, setShareTo] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false, // required for Next.js
    shouldRerenderOnTransaction: true, // keeps toolbar buttons highlighted correctly
    onUpdate: () => setDirty(true),
  });

  // Load the document once the editor is ready
  useEffect(() => {
    if (!editor) return;
    fetch(`/api/documents/${id}`)
      .then(async (res) => {
        if (res.status === 401) return router.push("/login");
        const data = await res.json();
        if (!res.ok) return setError(data.error || "Could not load document.");
        setTitle(data.doc.title);
        setRole(data.role);
        setOwnerId(data.doc.owner_id);
        setSharedWith(data.sharedWith);
        setMe(data.user);
        editor.commands.setContent(data.doc.content || "", { emitUpdate: false });
        setLoaded(true);
        setStatus("All changes saved");
      })
      .catch(() => setError("Could not load document."));
  }, [editor, id, router]);

  async function save() {
    if (!editor) return;
    if (!title.trim()) return setError("Title can't be empty.");
    setError("");
    setStatus("Saving…");
    const res = await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: editor.getHTML() }),
    });
    const data = await res.json();
    if (res.ok) {
      setDirty(false);
      setStatus("All changes saved");
    } else {
      setStatus("");
      setError(data.error || "Save failed.");
    }
  }

  async function share() {
    if (!shareTo) return;
    setError("");
    const res = await fetch(`/api/documents/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: shareTo }),
    });
    const data = await res.json();
    if (res.ok) {
      setSharedWith((s) => (s.includes(shareTo) ? s : [...s, shareTo]));
      setShareTo("");
    } else {
      setError(data.error || "Share failed.");
    }
  }

  const shareOptions = USERS.filter((u) => u.id !== ownerId && !sharedWith.includes(u.id));

  return (
    <main style={{ maxWidth: 860, margin: "30px auto", padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Link href="/">← All documents</Link>
        <span style={{ opacity: 0.7 }}>{me ? `Signed in as ${me.name}` : ""}</span>
      </div>

      {error && <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>}

      {loaded && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
              placeholder="Document title"
              style={{ flex: 1, fontSize: 22, fontWeight: 700, padding: 8, border: "1px solid #444", borderRadius: 6, background: "transparent", color: "inherit" }}
            />
            <button onClick={save} style={{ ...btn, fontWeight: 600 }}>Save</button>
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
            {dirty ? "Unsaved changes" : status} · You are the {role}
          </p>

          <div style={{ border: "1px solid #444", borderRadius: 8 }}>
            {editor && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
          </div>

          <section style={{ marginTop: 20, border: "1px solid #444", borderRadius: 8, padding: 16 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Sharing</h2>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
              Owner: {ownerId} · Shared with: {sharedWith.length ? sharedWith.join(", ") : "nobody yet"}
            </p>
            {role === "owner" ? (
              shareOptions.length > 0 ? (
                <div>
                  <select
                    value={shareTo}
                    onChange={(e) => setShareTo(e.target.value)}
                    style={{ padding: 6, marginRight: 8, background: "transparent", color: "inherit", border: "1px solid #666", borderRadius: 6 }}
                  >
                    <option value="">Choose a user…</option>
                    {shareOptions.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <button onClick={share} disabled={!shareTo} style={{ ...btn, opacity: shareTo ? 1 : 0.5 }}>Share</button>
                </div>
              ) : (
                <p style={{ fontSize: 14, opacity: 0.7 }}>Shared with everyone available.</p>
              )
            ) : (
              <p style={{ fontSize: 14, opacity: 0.7 }}>Only the owner can share this document.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}