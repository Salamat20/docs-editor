import { cookies } from "next/headers";

// Simulated users (matches the seeded database users)
export const USERS = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
];

export async function getCurrentUser() {
  const store = await cookies();
  const id = store.get("userId")?.value;
  return USERS.find((u) => u.id === id) ?? null;
}