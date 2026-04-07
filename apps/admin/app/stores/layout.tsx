import { AdminChrome } from "@/components/AdminChrome";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
