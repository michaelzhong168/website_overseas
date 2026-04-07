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
    <div className="lux-main">
      <section className="lux-section" style={{ paddingTop: "3rem" }}>
        <h1 className="lux-section-title">Journal</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          News and notes from the studio.
        </p>
        <div className="lux-news-list">
          {items.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="lux-news-row">
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", margin: "0 0 0.35rem" }}>
                  {n.title}
                </h2>
                {n.excerpt && <p className="muted" style={{ margin: 0 }}>{n.excerpt}</p>}
              </div>
              <time dateTime={n.publishedAt ?? undefined}>
                {n.publishedAt
                  ? new Date(n.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </time>
            </Link>
          ))}
          {items.length === 0 && <p className="muted">No entries yet.</p>}
        </div>
      </section>
    </div>
  );
}
