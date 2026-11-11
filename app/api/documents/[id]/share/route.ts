import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser, USERS } from "@/lib/session";
import { loadDoc } from "@/lib/docs";
import { canView, canShare } from "@/lib/access";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const found = await loadDoc(id, user.id);
  if (!found || !canView(found.role)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  if (!canShare(found.role)) {
    return NextResponse.json({ error: "Only the owner can share this document." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const target = body?.userId;

  if (!USERS.some((u) => u.id === target)) {
    return NextResponse.json({ error: "Unknown user." }, { status: 400 });
  }
  if (target === found.doc.owner_id) {
    return NextResponse.json({ error: "You already own this document." }, { status: 400 });
  }

  await sql`
    INSERT INTO document_shares (document_id, user_id) VALUES (${id}, ${target})
    ON CONFLICT DO NOTHING`;
  return NextResponse.json({ ok: true });
}