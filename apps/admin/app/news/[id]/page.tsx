"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  published: boolean;
};

export default function EditNews() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken() || !id) return;
    const res = await apiFetch("/admin/news?locale=en");
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
    const excerpt = String(fd.get("excerpt") ?? "");
    const body = String(fd.get("body") ?? "");
    const coverUrl = String(fd.get("coverUrl") ?? "");
    const published = fd.get("published") === "on";
    const res = await apiFetch(`/admin/news/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, excerpt, body, coverUrl, published }),
    });
    if (res.ok) router.push("/news");
  }

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (!row)
    return (
      <main>
        <p className="muted">Not found.</p>
        <Link href="/news">Back</Link>
      </main>
    );

  return (
    <>
      <h1>Edit article</h1>
      <p className="muted">
        <Link href="/news">← News</Link> · slug: <code>{row.slug}</code>
      </p>
      <form className="panel" onSubmit={save} style={{ maxWidth: "32rem" }}>
        <label>
          Title
          <input name="title" required defaultValue={row.title} />
        </label>
        <label>
          Excerpt
          <input name="excerpt" defaultValue={row.excerpt} />
        </label>
        <label>
          Body
          <textarea name="body" defaultValue={row.body} />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" defaultValue={row.coverUrl} />
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
