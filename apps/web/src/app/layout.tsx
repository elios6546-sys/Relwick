import type { Metadata } from "next";
import { instrumentSans, jetbrainsMono } from "@/lib/fonts";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Relwick — Sites web et applications à Kolwezi",
    template: "%s · Relwick",
  },
  description:
    "Agence de création de sites web et d'applications Android, iOS et PC à Kolwezi. Premier appel gratuit de 30 minutes.",
  icons: {
    icon: [{ url: "/brand/relwick-favicon.svg" }, { url: "/brand/favicon.svg" }],
    apple: [{ url: "/brand/relwick-app-icon-rounded.svg", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Relwick",
    title: "Relwick — Sites web et applications à Kolwezi",
    description:
      "Sites web et applications Android, iOS et PC pour particuliers et entreprises à Kolwezi.",
    images: [{ url: "/images/hero-montagnes.jpg", width: 1200, height: 630, alt: "Relwick" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
