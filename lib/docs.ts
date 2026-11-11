import { sql, type Doc } from "@/lib/db";
import { getRole } from "@/lib/access";

// Load a document plus who it's shared with, and work out this user's role
export async function loadDoc(id: string, userId: string | null) {
  const rows = (await sql`SELECT * FROM documents WHERE id = ${id}`) as Doc[];
  const doc = rows[0];
  if (!doc) return null;

  const shares = (await sql`SELECT user_id FROM document_shares WHERE document_id = ${id}`) as { user_id: string }[];
  const sharedWith = shares.map((s) => s.user_id);

  return { doc, sharedWith, role: getRole(doc.owner_id, sharedWith, userId) };
}