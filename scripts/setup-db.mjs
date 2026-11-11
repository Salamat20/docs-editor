import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Users (seeded test accounts)
await sql`CREATE TABLE IF NOT EXISTS users (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
)`;

// Documents, each with one owner
await sql`CREATE TABLE IF NOT EXISTS documents (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  owner_id   TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

// Sharing: which users can access which documents
await sql`CREATE TABLE IF NOT EXISTS document_shares (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (document_id, user_id)
)`;

// Seed three test users
await sql`INSERT INTO users (id, name) VALUES
  ('alice', 'Alice'), ('bob', 'Bob'), ('carol', 'Carol')
  ON CONFLICT (id) DO NOTHING`;

console.log("Database ready: tables created and users seeded.");