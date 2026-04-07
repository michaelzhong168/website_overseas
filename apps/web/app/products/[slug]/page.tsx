import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Product = {
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
};

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await fetchJson<Product>(`/public/products/${slug}?locale=en`);
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <>
        <p className="muted">Product not found.</p>
        <p>
          <Link href="/products">Back to products</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p className="muted">
        <Link href="/products">← Products</Link>
      </p>
      <section className="hero" style={{ borderBottom: "none", marginBottom: 0 }}>
        <h1>{product.title}</h1>
        <p>{product.summary}</p>
      </section>
      {product.description && (
        <div style={{ maxWidth: "40rem", marginTop: "1rem" }}>
          <p style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
        </div>
      )}
    </>
  );
}
