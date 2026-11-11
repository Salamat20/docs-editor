import { describe, it, expect } from "vitest";
import { textToHtml } from "../lib/convert";

describe("textToHtml", () => {
  it("turns blank-line-separated text into paragraphs", () => {
    expect(textToHtml("Hello\n\nWorld")).toBe("<p>Hello</p><p>World</p>");
  });
  it("keeps single line breaks inside a paragraph", () => {
    expect(textToHtml("line one\nline two")).toBe("<p>line one<br>line two</p>");
  });
  it("escapes HTML so uploaded files can't inject scripts", () => {
    expect(textToHtml("<script>alert(1)</script>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });
  it("returns nothing for an empty file", () => {
    expect(textToHtml("   \n\n   ")).toBe("");
  });
});