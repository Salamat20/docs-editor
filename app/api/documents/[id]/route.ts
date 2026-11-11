import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { loadDoc } from "@/lib/docs";
import { canView, canEdit } from "@/lib/access";

type Ctx = { params: Promise<{ id: string }> };

// Open a document
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const found = await loadDoc(id, user.id);
  // Same answer for "doesn't exist" and "no access", so we don't reveal which documents exist
  if (!found || !canView(found.role)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  return NextResponse.json({ user, doc: found.doc, role: found.role, sharedWith: found.sharedWith });
}

// Save title + content
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const found = await loadDoc(id, user.id);
  if (!found || !canEdit(found.role)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const title = body?.title;
  const content = body?.content;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title can't be empty." }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }
  if (content.length > 1_000_000) {
    return NextResponse.json({ error: "Document is too large." }, { status: 413 });
  }

  await sql`
    UPDATE documents
    SET title = ${title.trim().slice(0, 200)}, content = ${content}, updated_at = now()
    WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}