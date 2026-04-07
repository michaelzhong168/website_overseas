"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hoursNote: string;
  mapUrl: string;
  published: boolean;
  sortOrder: number;
};

export default function EditStore() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken() || !id) return;
    const res = await apiFetch("/admin/stores?locale=en");
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
    const name = String(fd.get("name") ?? "");
    const city = String(fd.get("city") ?? "");
    const country = String(fd.get("country") ?? "");
    const address = String(fd.get("address") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const hoursNote = String(fd.get("hoursNote") ?? "");
    const mapUrl = String(fd.get("mapUrl") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch(`/admin/stores/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        city,
        country,
        address,
        phone,
        hoursNote,
        mapUrl,
        published,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      }),
    });
    if (res.ok) router.push("/stores");
  }

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (!row)
    return (
      <main>
        <p className="muted">Not found.</p>
        <Link href="/stores">Back</Link>
      </main>
    );

  return (
    <>
      <h1>Edit showroom</h1>
      <p className="muted">
        <Link href="/stores">← Showrooms</Link> · slug: <code>{row.slug}</code>
      </p>
      <form className="panel" onSubmit={save} style={{ maxWidth: "32rem" }}>
        <label>
          Name
          <input name="name" required defaultValue={row.name} />
        </label>
        <label>
          City
          <input name="city" defaultValue={row.city} />
        </label>
        <label>
          Country
          <input name="country" defaultValue={row.country} />
        </label>
        <label>
          Address
          <input name="address" defaultValue={row.address} />
        </label>
        <label>
          Phone
          <input name="phone" defaultValue={row.phone} />
        </label>
        <label>
          Hours note
          <input name="hoursNote" defaultValue={row.hoursNote} />
        </label>
        <label>
          Map URL
          <input name="mapUrl" defaultValue={row.mapUrl} />
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
