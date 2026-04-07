"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sortOrder: number;
};

export default function ProductsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const res = await apiFetch("/admin/products?locale=en");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const slug = String(fd.get("slug") ?? "");
    const title = String(fd.get("title") ?? "");
    const summary = String(fd.get("summary") ?? "");
    const description = String(fd.get("description") ?? "");
    const imageUrl = String(fd.get("imageUrl") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch("/admin/products", {
      method: "POST",
      body: JSON.stringify({
        slug,
        title,
        summary,
        description,
        imageUrl,
        locale: "en",
        published,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      }),
    });
    if (res.ok) {
      e.currentTarget.reset();
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <h1>Products</h1>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Title</th>
              <th>Order</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.slug}</td>
                <td>
                  <Link href={`/products/${r.id}`}>{r.title}</Link>
                </td>
                <td>{r.sortOrder}</td>
                <td>{r.published ? "yes" : "no"}</td>
                <td>
                  <button type="button" className="danger" onClick={() => remove(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form className="panel" onSubmit={create}>
        <h2>New product</h2>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Summary
          <input name="summary" />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <label>
          Image URL
          <input name="imageUrl" placeholder="https://…" />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" defaultValue={0} />
        </label>
        <label className="row-check">
          <input name="published" type="checkbox" />
          Published
        </label>
        <button className="primary" type="submit">
          Create
        </button>
      </form>
    </>
  );
}
