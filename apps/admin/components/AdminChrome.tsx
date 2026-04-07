"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, setToken } from "@/lib/api";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  function logout() {
    setToken(null);
    router.replace("/login");
  }

  if (!ready) return null;

  return (
    <>
      <header className="admin-top">
        <strong>CMS</strong>
        <nav>
          <Link href="/pages">Pages</Link>
          <Link href="/products">Products</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/stores">Stores</Link>
          <Link href="/news">News</Link>
          <Link href="/submissions">Submissions</Link>
        </nav>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>
      <main>{children}</main>
    </>
  );
}
