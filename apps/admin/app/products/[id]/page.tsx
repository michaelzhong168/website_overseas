"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
};

export default function EditProduct() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken() || !id) return;
    const res = await apiFetch("/admin/products?locale=en");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const rows: Row[] = await res.json();
    setRow(rows.find((p) => p.id === id) ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!row) return;
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "");
    const summary = String(fd.get("summary") ?? "");
    const description = String(fd.get("description") ?? "");
    const imageUrl = String(fd.get("imageUrl") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch(`/admin/products/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        summary,
        description,
        imageUrl,
        published,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      }),
    });
    if (res.ok) router.push("/products");
  }

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (!row)
    return (
      <main>
        <p className="muted">Not found.</p>
        <Link href="/products">Back</Link>
      </main>
    );

  return (
    <>
      <h1>Edit product</h1>
      <p className="muted">
        <Link href="/products">← Products</Link> · slug: <code>{row.slug}</code>
      </p>
      <form className="panel" onSubmit={save} style={{ maxWidth: "32rem" }}>
        <label>
          Title
          <input name="title" required defaultValue={row.title} />
        </label>
        <label>
          Summary
          <input name="summary" defaultValue={row.summary} />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={row.description} />
        </label>
        <label>
          Image URL
          <input name="imageUrl" defaultValue={row.imageUrl} />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={row.sortOrder} />
        </label>
        <label className="row-check">
          <input name="published" type="checkbox" defaultChecked={row.published} />
          Published
        </label>
        <button className="primary" type="submit">
          Save
        </button>
      </form>
    </>
  );
}
