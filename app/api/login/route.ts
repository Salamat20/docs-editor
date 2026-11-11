import { NextResponse } from "next/server";
import { USERS } from "@/lib/session";

// Log in as one of the seeded users (mocked auth)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = body?.userId;

  if (!USERS.some((u) => u.id === userId)) {
    return NextResponse.json({ error: "Unknown user." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("userId", userId, {
    httpOnly: true, // the browser's JavaScript can't read it
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

// Log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("userId");
  return res;
}