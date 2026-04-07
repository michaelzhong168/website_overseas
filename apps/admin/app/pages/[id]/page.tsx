"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  locale: string;
};

export default function EditPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [row, setRow] = useState<PageRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken() || !id) return;
    const res = await apiFetch("/admin/pages?locale=en");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const rows: PageRow[] = await res.json();
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
    const body = String(fd.get("body") ?? "");
    const published = fd.get("published") === "on";
    const res = await apiFetch(`/admin/pages/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, body, published }),
    });
    if (res.ok) router.push("/pages");
  }

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (!row)
    return (
      <main>
        <p className="muted">Not found.</p>
        <Link href="/pages">Back</Link>
      </main>
    );

  return (
    <>
      <h1>Edit page</h1>
      <p className="muted">
        <Link href="/pages">← Pages</Link> · slug: <code>{row.slug}</code>
      </p>
      <form className="panel" onSubmit={save} style={{ maxWidth: "32rem" }}>
        <label>
          Title
          <input name="title" required defaultValue={row.title} />
        </label>
        <label>
          Body
          <textarea name="body" defaultValue={row.body} />
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
