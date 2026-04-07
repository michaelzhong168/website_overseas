import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier Haus — Furniture & interiors",
  description: "Contemporary furniture and interior compositions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="lux-body">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
