import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Store = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hoursNote: string;
};

export default async function StoresPage() {
  let items: Store[] = [];
  try {
    items = await fetchJson<Store[]>("/public/stores?locale=en");
  } catch {
    items = [];
  }

  return (
    <div className="lux-main">
      <section className="lux-section" style={{ paddingTop: "3rem", maxWidth: "720px" }}>
        <h1 className="lux-section-title">Showrooms</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          Visit by appointment where noted. Replace with client locations in admin.
        </p>
        {items.map((s) => (
          <article key={s.id} className="lux-store-card">
            <h2>
              <Link href={`/stores/${s.slug}`}>{s.name}</Link>
            </h2>
            <p>
              {[s.city, s.country].filter(Boolean).join(", ")}
            </p>
            {s.address && <p>{s.address}</p>}
            {s.phone && <p>{s.phone}</p>}
            {s.hoursNote && <p>{s.hoursNote}</p>}
          </article>
        ))}
        {items.length === 0 && <p className="muted">No showrooms listed yet.</p>}
      </section>
    </div>
  );
}
