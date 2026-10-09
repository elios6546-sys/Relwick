export interface KpiBundle {
  visits: number;
  uniqueVisitors: number;
  newVisitors: number;
  pageviews: number;
  pagesPerVisit: number;
  avgDurationSec: number;
  bounceRate: number;
  leads: number;
  conversionRate: number;
  contacts: number;
  clicks: number;
  clicksPerVisit: number;
  visitsWithClickPct: number;
  avgSectionDepth: number;
  reachedContactPct: number;
  heroExitPct: number;
}

export interface Overview {
  period: { from: string; to: string };
  current: KpiBundle;
  previous: KpiBundle | null;
  change: Record<keyof KpiBundle, number | null> | null;
}

export interface TimeseriesPoint {
  date: string;
  visits: number;
  uniqueVisitors: number;
  pageviews: number;
  leads: number;
}

export interface Timeseries {
  interval: "hour" | "day" | "week" | "month";
  points: TimeseriesPoint[];
}

export interface LiveVisitor {
  sessionId: string;
  ip: string;
  startedAt: string;
  lastActivityAt: string;
  clickCount: number;
  city: string | null;
  countryCode: string | null;
  country: string | null;
  page: string | null;
  section: string | null;
  deviceType: string;
  browser: string | null;
  sourceCategory: string;
  sinceSeconds: number;
}

export interface LiveResponse {
  count: number;
  visitors: LiveVisitor[];
}

export interface CityRow {
  countryCode: string | null;
  city: string | null;
  visits: number;
  avgDurationSec: number;
}

export interface ClickRow {
  name: string;
  label: string | null;
  section: string | null;
  clicks: number;
  distinctVisitors: number;
  pctOfVisits: number;
}

export interface SectionRow {
  section: string;
  reachPct: number;
  avgTimeMs: number;
  exitCount: number;
}

export interface SessionRow {
  id: string;
  visitorId: string;
  ip: string;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  isp: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  sourceCategory: string;
  referrerDomain: string | null;
  landingPath: string;
  lastSection: string | null;
  pageviewCount: number;
  clickCount: number;
  maxScrollPct: number;
  activeSeconds: number;
  startedAt: string;
  lastActivityAt: string;
  isBounce: boolean | null;
  ipVisitCount: number;
  shareLink?: { id: string; name: string; platform: string; slug: string } | null;
}

export interface SessionsList {
  total: number;
  uniqueIps: number;
  page: number;
  pageSize: number;
  items: SessionRow[];
}

export interface TimelineItem {
  kind: "pageview" | "event";
  at: string;
  label: string;
  data: {
    type?: string;
    name?: string | null;
    label?: string | null;
    section?: string | null;
    value?: number | null;
    path?: string;
  } | null;
}

export interface SessionDetail {
  session: SessionRow & {
    events: Array<{
      type: string;
      name: string | null;
      label: string | null;
      section: string | null;
      occurredAt: string;
    }>;
  };
  timeline: TimelineItem[];
}

export interface DurationsResponse {
  total: number;
  buckets: Array<{ label: string; count: number }>;
}

export interface SourcesResponse {
  categories: Array<{ sourceCategory: string; _count: { _all: number } }>;
}

export interface DevicesResponse {
  deviceTypes: Array<{ deviceType: string; _count: { _all: number } }>;
  browsers: Array<{ browser: string | null; _count: { _all: number } }>;
  operatingSystems: Array<{ os: string | null; _count: { _all: number } }>;
}
