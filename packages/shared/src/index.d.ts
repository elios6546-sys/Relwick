export declare enum DeviceType {
    DESKTOP = "DESKTOP",
    MOBILE = "MOBILE",
    TABLET = "TABLET",
    UNKNOWN = "UNKNOWN"
}
export declare enum SourceCategory {
    DIRECT = "DIRECT",
    SEARCH = "SEARCH",
    SOCIAL = "SOCIAL",
    WHATSAPP = "WHATSAPP",
    REFERRAL = "REFERRAL",
    CAMPAIGN = "CAMPAIGN"
}
export declare enum EventType {
    PAGEVIEW = "PAGEVIEW",
    CLICK = "CLICK",
    CTA_CLICK = "CTA_CLICK",
    CONTACT_CLICK = "CONTACT_CLICK",
    OUTBOUND_CLICK = "OUTBOUND_CLICK",
    SECTION_VIEW = "SECTION_VIEW",
    SCROLL_DEPTH = "SCROLL_DEPTH",
    FORM_START = "FORM_START",
    FORM_ERROR = "FORM_ERROR",
    FORM_SUBMIT = "FORM_SUBMIT",
    FILTER_CHANGE = "FILTER_CHANGE",
    THEME_TOGGLE = "THEME_TOGGLE",
    MENU_TOGGLE = "MENU_TOGGLE",
    HEARTBEAT = "HEARTBEAT"
}
export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    CALL_SCHEDULED = "CALL_SCHEDULED",
    CONVERTED = "CONVERTED",
    LOST = "LOST"
}
export declare const SECTION_IDS: readonly ["header", "hero", "services", "realisations", "apropos", "contact", "footer"];
export type SectionId = (typeof SECTION_IDS)[number];
export declare const TRACK_NAMES: Record<string, string>;
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
    screen: {
        w: number;
        h: number;
    };
    viewport: {
        w: number;
        h: number;
    };
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
export declare const PROJECT_TYPES: readonly ["Site web", "Application Android", "Application iOS", "Application Android et iOS", "Logiciel PC", "Je ne sais pas encore"];
export declare const CALL_SLOTS: readonly ["Matin", "Après-midi", "Soir"];
export declare const LEAD_STATUS_LABELS: Record<LeadStatus, string>;
export declare const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string>;
export declare const DEVICE_TYPE_LABELS: Record<DeviceType, string>;
