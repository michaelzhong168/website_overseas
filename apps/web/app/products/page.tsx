import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Item = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string;
};

export default async function ProductsPage() {
  let items: Item[] = [];
  try {
    items = await fetchJson<Item[]>("/public/products?locale=en");
  } catch {
    items = [];
  }

  return (
    <>
      <section className="hero">
        <h1>Products</h1>
        <p className="muted">Published items from the admin.</p>
      </section>
      <div className="grid">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="card">
            <h2>{p.title}</h2>
            <p>{p.summary || "—"}</p>
          </Link>
        ))}
        {items.length === 0 && <p className="muted">No products yet.</p>}
      </div>
    </>
  );
}
