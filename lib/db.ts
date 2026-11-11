import { neon } from "@neondatabase/serverless";

// One shared database client, using the connection string from .env.local
export const sql = neon(process.env.DATABASE_URL!);

export type Doc = {
  id: string;
  title: string;
  content: string; // stored as HTML so formatting is preserved
  owner_id: string;
  created_at: string;
  updated_at: string;
};