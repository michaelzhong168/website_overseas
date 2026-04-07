"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  locale: string;
};

export default function PagesAdmin() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const res = await apiFetch("/admin/pages?locale=en");
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
    const body = String(fd.get("body") ?? "");
    const published = fd.get("published") === "on";
    const res = await apiFetch("/admin/pages", {
      method: "POST",
      body: JSON.stringify({ slug, title, body, locale: "en", published }),
    });
    if (res.ok) {
      e.currentTarget.reset();
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this page?")) return;
    const res = await apiFetch(`/admin/pages/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <h1>Pages</h1>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Title</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.slug}</td>
                <td>
                  <Link href={`/pages/${r.id}`}>{r.title}</Link>
                </td>
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
        <h2>New page</h2>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Body
          <textarea name="body" />
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
