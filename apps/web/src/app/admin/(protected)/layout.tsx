import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminProviders } from "@/components/admin/providers";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <Suspense fallback={<div style={{ padding: 24 }}>Chargement…</div>}>{children}</Suspense>
    </AdminProviders>
  );
}
