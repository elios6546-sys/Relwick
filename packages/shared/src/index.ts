export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  UNKNOWN = 'UNKNOWN',
}

export enum SourceCategory {
  DIRECT = 'DIRECT',
  SEARCH = 'SEARCH',
  SOCIAL = 'SOCIAL',
  WHATSAPP = 'WHATSAPP',
  REFERRAL = 'REFERRAL',
  CAMPAIGN = 'CAMPAIGN',
}

export enum EventType {
  PAGEVIEW = 'PAGEVIEW',
  CLICK = 'CLICK',
  CTA_CLICK = 'CTA_CLICK',
  CONTACT_CLICK = 'CONTACT_CLICK',
  OUTBOUND_CLICK = 'OUTBOUND_CLICK',
  SECTION_VIEW = 'SECTION_VIEW',
  SCROLL_DEPTH = 'SCROLL_DEPTH',
  FORM_START = 'FORM_START',
  FORM_ERROR = 'FORM_ERROR',
  FORM_SUBMIT = 'FORM_SUBMIT',
  FILTER_CHANGE = 'FILTER_CHANGE',
  THEME_TOGGLE = 'THEME_TOGGLE',
  MENU_TOGGLE = 'MENU_TOGGLE',
  HEARTBEAT = 'HEARTBEAT',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CALL_SCHEDULED = 'CALL_SCHEDULED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum SharePlatform {
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK',
  LINKEDIN = 'LINKEDIN',
  X = 'X',
  YOUTUBE = 'YOUTUBE',
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  QR = 'QR',
  OTHER = 'OTHER',
}

export const SHARE_PLATFORM_LABELS: Record<SharePlatform, string> = {
  WHATSAPP: 'WhatsApp',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
  X: 'X (Twitter)',
  YOUTUBE: 'YouTube',
  TELEGRAM: 'Telegram',
  EMAIL: 'E-mail',
  SMS: 'SMS',
  QR: 'Code QR / imprimé',
  OTHER: 'Autre',
};

/** Valeur `utm_source` générée pour chaque plateforme. */
export const SHARE_PLATFORM_UTM: Record<SharePlatform, string> = {
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  X: 'x',
  YOUTUBE: 'youtube',
  TELEGRAM: 'telegram',
  EMAIL: 'email',
  SMS: 'sms',
  QR: 'qr',
  OTHER: 'autre',
};

/** Paramètre d'URL ajouté par la redirection /l/:slug pour relier la visite au lien. */
export const SHARE_LINK_PARAM = 'rwl';

export interface ShareLinkDto {
  id: string;
  slug: string;
  name: string;
  platform: SharePlatform;
  campaign: string;
  targetPath: string;
  note: string | null;
  isActive: boolean;
  openCount: number;
  createdAt: string;
  updatedAt: string;
  shortUrl: string;
  fullUrl: string;
  stats: {
    visits: number;
    uniqueVisitors: number;
    leads: number;
    contacts: number;
    avgDurationSec: number;
  };
}

export const SECTION_IDS = [
  'header',
  'hero',
  'services',
  'realisations',
  'apropos',
  'contact',
  'footer',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const TRACK_NAMES: Record<string, string> = {
  header_logo: 'Logo (en-tête)',
  header_nav_services: 'Navigation — Services',
  header_nav_realisations: 'Navigation — Réalisations',
  header_nav_apropos: 'Navigation — À propos',
  header_nav_contact: 'Navigation — Contact',
  header_cta_appel: 'Réserver un appel (en-tête)',
  header_theme_toggle: 'Bascule de thème',
  header_menu_toggle: 'Menu mobile',
  hero_cta_appel: 'Réserver un appel (hero)',
  hero_cta_services: 'Voir les services (hero)',
  services_card_web: 'Carte service — Sites web',
  services_card_android: 'Carte service — Android',
  services_card_ios: 'Carte service — iOS',
  services_card_pc: 'Carte service — Logiciels PC',
  realisations_filter_all: 'Filtre réalisations — Tout',
  realisations_filter_web: 'Filtre réalisations — Sites web',
  realisations_filter_mobile: 'Filtre réalisations — Applications',
  realisations_filter_pc: 'Filtre réalisations — Logiciels PC',
  realisation_card_1: 'Réalisation 1',
  realisation_card_2: 'Réalisation 2',
  realisation_card_3: 'Réalisation 3',
  realisation_card_4: 'Réalisation 4',
  realisation_card_5: 'Réalisation 5',
  realisation_card_6: 'Réalisation 6',
  apropos_cta_appel: 'Réserver un appel (à propos)',
  apropos_cta_email: 'Écrire un e-mail (à propos)',
  contact_email: 'E-mail (contact)',
  contact_tel: 'Téléphone (contact)',
  contact_whatsapp: 'WhatsApp (contact)',
  form_submit: 'Envoyer le formulaire',
  dialog_modifier: 'Dialog — Modifier',
  dialog_confirmer: 'Dialog — Confirmer',
  footer_link_services: 'Pied — Services',
  footer_link_realisations: 'Pied — Réalisations',
  footer_link_apropos: 'Pied — À propos',
  footer_link_contact: 'Pied — Contact',
  footer_link_confidentialite: 'Pied — Confidentialité',
  footer_link_mentions: 'Pied — Mentions légales',
  whatsapp_float: 'WhatsApp flottant',
  privacy_notice_ok: 'Bandeau audience — Compris',
};

export interface CollectUtm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
}

export interface CollectContext {
  isNewSession: boolean;
  landingPath: string;
  referrer: string;
  utm: CollectUtm;
  /** Identifiant court du lien de partage (paramètre `rwl`) si la visite en provient. */
  shareLink?: string | null;
  screen: { w: number; h: number };
  viewport: { w: number; h: number };
  language: string;
  timezone: string;
}

export interface CollectEvent {
  type: EventType | keyof typeof EventType | string;
  pageViewId?: string;
  path?: string;
  title?: string;
  name?: string;
  label?: string;
  section?: string;
  href?: string;
  value?: number;
  xPct?: number;
  yPx?: number;
  activeSeconds?: number;
  maxScrollPct?: number;
  meta?: Record<string, unknown>;
  ts: number;
}

export interface CollectPayload {
  v: 1;
  visitorId: string;
  sessionId: string;
  context?: CollectContext;
  events: CollectEvent[];
}

export interface CreateLeadPayload {
  fullName: string;
  phone: string;
  email?: string | null;
  projectType: string;
  callSlot: string;
  message?: string | null;
  consent: boolean;
  website?: string;
  visitorId?: string | null;
  sessionId?: string | null;
}

export const PROJECT_TYPES = [
  'Site web',
  'Application Android',
  'Application iOS',
  'Application Android et iOS',
  'Logiciel PC',
  'Je ne sais pas encore',
] as const;

export const CALL_SLOTS = ['Matin', 'Après-midi', 'Soir'] as const;

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Nouvelle',
  CONTACTED: 'Contactée',
  CALL_SCHEDULED: 'Appel planifié',
  CONVERTED: 'Convertie',
  LOST: 'Perdue',
};

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  DIRECT: 'Direct',
  SEARCH: 'Recherche',
  SOCIAL: 'Réseaux sociaux',
  WHATSAPP: 'WhatsApp',
  REFERRAL: 'Autre site',
  CAMPAIGN: 'Campagne',
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  DESKTOP: 'Ordinateur',
  MOBILE: 'Mobile',
  TABLET: 'Tablette',
  UNKNOWN: 'Inconnu',
};
