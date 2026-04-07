"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

type Row = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  published: boolean;
  sortOrder: number;
};

export default function StoresAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) return;
    const res = await apiFetch("/admin/stores?locale=en");
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
    const name = String(fd.get("name") ?? "");
    const city = String(fd.get("city") ?? "");
    const country = String(fd.get("country") ?? "");
    const address = String(fd.get("address") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const hoursNote = String(fd.get("hoursNote") ?? "");
    const mapUrl = String(fd.get("mapUrl") ?? "");
    const sortOrder = Number(fd.get("sortOrder") ?? 0);
    const published = fd.get("published") === "on";
    const res = await apiFetch("/admin/stores", {
      method: "POST",
      body: JSON.stringify({
        slug,
        name,
        city,
        country,
        address,
        phone,
        hoursNote,
        mapUrl,
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
    if (!confirm("Delete this store?")) return;
    const res = await apiFetch(`/admin/stores/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <>
      <h1>Showrooms</h1>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Name</th>
              <th>City</th>
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
                  <Link href={`/stores/${r.id}`}>{r.name}</Link>
                </td>
                <td>{r.city}</td>
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
        <h2>New showroom</h2>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          City
          <input name="city" />
        </label>
        <label>
          Country
          <input name="country" />
        </label>
        <label>
          Address
          <input name="address" />
        </label>
        <label>
          Phone
          <input name="phone" />
        </label>
        <label>
          Hours note
          <input name="hoursNote" />
        </label>
        <label>
          Map URL
          <input name="mapUrl" placeholder="https://…" />
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
