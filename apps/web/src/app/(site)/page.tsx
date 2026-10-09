import { LandingPage } from "@/components/site/landing-page";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Relwick",
  description: "Agence de création de sites web et d'applications à Kolwezi",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolwezi",
    addressCountry: "CD",
  },
  telephone: "+243975993035",
  email: "elios6546@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
