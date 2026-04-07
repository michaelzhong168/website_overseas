import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Item = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  coverUrl: string;
};

export default async function ProjectsPage() {
  let items: Item[] = [];
  try {
    items = await fetchJson<Item[]>("/public/projects?locale=en");
  } catch {
    items = [];
  }

  return (
    <div className="lux-main">
      <section className="lux-section" style={{ paddingTop: "3rem" }}>
        <div className="lux-section-head">
          <h1 className="lux-section-title">Spaces</h1>
        </div>
        <p className="muted" style={{ marginTop: "-1.5rem", marginBottom: "2rem" }}>
          Interiors featuring studio compositions. Content from admin.
        </p>
        <div className="lux-grid-3">
          {items.map((p) => (
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
                <h2 className="lux-tile-title">{p.title}</h2>
                <p className="lux-tile-meta">
                  {[p.subtitle, p.location].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </Link>
          ))}
          {items.length === 0 && <p className="muted">No projects yet.</p>}
        </div>
      </section>
    </div>
  );
}
