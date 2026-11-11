import { NextResponse } from "next/server";
import { marked } from "marked";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { textToHtml } from "@/lib/convert";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const isMd = name.endsWith(".md") || name.endsWith(".markdown");
  const isTxt = name.endsWith(".txt");
  if (!isMd && !isTxt) {
    return NextResponse.json({ error: "Only .txt and .md files are supported." }, { status: 400 });
  }
  if (file.size > 1_000_000) {
    return NextResponse.json({ error: "File is too large (max 1 MB)." }, { status: 400 });
  }

  const text = await file.text();
  const content = isMd ? await marked.parse(text) : textToHtml(text);
  const title = file.name.replace(/\.(txt|md|markdown)$/i, "").trim() || "Imported document";

  const id = crypto.randomUUID();
  await sql`INSERT INTO documents (id, title, content, owner_id) VALUES (${id}, ${title.slice(0, 200)}, ${content}, ${user.id})`;
  return NextResponse.json({ id }, { status: 201 });
}