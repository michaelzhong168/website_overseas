import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Project = {
  title: string;
  subtitle: string;
  location: string;
  coverUrl: string;
  body: string;
};

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let row: Project | null = null;
  try {
    row = await fetchJson<Project>(`/public/projects/${slug}?locale=en`);
  } catch {
    row = null;
  }

  if (!row) {
    return (
      <div className="lux-main">
        <div className="lux-page">
          <p className="muted">Project not found.</p>
          <p>
            <Link href="/projects">← Spaces</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-main">
      <div className="lux-product-hero">
        <p className="muted" style={{ marginBottom: "1rem" }}>
          <Link href="/projects">← Spaces</Link>
        </p>
        <div className="lux-product-hero-grid">
          <div className="lux-product-visual">
            {row.coverUrl ? (
              <img src={row.coverUrl} alt="" />
            ) : null}
          </div>
          <div className="lux-product-detail">
            <p className="lux-tile-label" style={{ marginBottom: "0.5rem" }}>
              Project
            </p>
            <h1>{row.title}</h1>
            <p className="lux-summary">
              {[row.subtitle, row.location].filter(Boolean).join(" · ")}
            </p>
            {row.body ? <p className="lux-prose">{row.body}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
