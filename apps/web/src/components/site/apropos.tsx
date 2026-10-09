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

export function APropos() {
  const [hasPhoto, setHasPhoto] = useState(false);

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
              {hasPhoto ? (
                <Image
                  src="/images/elios.webp"
                  alt="Elios Ngombe"
                  fill
                  sizes="460px"
                  onError={() => setHasPhoto(false)}
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
          <p
            data-rv="160"
            style={{
              fontSize: "var(--fs-lead)",
              lineHeight: 1.5,
              margin: "0 0 16px",
              maxWidth: 560,
              textWrap: "pretty",
            }}
          >
            Développeur professionnel basé à Kolwezi, je conçois et développe moi-même chaque
            projet : sites web, applications Android et iOS, logiciels PC.
          </p>
          <p
            data-rv="220"
            style={{
              margin: "0 0 32px",
              maxWidth: 560,
              color: "var(--rw-text-muted)",
              textWrap: "pretty",
            }}
          >
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
          <div data-rv="340" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
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
