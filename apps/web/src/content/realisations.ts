export type RealisationCategory = "all" | "web" | "mobile" | "pc";

export interface Realisation {
  id: string;
  trackName: string;
  title: string;
  description: string;
  category: "web" | "mobile" | "pc";
  tags: string[];
  tintVar: string;
  image?: string;
}

export const REALISATIONS: Realisation[] = [
  {
    id: "1",
    trackName: "realisation_card_1",
    title: "Site vitrine pour un restaurant",
    description: "Menu en ligne et réservation de table",
    category: "web",
    tags: ["Site web"],
    tintVar: "var(--indigo-100)",
  },
  {
    id: "2",
    trackName: "realisation_card_2",
    title: "Application de livraison",
    description: "Commandes et suivi de livraison",
    category: "mobile",
    tags: ["Android", "iOS"],
    tintVar: "var(--copper-100)",
  },
  {
    id: "3",
    trackName: "realisation_card_3",
    title: "Logiciel de gestion de stock",
    description: "Inventaire, ventes et factures",
    category: "pc",
    tags: ["Windows"],
    tintVar: "var(--ink-100)",
  },
  {
    id: "4",
    trackName: "realisation_card_4",
    title: "Boutique en ligne",
    description: "Catalogue, panier et paiement en ligne",
    category: "web",
    tags: ["Site web"],
    tintVar: "var(--indigo-200)",
  },
  {
    id: "5",
    trackName: "realisation_card_5",
    title: "Application de prise de rendez-vous",
    description: "Réservation et rappels par notification",
    category: "mobile",
    tags: ["Android"],
    tintVar: "var(--copper-200)",
  },
  {
    id: "6",
    trackName: "realisation_card_6",
    title: "Portfolio de photographe",
    description: "Galerie, contact et blog",
    category: "web",
    tags: ["Site web"],
    tintVar: "var(--rw-surface-sunken)",
  },
];
