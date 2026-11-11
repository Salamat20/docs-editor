// Who can do what with a document.
// Decision: anyone a document is shared with can view AND edit it.
// Only the owner can share it with others.

export type Role = "owner" | "editor" | "none";

export function getRole(ownerId: string, sharedWith: string[], userId: string | null): Role {
  if (!userId) return "none";
  if (ownerId === userId) return "owner";
  if (sharedWith.includes(userId)) return "editor";
  return "none";
}

export const canView = (role: Role) => role !== "none";
export const canEdit = (role: Role) => role === "owner" || role === "editor";
export const canShare = (role: Role) => role === "owner";