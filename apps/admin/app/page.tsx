import Link from "next/link";

export default function AdminHome() {
  return (
    <main>
      <h1>Admin</h1>
      <p className="muted">Sign in to manage content.</p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/login" className="button-link" style={{ display: "inline-block" }}>
          Log in
        </Link>
      </p>
    </main>
  );
}
