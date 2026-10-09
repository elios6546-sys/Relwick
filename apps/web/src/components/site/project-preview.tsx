import type { Realisation } from "@/content/realisations";

/* Aperçu dessiné en CSS, propre à chaque projet, affiché tant que la vraie capture
   d'écran n'est pas fournie. Purement décoratif : le titre et la description de la
   carte portent l'information. */
export function ProjectPreview({ item }: { item: Realisation }) {
  const render = PREVIEWS[item.id] ?? PREVIEWS["1"];
  return (
    <div className={`pv pv--${item.category}`} aria-hidden="true">
      {render()}
    </div>
  );
}

const PREVIEWS: Record<string, () => React.ReactNode> = {
  /* Site vitrine pour un restaurant : bandeau, puis menu avec photos et prix. */
  "1": () => (
    <div className="pv-frame">
      <BrowserChrome />
      <div className="pv-body">
        <div className="pv-banner">
          <span className="pv-line pv-line--ivory pv-line--w50" />
          <span className="pv-line pv-line--ivory-soft pv-line--w30" />
          <span className="pv-btn pv-btn--sm" />
        </div>
        {(["pv-tone-copper", "pv-tone-ink", "pv-tone-indigo"] as const).map((tone) => (
          <div key={tone} className="pv-row">
            <span className={`pv-thumb ${tone}`} />
            <span className="pv-stack">
              <span className="pv-line pv-line--dark pv-line--w60" />
              <span className="pv-line pv-line--w40" />
            </span>
            <span className="pv-pill pv-pill--copper" />
          </div>
        ))}
      </div>
    </div>
  ),

  /* Application de livraison : carte avec trajet, fiche du livreur, progression. */
  "2": () => (
    <div className="pv-frame pv-frame--phone">
      <span className="pv-notch" />
      <div className="pv-body pv-body--tight">
        <div className="pv-map">
          <span className="pv-route" />
          <span className="pv-pin pv-pin--start" />
          <span className="pv-pin pv-pin--end" />
        </div>
        <div className="pv-sheet">
          <div className="pv-row">
            <span className="pv-avatar" />
            <span className="pv-stack">
              <span className="pv-line pv-line--dark pv-line--w60" />
              <span className="pv-line pv-line--w40" />
            </span>
          </div>
          <span className="pv-progress">
            <span className="pv-progress__bar" />
          </span>
          <span className="pv-btn pv-btn--block" />
        </div>
      </div>
    </div>
  ),

  /* Logiciel de gestion de stock : barre latérale, indicateurs, tableau. */
  "3": () => (
    <div className="pv-frame">
      <BrowserChrome window />
      <div className="pv-window">
        <div className="pv-sidebar">
          <span className="pv-line pv-line--ivory pv-line--w60" />
          <span className="pv-line pv-line--sidebar pv-line--w80" />
          <span className="pv-line pv-line--sidebar-active pv-line--w70" />
          <span className="pv-line pv-line--sidebar pv-line--w60" />
          <span className="pv-line pv-line--sidebar pv-line--w70" />
        </div>
        <div className="pv-main">
          <div className="pv-kpis">
            {[0, 1, 2].map((i) => (
              <span key={i} className="pv-kpi">
                <span className="pv-line pv-line--w60" />
                <span className="pv-line pv-line--dark pv-line--tall pv-line--w40" />
              </span>
            ))}
          </div>
          <div className="pv-table">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`pv-tr${i === 0 ? " pv-tr--head" : ""}`}>
                <span className="pv-line pv-line--w80" />
                <span className="pv-line pv-line--w60" />
                <span className="pv-line pv-line--w40" />
                {i === 0 ? (
                  <span className="pv-line pv-line--w60" />
                ) : (
                  <span className={`pv-status ${i === 3 ? "pv-status--warn" : "pv-status--ok"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  /* Boutique en ligne : navigation, grille de produits. */
  "4": () => (
    <div className="pv-frame">
      <BrowserChrome />
      <div className="pv-body">
        <div className="pv-nav">
          <span className="pv-line pv-line--dark pv-line--w20" />
          <span className="pv-line pv-line--w10" />
          <span className="pv-line pv-line--w10" />
          <span className="pv-line pv-line--w10" />
          <span className="pv-btn pv-btn--sm pv-ml-auto" />
        </div>
        <div className="pv-products">
          {(["pv-tone-copper", "pv-tone-indigo", "pv-tone-ink", "pv-tone-copper-2"] as const).map(
            (tone, i) => (
              <div key={i} className="pv-product">
                <span className={`pv-photo ${tone}`} />
                <span className="pv-line pv-line--dark pv-line--w80" />
                <span className="pv-row pv-row--between">
                  <span className="pv-line pv-line--w40" />
                  <span className="pv-pill" />
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  ),

  /* Prise de rendez-vous : calendrier du mois, créneaux, bouton. */
  "5": () => (
    <div className="pv-frame pv-frame--phone">
      <span className="pv-notch" />
      <div className="pv-body">
        <div className="pv-row pv-row--between">
          <span className="pv-line pv-line--dark pv-line--w50" />
          <span className="pv-row pv-row--tight">
            <span className="pv-dot" />
            <span className="pv-dot" />
          </span>
        </div>
        <div className="pv-calendar">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className={`pv-day${i === 16 ? " pv-day--selected" : i === 9 || i === 22 ? " pv-day--soft" : ""}`}
            />
          ))}
        </div>
        <span className="pv-line pv-line--dark pv-line--w40" />
        <div className="pv-row">
          <span className="pv-slot" />
          <span className="pv-slot pv-slot--active" />
          <span className="pv-slot" />
        </div>
        <span className="pv-btn pv-btn--block" />
      </div>
    </div>
  ),

  /* Portfolio de photographe : logo, navigation, galerie en mosaïque. */
  "6": () => (
    <div className="pv-frame">
      <BrowserChrome />
      <div className="pv-body">
        <div className="pv-nav">
          <span className="pv-line pv-line--dark pv-line--w20" />
          <span className="pv-line pv-line--w10 pv-ml-auto" />
          <span className="pv-line pv-line--w10" />
          <span className="pv-line pv-line--w10" />
        </div>
        <div className="pv-gallery">
          <span className="pv-photo pv-tone-ink-deep pv-span-2" />
          <span className="pv-photo pv-tone-copper-2" />
          <span className="pv-photo pv-tone-ink" />
          <span className="pv-photo pv-tone-copper-deep" />
          <span className="pv-photo pv-tone-ink-mid pv-span-2" />
        </div>
      </div>
    </div>
  ),
};

function BrowserChrome({ window: isWindow = false }: { window?: boolean }) {
  return (
    <div className="pv-chrome">
      <span className="pv-dot" />
      <span className="pv-dot" />
      <span className="pv-dot" />
      {isWindow ? null : <span className="pv-url" />}
    </div>
  );
}
