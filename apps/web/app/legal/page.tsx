import { fetchJson } from "@/lib/api";

type PageDoc = { title: string; body: string };

export default async function LegalPage() {
  let doc: PageDoc | null = null;
  try {
    doc = await fetchJson<PageDoc>("/public/pages/legal?locale=en");
  } catch {
    doc = null;
  }

  return (
    <div className="lux-main">
      <div className="lux-page">
        <h1>{doc?.title ?? "Legal"}</h1>
        <p className="lux-prose">{doc?.body ?? "Add a page with slug “legal” in admin."}</p>
      </div>
    </div>
  );
}
