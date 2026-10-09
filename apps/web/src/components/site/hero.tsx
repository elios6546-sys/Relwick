"use client";

import { PhoneCall } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const WORDS = ["Votre", "site,", "vos", "applications."];
const ACCENT = ["Bien", "faits."];

function Word({ children, index }: { children: string; index: number }) {
  return (
    <span className="hero-word">
      <span className="hero-word__inner" style={{ animationDelay: `${160 + index * 90}ms` }}>
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);

  // Parallaxe douce de la photo (désactivée si l'utilisateur réduit les animations).
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.scrollY, 1000));
      el.style.translate = `0 ${(y * 0.3).toFixed(1)}px`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="accueil" data-section="hero" className="hero-panel site-section">
      <div ref={mediaRef} className="hero-panel__media">
        <Image
          src="/images/hero-montagnes.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
      </div>
      <div className="site-container">
        <div className="hero-panel__box" data-theme="dark">
          <div className="hero-panel__glass" aria-hidden="true" />
          <div className="hero-panel__content">
            <span className="site-eyebrow hero-fade" style={{ marginBottom: 20 }}>
              Agence web &amp; mobile · Kolwezi
            </span>
            <h1>
              {WORDS.map((w, i) => (
                <span key={w}>
                  <Word index={i}>{w}</Word>{" "}
                </span>
              ))}
              <span className="hero-title-accent">
                {ACCENT.map((w, i) => (
                  <span key={w}>
                    <Word index={WORDS.length + i}>{w}</Word>
                    {i < ACCENT.length - 1 ? " " : null}
                  </span>
                ))}
              </span>
            </h1>
            <p className="hero-lead hero-fade" style={{ animationDelay: "560ms" }}>
              Nous créons des sites web et des applications Android, iOS et PC pour les particuliers
              et les entreprises. Un seul interlocuteur, de la maquette à la mise en ligne.
            </p>
            <div className="hero-actions hero-fade" style={{ animationDelay: "680ms" }}>
              <Button size="lg" arrow href="#contact" data-track="hero_cta_appel" data-track-cta>
                Réserver un appel
              </Button>
              <Button size="lg" variant="secondary" href="#services" data-track="hero_cta_services">
                Voir les services
              </Button>
            </div>
            <p className="hero-note hero-fade" style={{ animationDelay: "800ms" }}>
              <PhoneCall size={16} strokeWidth={2} aria-hidden="true" />
              <span>Premier appel gratuit de 30 minutes, sans engagement.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
