"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  coverUrl: string;
  body: string;
  published: boolean;
  sortOrder: number;
};

export default function EditProject() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken() || !id) return;
    const res = await apiFetch("/admin/projects?locale=en");
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
    const subtitle = String(fd.get("subtitle") ?? "");
    const location = String(fd.get("location") ?? "");
    const coverUrl = String(fd.get("coverUrl") ?? "");
    const body = String(fd.get("body") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch(`/admin/projects/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
        subtitle,
        location,
        coverUrl,
        body,
        published,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      }),
    });
    if (res.ok) router.push("/projects");
  }

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (!row)
    return (
      <main>
        <p className="muted">Not found.</p>
        <Link href="/projects">Back</Link>
      </main>
    );

  return (
    <>
      <h1>Edit project</h1>
      <p className="muted">
        <Link href="/projects">← Projects</Link> · slug: <code>{row.slug}</code>
      </p>
      <form className="panel" onSubmit={save} style={{ maxWidth: "32rem" }}>
        <label>
          Title
          <input name="title" required defaultValue={row.title} />
        </label>
        <label>
          Subtitle
          <input name="subtitle" defaultValue={row.subtitle} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={row.location} />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" defaultValue={row.coverUrl} />
        </label>
        <label>
          Body
          <textarea name="body" defaultValue={row.body} />
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
