"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
};

export default function NewsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const res = await apiFetch("/admin/news?locale=en");
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
    const excerpt = String(fd.get("excerpt") ?? "");
    const body = String(fd.get("body") ?? "");
    const coverUrl = String(fd.get("coverUrl") ?? "");
    const published = fd.get("published") === "on";
    const res = await apiFetch("/admin/news", {
      method: "POST",
      body: JSON.stringify({
        slug,
        title,
        excerpt,
        body,
        coverUrl,
        locale: "en",
        published,
      }),
    });
    if (res.ok) {
      e.currentTarget.reset();
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this article?")) return;
    const res = await apiFetch(`/admin/news/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <h1>News</h1>
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
                  <Link href={`/news/${r.id}`}>{r.title}</Link>
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
        <h2>New article</h2>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Excerpt
          <input name="excerpt" />
        </label>
        <label>
          Body
          <textarea name="body" />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" placeholder="https://…" />
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
