import Link from "next/link";
import { fetchJson } from "@/lib/api";

type PageDoc = { title: string; body: string };

export default async function HomePage() {
  let page: PageDoc | null = null;
  try {
    page = await fetchJson<PageDoc>("/public/pages/home?locale=en");
  } catch {
    page = null;
  }

  return (
    <>
      <section className="hero">
        <h1>{page?.title ?? "Home"}</h1>
        <p>
          {page?.body ??
            "Configure this page in the admin. API should be running with seeded data."}
        </p>
        <p className="muted" style={{ marginTop: "1rem" }}>
          <Link href="/products">View products</Link>
          {" · "}
          <Link href="/news">Read news</Link>
        </p>
      </section>
      <section>
        <h2 style={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: "1rem" }}>
          Explore
        </h2>
        <div className="grid">
          <Link href="/products" className="card">
            <h2>Products</h2>
            <p>Collections and pieces</p>
          </Link>
          <Link href="/news" className="card">
            <h2>News</h2>
            <p>Updates and stories</p>
          </Link>
          <Link href="/contact" className="card">
            <h2>Contact</h2>
            <p>Reach the studio</p>
          </Link>
        </div>
      </section>
    </>
  );
}
