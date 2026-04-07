"use client";

import { useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const message = String(fd.get("message") ?? "");
    setStatus("loading");
    try {
      const res = await fetch(`${api}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="lux-main">
      <section className="lux-section" style={{ paddingTop: "3rem", maxWidth: "560px", margin: "0 auto" }}>
        <h1 className="lux-section-title">Contact</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          Messages are stored for the studio to review.
        </p>
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Message
            <textarea name="message" required />
          </label>
          <button className="primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send"}
          </button>
          {status === "ok" && <p className="muted">Sent. Thank you.</p>}
          {status === "err" && <p className="muted">Could not send. Try again later.</p>}
        </form>
      </section>
    </div>
  );
}
