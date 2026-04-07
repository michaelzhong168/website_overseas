import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Store = {
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hoursNote: string;
  mapUrl: string;
};

export default async function StoreDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let row: Store | null = null;
  try {
    row = await fetchJson<Store>(`/public/stores/${slug}?locale=en`);
  } catch {
    row = null;
  }

  if (!row) {
    return (
      <div className="lux-main">
        <div className="lux-page">
          <p className="muted">Location not found.</p>
          <Link href="/stores">← Showrooms</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-main">
      <div className="lux-page">
        <p className="muted">
          <Link href="/stores">← Showrooms</Link>
        </p>
        <h1>{row.name}</h1>
        <p className="lux-lead">{[row.city, row.country].filter(Boolean).join(", ")}</p>
        {row.address && <p className="lux-prose">{row.address}</p>}
        {row.phone && <p className="lux-prose">{row.phone}</p>}
        {row.hoursNote && <p className="lux-prose">{row.hoursNote}</p>}
        {row.mapUrl && (
          <p style={{ marginTop: "1.5rem" }}>
            <a href={row.mapUrl} className="lux-link-all" rel="noopener noreferrer" target="_blank">
              Open map
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
