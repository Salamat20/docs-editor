import { Suspense } from "react";
import DocPage from "./DocEditor";

// Wrapping the editor in Suspense lets Next.js read the URL (the document id) at runtime
export default function Page() {
  return (
    <Suspense fallback={<main style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</main>}>
      <DocPage />
    </Suspense>
  );
}