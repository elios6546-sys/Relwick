"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const FACTS = [
  ["Basé à", "Kolwezi, RDC"],
  ["Métier", "Développeur professionnel"],
  ["Plateformes", "Web, Android, iOS, Windows, macOS, Linux"],
] as const;

const PHOTO_SRC = "/images/elios.webp";

export function APropos() {
  // La carte de marque reste visible tant que la photo n'est pas chargée ; si le fichier
  // n'existe pas encore, elle tient lieu de visuel.
  const [photo, setPhoto] = useState<"pending" | "ok" | "missing">("pending");

  return (
    <section
      id="apropos"
      data-section="apropos"
      className="site-section site-container site-section-pad"
    >
      <div className="site-split site-split--apropos">
        <div className="apropos-visual" data-rv="0">
          <div className="apropos-visual__frame">
            <div className="apropos-visual__back" aria-hidden="true">
              <span className="apropos-visual__spark" />
            </div>
            <div className="apropos-visual__photo">
              <div className="apropos-card" aria-hidden={photo === "ok"}>
                <Image
                  src="/brand/relwick-symbol-on-dark.svg"
                  alt=""
                  width={56}
                  height={72}
                  className="apropos-card__symbol"
                />
                <div className="apropos-card__footer">
                  <span className="apropos-card__rule" />
                  <p className="apropos-card__name">Elios Ngombe</p>
                  <p className="apropos-card__role">Fondateur et développeur</p>
                  <p className="apropos-card__place">Kolwezi · République démocratique du Congo</p>
                </div>
              </div>
              {photo !== "missing" ? (
                <Image
                  src={PHOTO_SRC}
                  alt="Elios Ngombe"
                  fill
                  sizes="(max-width: 639px) 340px, 460px"
                  onLoad={() => setPhoto("ok")}
                  onError={() => setPhoto("missing")}
                  className="apropos-visual__img"
                  data-loaded={photo === "ok"}
                  style={{ objectFit: "cover" }}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div>
          <span className="site-eyebrow" data-rv="0">
            À propos
          </span>
          <h2 className="site-h2" data-rv="80" style={{ marginBottom: 20 }}>
            Derrière Relwick, <span style={{ color: "var(--rw-primary)" }}>Elios Ngombe.</span>
          </h2>
          <p className="site-lead" data-rv="160" style={{ marginBottom: 16, maxWidth: 560 }}>
            Développeur professionnel basé à Kolwezi, je conçois et développe moi-même chaque
            projet : sites web, applications Android et iOS, logiciels PC.
          </p>
          <p className="site-body site-body--muted" data-rv="220" style={{ marginBottom: 32, maxWidth: 560 }}>
            Vous échangez directement avec la personne qui écrit le code, du premier appel à la mise
            en ligne.
          </p>
          <dl className="apropos-facts" data-rv="280">
            {FACTS.map(([dt, dd]) => (
              <div key={dt} style={{ display: "contents" }}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
          <div className="site-cta-row" data-rv="340" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button size="lg" arrow href="#contact" data-track="apropos_cta_appel" data-track-cta>
              Réserver un appel
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href="mailto:elios6546@gmail.com"
              data-track="apropos_cta_email"
            >
              <Mail size={18} strokeWidth={2} aria-hidden="true" />
              Écrire un e-mail
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
