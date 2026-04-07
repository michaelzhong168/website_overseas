"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/products", label: "Collections" },
  { href: "/projects", label: "Spaces" },
  { href: "/news", label: "Journal" },
  { href: "/stores", label: "Showrooms" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lux-header">
      <div className="lux-header-bar">
        <Link href="/" className="lux-logo" onClick={() => setOpen(false)}>
          Atelier Haus
        </Link>
        <button
          type="button"
          className="lux-menu-btn"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="lux-menu-icon" />
        </button>
        <nav className={`lux-nav ${open ? "lux-nav-open" : ""}`} aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
