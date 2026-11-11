# Docs Editor

A lightweight collaborative document editor: create, edit, format, upload, and share documents.

Live demo: (add Vercel link here)

## Features
- Rich text editing with bold, italic, underline, headings (H1/H2), and bulleted/numbered lists
- Create, rename, edit, and save documents (saved to a Postgres database)
- Upload .txt or .md files, which become new editable documents
- Share a document with another user; shared documents appear under "Shared with me"
- Simulated login with three test users: Alice, Bob, Carol
- Automated tests for the sharing rules and file conversion

## How to run locally
1. Install Node.js (v20 or newer).
2. Run `npm install`.
3. Create a `.env.local` file with `DATABASE_URL=your-neon-postgres-connection-string`.
4. Set up the database: `node --env-file=.env.local scripts/setup-db.mjs`
5. Start the app: `npm run dev`, then open http://localhost:3000
6. Run the tests: `npm test`

## How to test sharing
1. Log in as Alice, create a document, then share it with Bob.
2. Log out and log in as Bob: the document appears under "Shared with me" and he can edit it.
3. Log in as Carol and open the same document URL: she gets "Document not found."

## Architecture
- Frontend: Next.js (App Router), React, TypeScript. The editor uses Tiptap.
- Backend: Next.js API routes in `app/api/`.
- Database: Neon serverless Postgres with three tables: `users`, `documents`, `document_shares`.
- Access rules: `lib/access.ts` holds the logic (owner, editor, none), kept as plain functions so it is easy to test.
- Documents are stored as HTML so formatting is preserved between sessions.

## Key decisions and tradeoffs
- Simulated login (cookie-based user picker) instead of real auth, to focus time on the core editing and sharing features.
- Shared users can view and edit; only the owner can share.
- Users without access get "Document not found" (404) rather than "Forbidden", so the app doesn't reveal which documents exist.
- Manual Save button instead of autosave, to keep save behavior simple and predictable.
- Uploads limited to .txt and .md (max 1 MB). Plain text is HTML-escaped to prevent script injection; Markdown is converted with `marked`.
- Next.js 16 Cache Components requires URL params inside a Suspense boundary, so the editor page is a small server wrapper around a client component.

## What I would add with more time
- Real authentication (e.g. Auth.js) and password-protected accounts
- Autosave and real-time collaboration (e.g. Yjs)
- View-only sharing and the ability to remove access
- .docx upload and export to PDF/Word
- Server-side HTML sanitization of saved content
- End-to-end tests (e.g. Playwright)

## How I used AI
I used AI assistants to plan the build, generate starter code, and debug errors (for example, the Next.js 16 Suspense requirement and a dependency version conflict). I reviewed, tested, and adjusted the code myself, and verified behavior manually and with automated tests.