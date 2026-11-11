import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

// List documents I own and documents shared with me
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const owned = await sql`
    SELECT id, title, updated_at FROM documents
    WHERE owner_id = ${user.id} ORDER BY updated_at DESC`;

  const shared = await sql`
    SELECT d.id, d.title, d.updated_at, d.owner_id FROM documents d
    JOIN document_shares s ON s.document_id = d.id
    WHERE s.user_id = ${user.id} ORDER BY d.updated_at DESC`;

  return NextResponse.json({ user, owned, shared });
}

// Create a new empty document
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title =
    typeof body?.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 200)
      : "Untitled document";

  const id = crypto.randomUUID();
  await sql`INSERT INTO documents (id, title, content, owner_id) VALUES (${id}, ${title}, '', ${user.id})`;
  return NextResponse.json({ id }, { status: 201 });
}