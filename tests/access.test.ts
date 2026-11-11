import { describe, it, expect } from "vitest";
import { getRole, canView, canEdit, canShare } from "../lib/access";

describe("getRole", () => {
  it("gives the owner the owner role", () => {
    expect(getRole("alice", [], "alice")).toBe("owner");
  });
  it("gives a shared user the editor role", () => {
    expect(getRole("alice", ["bob"], "bob")).toBe("editor");
  });
  it("gives an unshared user no access", () => {
    expect(getRole("alice", ["bob"], "carol")).toBe("none");
  });
  it("gives a logged-out user no access", () => {
    expect(getRole("alice", ["bob"], null)).toBe("none");
  });
});

describe("permissions", () => {
  it("owner can view, edit and share", () => {
    expect([canView("owner"), canEdit("owner"), canShare("owner")]).toEqual([true, true, true]);
  });
  it("editor can view and edit but not share", () => {
    expect([canView("editor"), canEdit("editor"), canShare("editor")]).toEqual([true, true, false]);
  });
  it("no role can do nothing", () => {
    expect([canView("none"), canEdit("none"), canShare("none")]).toEqual([false, false, false]);
  });
});