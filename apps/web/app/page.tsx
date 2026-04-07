import Link from "next/link";
import { fetchJson } from "@/lib/api";

type HomePage = { title: string; body: string; heroImageUrl: string };
type ProductTeaser = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
};
type ProjectTeaser = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  coverUrl: string;
};
type NewsTeaser = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
};

async function safe<T>(path: string): Promise<T | null> {
  try {
    return await fetchJson<T>(path);
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const home = await safe<HomePage>("/public/pages/home?locale=en");
  const products = (await safe<ProductTeaser[]>("/public/products?locale=en")) ?? [];
  const projects = (await safe<ProjectTeaser[]>("/public/projects?locale=en")) ?? [];
  const news = (await safe<NewsTeaser[]>("/public/news?locale=en")) ?? [];

  const heroSrc =
    home?.heroImageUrl ||
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80";

  return (
    <div className="lux-main">
      <section className="lux-hero">
        <div className="lux-hero-media">
          <img src={heroSrc} alt="" />
        </div>
        <div className="lux-hero-overlay" />
        <div className="lux-hero-content">
          <p className="lux-hero-kicker">Furniture · Interiors</p>
          <h1 className="lux-hero-title">{home?.title ?? "Quiet rooms, lasting forms"}</h1>
          <p className="lux-hero-lead">
            {home?.body ??
              "Configure the home page in admin. Connect the API and seed the database for sample content."}
          </p>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-section-head">
          <h2 className="lux-section-title">Collections</h2>
          <Link href="/products" className="lux-link-all">
            View all
          </Link>
        </div>
        <div className="lux-grid-3">
          {products.slice(0, 3).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="lux-tile">
              <div className="lux-tile-media">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#ddd9d2" }} />
                )}
              </div>
              <div className="lux-tile-body">
                <p className="lux-tile-label">Piece</p>
                <h3 className="lux-tile-title">{p.title}</h3>
                <p className="lux-tile-meta">{p.summary || "—"}</p>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="muted" style={{ gridColumn: "1 / -1" }}>
              No published products yet.
            </p>
          )}
        </div>
      </section>

      <section className="lux-band">
        <div className="lux-band-inner">
          <p>
            Residential and contract environments. Materials, proportion, and light — replace this band
            copy in the home page body or add a dedicated page block when you extend the CMS.
          </p>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-section-head">
          <h2 className="lux-section-title">Spaces</h2>
          <Link href="/projects" className="lux-link-all">
            All projects
          </Link>
        </div>
        <div className="lux-grid-3">
          {projects.slice(0, 3).map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="lux-tile">
              <div className="lux-tile-media">
                {p.coverUrl ? (
                  <img src={p.coverUrl} alt="" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#c8c4bc" }} />
                )}
              </div>
              <div className="lux-tile-body">
                <p className="lux-tile-label">Project</p>
                <h3 className="lux-tile-title">{p.title}</h3>
                <p className="lux-tile-meta">
                  {[p.subtitle, p.location].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="muted" style={{ gridColumn: "1 / -1" }}>
              No projects yet.
            </p>
          )}
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-section-head">
          <h2 className="lux-section-title">Journal</h2>
          <Link href="/news" className="lux-link-all">
            Read more
          </Link>
        </div>
        <div className="lux-news-list">
          {news.slice(0, 4).map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="lux-news-row">
              <h3>{n.title}</h3>
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
          {news.length === 0 && <p className="muted">No journal entries yet.</p>}
        </div>
      </section>
    </div>
  );
}
