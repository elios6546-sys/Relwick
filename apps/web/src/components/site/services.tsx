import { Apple, Laptop, Monitor, Smartphone } from "lucide-react";
import { Tag } from "@/components/ui/badge";

const SERVICES = [
  {
    n: "01",
    track: "services_card_web",
    icon: Monitor,
    title: "Sites web",
    text: "Site vitrine, portfolio, blog ou boutique en ligne. Rapide, lisible sur téléphone et facile à mettre à jour vous-même.",
    tags: ["Vitrine", "Boutique", "Portfolio"],
  },
  {
    n: "02",
    track: "services_card_android",
    icon: Smartphone,
    title: "Applications Android",
    text: "Votre application conçue pour les téléphones Android et publiée sur le Google Play Store.",
    tags: ["Google Play"],
  },
  {
    n: "03",
    track: "services_card_ios",
    icon: Apple,
    title: "Applications iOS",
    text: "La même application sur iPhone et iPad, publiée sur l’App Store après validation par Apple.",
    tags: ["App Store"],
  },
  {
    n: "04",
    track: "services_card_pc",
    icon: Laptop,
    title: "Logiciels PC",
    text: "Logiciels de bureau pour Windows, macOS et Linux : gestion, caisse, outils sur mesure.",
    tags: ["Windows", "macOS", "Linux"],
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      data-section="services"
      className="site-section site-container site-section-pad-lg"
    >
      <div className="site-section-head" data-rv="0">
        <div>
          <span className="site-eyebrow">Services</span>
          <h2 className="site-h2" style={{ maxWidth: 640 }}>
            Quatre plateformes, <span style={{ color: "var(--rw-primary)" }}>un seul interlocuteur.</span>
          </h2>
        </div>
        <p className="site-section-head__aside">
          Vous expliquez votre idée, nous nous occupons du reste : conception, développement,
          publication et suivi.
        </p>
      </div>
      <div className="services-grid">
        {SERVICES.map((svc, i) => (
          <div
            key={svc.track}
            className="rw-card rw-card--interactive svc-card"
            data-track={svc.track}
            data-rv={i * 90}
          >
            <div className="svc-card__top">
              <span className="svc-card__icon">
                <svc.icon size={24} strokeWidth={2} />
              </span>
              <span className="svc-card__num">{svc.n}</span>
            </div>
            <h3>{svc.title}</h3>
            <p>{svc.text}</p>
            <div className="svc-card__tags">
              {svc.tags.map((t) => (
                <Tag key={t} tone="neutral">
                  {t}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
