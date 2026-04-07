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

export default function ProjectsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const res = await apiFetch("/admin/projects?locale=en");
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
    const subtitle = String(fd.get("subtitle") ?? "");
    const location = String(fd.get("location") ?? "");
    const coverUrl = String(fd.get("coverUrl") ?? "");
    const body = String(fd.get("body") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch("/admin/projects", {
      method: "POST",
      body: JSON.stringify({
        slug,
        title,
        subtitle,
        location,
        coverUrl,
        body,
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
    if (!confirm("Delete this project?")) return;
    const res = await apiFetch(`/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <h1>Projects</h1>
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
                  <Link href={`/projects/${r.id}`}>{r.title}</Link>
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
        <h2>New project</h2>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Subtitle
          <input name="subtitle" />
        </label>
        <label>
          Location
          <input name="location" />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" placeholder="https://…" />
        </label>
        <label>
          Body
          <textarea name="body" />
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
