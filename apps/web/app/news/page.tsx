import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
};

export default async function NewsPage() {
  let items: Item[] = [];
  try {
    items = await fetchJson<Item[]>("/public/news?locale=en");
  } catch {
    items = [];
  }

  return (
    <>
      <section className="hero">
        <h1>News</h1>
        <p className="muted">Stories from the admin.</p>
      </section>
      <div className="grid">
        {items.map((n) => (
          <Link key={n.id} href={`/news/${n.slug}`} className="card">
            <h2>{n.title}</h2>
            <p>{n.excerpt || "—"}</p>
          </Link>
        ))}
        {items.length === 0 && <p className="muted">No news yet.</p>}
      </div>
    </>
  );
}
