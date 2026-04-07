import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="lux-footer">
      <div className="lux-footer-inner">
        <div className="lux-footer-brand">Atelier Haus</div>
        <div className="lux-footer-links">
          <Link href="/legal">Legal</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <p className="lux-footer-copy">
          © {new Date().getFullYear()} Atelier Haus. Placeholder name for development.
        </p>
      </div>
    </footer>
  );
}
