import { SourceCategory } from '@relwick/shared';

const SEARCH_DOMAINS = [
  'google.',
  'bing.',
  'yahoo.',
  'duckduckgo.',
  'baidu.',
  'yandex.',
  'ecosia.',
];

const SOCIAL_DOMAINS = [
  'facebook.com',
  'fb.com',
  'instagram.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'youtube.com',
  't.co',
];

export interface SourceInput {
  referrer: string | null | undefined;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  siteHost?: string;
}

function extractHostname(referrer: string): string | null {
  try {
    const url = new URL(referrer);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function classifySource(input: SourceInput): SourceCategory {
  const utmSource = input.utmSource?.trim();
  const utmMedium = input.utmMedium?.trim();
  const utmCampaign = input.utmCampaign?.trim();
  if (utmSource || utmMedium || utmCampaign) {
    return SourceCategory.CAMPAIGN;
  }

  const ref = input.referrer?.trim() ?? '';
  if (!ref) {
    return SourceCategory.DIRECT;
  }

  const host = extractHostname(ref);
  if (!host) {
    return SourceCategory.DIRECT;
  }

  if (host.includes('wa.me') || host.includes('whatsapp')) {
    return SourceCategory.WHATSAPP;
  }

  for (const pattern of SEARCH_DOMAINS) {
    if (host.includes(pattern)) {
      return SourceCategory.SEARCH;
    }
  }

  for (const social of SOCIAL_DOMAINS) {
    if (host === social || host.endsWith(`.${social}`)) {
      return SourceCategory.SOCIAL;
    }
  }

  const siteHost = input.siteHost?.toLowerCase();
  if (siteHost && (host === siteHost || host.endsWith(`.${siteHost}`))) {
    return SourceCategory.DIRECT;
  }

  return SourceCategory.REFERRAL;
}

export function referrerDomain(referrer: string | null | undefined): string | null {
  if (!referrer?.trim()) return null;
  return extractHostname(referrer);
}
