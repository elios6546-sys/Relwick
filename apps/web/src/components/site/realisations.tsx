"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { EventType } from "@relwick/shared";
import { Tabs } from "@/components/ui/tabs";
import { Tag } from "@/components/ui/badge";
import { ProjectPreview } from "@/components/site/project-preview";
import { REALISATIONS, type RealisationCategory } from "@/content/realisations";
import { track } from "@/lib/tracker";

const FILTERS: Array<{ value: RealisationCategory; label: string; track: string }> = [
  { value: "all", label: "Tout", track: "realisations_filter_all" },
  { value: "web", label: "Sites web", track: "realisations_filter_web" },
  { value: "mobile", label: "Applications", track: "realisations_filter_mobile" },
  { value: "pc", label: "Logiciels PC", track: "realisations_filter_pc" },
];

export function Realisations() {
  const [cat, setCat] = useState<RealisationCategory>("all");
  // Les cartes ne rejouent leur entrée qu'après un changement de filtre.
  const [filtered, setFiltered] = useState(false);

  const items = REALISATIONS.filter((r) => cat === "all" || r.category === cat);

  return (
    <section
      id="realisations"
      data-section="realisations"
      className="site-section site-container site-section-pad"
    >
      <div className="site-section-head site-section-head--tabs" data-rv="0">
        <div>
          <span className="site-eyebrow">Réalisations</span>
          <h2 className="site-h2">
            Quelques projets <span style={{ color: "var(--rw-primary)" }}>réalisés.</span>
          </h2>
        </div>
        <div className="site-tabs-wrap">
          <Tabs
            variant="pill"
            label="Filtrer les réalisations"
            value={cat}
            onChange={(v) => {
              setCat(v as RealisationCategory);
              setFiltered(true);
              track(EventType.FILTER_CHANGE, { name: v, section: "realisations" });
            }}
            items={FILTERS.map((f) => ({ value: f.value, label: f.label }))}
            getTrackName={(v) => FILTERS.find((f) => f.value === v)?.track}
          />
        </div>
      </div>
      <div className="realisations-grid">
        {items.map((item, i) => (
          <article
            key={`${cat}-${item.id}`}
            className={filtered ? "work work--enter" : "work"}
            data-track={item.trackName}
            data-rv={filtered ? undefined : (i % 3) * 90}
            style={{ ["--i" as string]: i }}
          >
            <ProjectVisual item={item} />
            <div className="work__meta">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="work__tags">
                  {item.tags.map((t) => (
                    <Tag key={t} tone="neutral">
                      {t}
                    </Tag>
                  ))}
                </div>
              </div>
              <span className="work__go" aria-hidden="true">
                <ArrowUpRight size={20} strokeWidth={2} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectVisual({ item }: { item: (typeof REALISATIONS)[number] }) {
  const [hasImage, setHasImage] = useState(true);
  return (
    <div className="work__img" style={{ background: item.tintVar }}>
      <div className="work__zoom">
        {hasImage && item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 380px"
            onError={() => setHasImage(false)}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <ProjectPreview item={item} />
        )}
      </div>
    </div>
  );
}
