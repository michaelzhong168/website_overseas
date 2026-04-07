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
      <div className="lux-main">
        <div className="lux-page">
          <p className="muted">Piece not found.</p>
          <Link href="/products">← Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-main">
      <div className="lux-product-hero">
        <p className="muted" style={{ marginBottom: "1rem" }}>
          <Link href="/products">← Collections</Link>
        </p>
        <div className="lux-product-hero-grid">
          <div className="lux-product-visual">
            {product.imageUrl ? <img src={product.imageUrl} alt="" /> : null}
          </div>
          <div className="lux-product-detail">
            <p className="lux-tile-label" style={{ marginBottom: "0.5rem" }}>
              Piece
            </p>
            <h1>{product.title}</h1>
            <p className="lux-summary">{product.summary}</p>
            {product.description ? <p className="lux-prose">{product.description}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
