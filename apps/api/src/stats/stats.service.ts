import { Injectable } from '@nestjs/common';
import { EventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { StatsQueryDto } from './dto/stats-query.dto';
import {
  buildSessionWhere,
  pctChange,
  previousPeriod,
} from './stats-filter.util';

const SECTION_ORDER = ['hero', 'services', 'realisations', 'apropos', 'contact', 'footer'];
const CONTACT_INDEX = SECTION_ORDER.indexOf('contact');

function sectionIndex(section: string | null): number {
  if (!section) return 0;
  const idx = SECTION_ORDER.indexOf(section);
  return idx < 0 ? 0 : idx;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private period(query: StatsQueryDto): { from: Date; to: Date } {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  private whereWithPeriod(
    query: StatsQueryDto,
    from: Date,
    to: Date,
  ): Prisma.SessionWhereInput {
    return {
      ...buildSessionWhere(query),
      startedAt: { gte: from, lte: to },
    };
  }

  async overview(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const current = await this.kpiBundle(this.whereWithPeriod(query, from, to), from, to);
    let previous: typeof current | null = null;
    if (query.compare) {
      const prev = previousPeriod(from, to);
      previous = await this.kpiBundle(
        this.whereWithPeriod(query, prev.from, prev.to),
        prev.from,
        prev.to,
      );
    }
    return {
      period: { from: from.toISOString(), to: to.toISOString() },
      current,
      previous,
      change: previous
        ? {
            visits: pctChange(current.visits, previous.visits),
            uniqueVisitors: pctChange(current.uniqueVisitors, previous.uniqueVisitors),
            newVisitors: pctChange(current.newVisitors, previous.newVisitors),
            pageviews: pctChange(current.pageviews, previous.pageviews),
            avgDurationSec: pctChange(current.avgDurationSec, previous.avgDurationSec),
            bounceRate: pctChange(current.bounceRate, previous.bounceRate),
            leads: pctChange(current.leads, previous.leads),
            conversionRate: pctChange(current.conversionRate, previous.conversionRate),
            contacts: pctChange(current.contacts, previous.contacts),
            clicks: pctChange(current.clicks, previous.clicks),
            clicksPerVisit: pctChange(current.clicksPerVisit, previous.clicksPerVisit),
            visitsWithClickPct: pctChange(
              current.visitsWithClickPct,
              previous.visitsWithClickPct,
            ),
            avgSectionDepth: pctChange(current.avgSectionDepth, previous.avgSectionDepth),
            reachedContactPct: pctChange(
              current.reachedContactPct,
              previous.reachedContactPct,
            ),
            heroExitPct: pctChange(current.heroExitPct, previous.heroExitPct),
          }
        : null,
    };
  }

  private async kpiBundle(where: Prisma.SessionWhereInput, from: Date, to: Date) {
    const [visits, uniqueVisitors, agg, leads, newVisitors, withClick, contactClicks, bySection] =
      await Promise.all([
        this.prisma.session.count({ where }),
        this.prisma.session
          .groupBy({
            by: ['visitorId'],
            where,
          })
          .then((g) => g.length),
        this.prisma.session.aggregate({
          where,
          _sum: { pageviewCount: true, activeSeconds: true, clickCount: true },
          _avg: { activeSeconds: true },
        }),
        this.prisma.lead.count({
          where: { createdAt: { gte: from, lte: to } },
        }),
        this.prisma.visitor.count({
          where: {
            firstSeenAt: { gte: from, lte: to },
            sessions: { some: where },
          },
        }),
        this.prisma.session.count({ where: { ...where, clickCount: { gt: 0 } } }),
        this.prisma.event.count({
          where: {
            type: EventType.CONTACT_CLICK,
            occurredAt: { gte: from, lte: to },
            session: where,
          },
        }),
        this.prisma.session.groupBy({
          by: ['lastSection'],
          where,
          _count: { _all: true },
        }),
      ]);

    const bounceWhere: Prisma.SessionWhereInput = {
      ...where,
      isBounce: true,
    };
    const bounces = await this.prisma.session.count({ where: bounceWhere });
    const pageviews = agg._sum.pageviewCount ?? 0;
    const clicks = agg._sum.clickCount ?? 0;
    const avgDurationSec = Math.round(agg._avg.activeSeconds ?? 0);
    const bounceRate = visits === 0 ? 0 : (bounces / visits) * 100;
    const conversionRate = visits === 0 ? 0 : (leads / visits) * 100;

    let depthSum = 0;
    let reachedContact = 0;
    let heroExit = 0;
    for (const g of bySection) {
      const idx = sectionIndex(g.lastSection);
      depthSum += (idx + 1) * g._count._all;
      if (idx >= CONTACT_INDEX) reachedContact += g._count._all;
      if (idx <= 0) heroExit += g._count._all;
    }

    return {
      visits,
      uniqueVisitors,
      newVisitors,
      pageviews,
      pagesPerVisit: visits === 0 ? 0 : pageviews / visits,
      avgDurationSec,
      bounceRate,
      leads,
      conversionRate,
      contacts: contactClicks + leads,
      clicks,
      clicksPerVisit: visits === 0 ? 0 : clicks / visits,
      visitsWithClickPct: visits === 0 ? 0 : (withClick / visits) * 100,
      avgSectionDepth: visits === 0 ? 0 : depthSum / visits,
      reachedContactPct: visits === 0 ? 0 : (reachedContact / visits) * 100,
      heroExitPct: visits === 0 ? 0 : (heroExit / visits) * 100,
    };
  }

  async durations(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const sessions = await this.prisma.session.findMany({
      where,
      select: { activeSeconds: true },
    });
    const buckets = [
      { label: 'Moins de 10 s', min: 0, max: 10, count: 0 },
      { label: '10 à 30 s', min: 10, max: 30, count: 0 },
      { label: '30 s à 1 min', min: 30, max: 60, count: 0 },
      { label: '1 à 3 min', min: 60, max: 180, count: 0 },
      { label: '3 à 10 min', min: 180, max: 600, count: 0 },
      { label: 'Plus de 10 min', min: 600, max: Number.POSITIVE_INFINITY, count: 0 },
    ];
    for (const s of sessions) {
      const b = buckets.find((x) => s.activeSeconds >= x.min && s.activeSeconds < x.max);
      if (b) b.count += 1;
    }
    return { total: sessions.length, buckets: buckets.map(({ label, count }) => ({ label, count })) };
  }

  async timeseries(query: StatsQueryDto, interval: string) {
    const { from, to } = this.period(query);
    const unit =
      interval === 'hour'
        ? 'HOUR'
        : interval === 'week'
          ? 'WEEK'
          : interval === 'month'
            ? 'MONTH'
            : 'DAY';

    const rows = await this.prisma.$queryRaw<
      Array<{
        bucket: Date;
        visits: bigint;
        uniqueVisitors: bigint;
        pageviews: bigint;
        leads: bigint;
      }>
    >(Prisma.sql`
      SELECT
        DATE_FORMAT(CONVERT_TZ(s.startedAt, '+00:00', '+02:00'), ${this.bucketFormat(unit)}) AS bucket,
        COUNT(*) AS visits,
        COUNT(DISTINCT s.visitorId) AS uniqueVisitors,
        COALESCE(SUM(s.pageviewCount), 0) AS pageviews,
        0 AS leads
      FROM Session s
      WHERE s.isExcluded = false
        ${query.includeBots ? Prisma.empty : Prisma.sql`AND s.isBot = false`}
        AND s.startedAt >= ${from} AND s.startedAt <= ${to}
        ${query.countryCode ? Prisma.sql`AND s.countryCode = ${query.countryCode}` : Prisma.empty}
        ${query.city ? Prisma.sql`AND s.city = ${query.city}` : Prisma.empty}
      GROUP BY bucket
      ORDER BY bucket ASC
    `);

    const leadRows = await this.prisma.lead.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: from, lte: to } },
      _count: true,
    });

    return {
      interval,
      points: rows.map((r) => ({
        date: String(r.bucket),
        visits: Number(r.visits),
        uniqueVisitors: Number(r.uniqueVisitors),
        pageviews: Number(r.pageviews),
        leads: 0,
      })),
      leadsNote: leadRows.length,
    };
  }

  private bucketFormat(unit: string): string {
    switch (unit) {
      case 'HOUR':
        return '%Y-%m-%d %H:00:00';
      case 'WEEK':
        return '%x-%v';
      case 'MONTH':
        return '%Y-%m-01';
      default:
        return '%Y-%m-%d';
    }
  }

  async live(query: StatsQueryDto) {
    const since = new Date(Date.now() - 2 * 60 * 1000);
    const where: Prisma.SessionWhereInput = {
      ...buildSessionWhere(query),
      lastActivityAt: { gte: since },
      endedAt: null,
    };
    const sessions = await this.prisma.session.findMany({
      where,
      orderBy: { lastActivityAt: 'desc' },
      take: 50,
    });
    return {
      count: sessions.length,
      visitors: sessions.map((s) => ({
        sessionId: s.id,
        ip: s.ip,
        startedAt: s.startedAt.toISOString(),
        lastActivityAt: s.lastActivityAt.toISOString(),
        clickCount: s.clickCount,
        city: s.city,
        countryCode: s.countryCode,
        country: s.country,
        page: s.exitPath ?? s.landingPath,
        section: s.lastSection,
        deviceType: s.deviceType,
        browser: s.browser,
        sourceCategory: s.sourceCategory,
        sinceSeconds: Math.round((Date.now() - s.startedAt.getTime()) / 1000),
      })),
    };
  }

  async geo(query: StatsQueryDto, level: 'country' | 'city') {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    if (level === 'country') {
      const groups = await this.prisma.session.groupBy({
        by: ['countryCode', 'country'],
        where: { ...where, countryCode: { not: null } },
        _count: { _all: true },
        _avg: { activeSeconds: true },
      });
      return groups.map((g) => ({
        countryCode: g.countryCode,
        country: g.country,
        visits: g._count._all,
        avgDurationSec: Math.round(g._avg.activeSeconds ?? 0),
        conversions: 0,
        latitude: null,
        longitude: null,
      }));
    }
    const groups = await this.prisma.session.groupBy({
      by: ['countryCode', 'city', 'latitude', 'longitude'],
      where: { ...where, city: { not: null } },
      _count: { _all: true },
      _avg: { activeSeconds: true },
    });
    return groups.map((g) => ({
      countryCode: g.countryCode,
      city: g.city,
      visits: g._count._all,
      avgDurationSec: Math.round(g._avg.activeSeconds ?? 0),
      latitude: g.latitude ? Number(g.latitude) : null,
      longitude: g.longitude ? Number(g.longitude) : null,
    }));
  }

  async devices(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const [types, browsers, systems, screens] = await Promise.all([
      this.prisma.session.groupBy({
        by: ['deviceType'],
        where,
        _count: { _all: true },
      }),
      this.prisma.session.groupBy({
        by: ['browser'],
        where: { ...where, browser: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.session.groupBy({
        by: ['os'],
        where: { ...where, os: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.session.findMany({
        where,
        select: { screenW: true, screenH: true },
      }),
    ]);

    const screenBuckets = bucketScreens(screens);

    return { deviceTypes: types, browsers, operatingSystems: systems, screenSizes: screenBuckets };
  }

  async sources(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const [categories, referrers, campaigns, isps] = await Promise.all([
      this.prisma.session.groupBy({
        by: ['sourceCategory'],
        where,
        _count: { _all: true },
      }),
      this.prisma.session.groupBy({
        by: ['referrerDomain'],
        where: { ...where, referrerDomain: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { referrerDomain: 'desc' } },
        take: 20,
      }),
      this.prisma.session.groupBy({
        by: ['utmCampaign', 'utmSource', 'utmMedium'],
        where: { ...where, utmCampaign: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { utmCampaign: 'desc' } },
        take: 20,
      }),
      this.prisma.session.groupBy({
        by: ['isp'],
        where: { ...where, isp: { not: null } },
        _count: { _all: true },
      }),
    ]);
    return { categories, referrers, campaigns, isps };
  }

  async clicks(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const totalVisits = await this.prisma.session.count({ where });
    const rows = await this.prisma.event.groupBy({
      by: ['name', 'label', 'section'],
      where: {
        occurredAt: { gte: from, lte: to },
        type: { in: [EventType.CLICK, EventType.CTA_CLICK, EventType.CONTACT_CLICK, EventType.OUTBOUND_CLICK] },
        session: where,
      },
      _count: { _all: true },
      orderBy: { _count: { name: 'desc' } },
      take: 50,
    });
    return rows.map((r) => ({
      name: r.name,
      label: r.label,
      section: r.section,
      clicks: r._count._all,
      distinctVisitors: r._count._all,
      pctOfVisits: totalVisits === 0 ? 0 : (r._count._all / totalVisits) * 100,
    }));
  }

  async sections(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const totalVisits = await this.prisma.session.count({ where });
    const views = await this.prisma.event.groupBy({
      by: ['section'],
      where: {
        type: EventType.SECTION_VIEW,
        occurredAt: { gte: from, lte: to },
        section: { not: null },
        session: where,
      },
      _count: { _all: true },
      _avg: { value: true },
    });
    const exits = await this.prisma.session.groupBy({
      by: ['lastSection'],
      where: { ...where, lastSection: { not: null } },
      _count: { _all: true },
    });
    const exitMap = new Map(exits.map((e) => [e.lastSection, e._count._all]));
    const avgMap = new Map(views.map((v) => [v.section, Math.round(v._avg.value ?? 0)]));

    // Entonnoir monotone : une visite arrêtée à la section i a atteint toutes
    // les sections 0..i. Les visites sans section connue comptent pour le Hero.
    const reached = SECTION_ORDER.map(() => 0);
    const stopsNull = await this.prisma.session.count({
      where: { ...where, lastSection: null },
    });
    reached[0] += stopsNull;
    for (const e of exits) {
      const idx = sectionIndex(e.lastSection);
      for (let i = 0; i <= idx; i += 1) reached[i] += e._count._all;
    }

    return SECTION_ORDER.map((section, i) => ({
      section,
      reachPct: totalVisits === 0 ? 0 : (reached[i] / totalVisits) * 100,
      avgTimeMs: avgMap.get(section) ?? 0,
      exitCount: (exitMap.get(section) ?? 0) + (i === 0 ? stopsNull : 0),
    }));
  }

  async scroll(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const sessions = await this.prisma.session.findMany({
      where,
      select: { maxScrollPct: true },
    });
    const buckets = [
      { label: '0–25', min: 0, max: 25, count: 0 },
      { label: '25–50', min: 25, max: 50, count: 0 },
      { label: '50–75', min: 50, max: 75, count: 0 },
      { label: '75–90', min: 75, max: 90, count: 0 },
      { label: '90–100', min: 90, max: 101, count: 0 },
    ];
    for (const s of sessions) {
      const pct = s.maxScrollPct;
      const bucket = buckets.find((b) => pct >= b.min && pct < b.max);
      if (bucket) bucket.count += 1;
    }
    return buckets;
  }

  async exits(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const [pages, sections] = await Promise.all([
      this.prisma.session.groupBy({
        by: ['exitPath'],
        where: { ...where, exitPath: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { exitPath: 'desc' } },
        take: 20,
      }),
      this.prisma.session.groupBy({
        by: ['lastSection'],
        where: { ...where, lastSection: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { lastSection: 'desc' } },
        take: 20,
      }),
    ]);
    return { pages, sections };
  }

  async funnel(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const where = this.whereWithPeriod(query, from, to);
    const base = await this.prisma.session.count({ where });
    const step = async (eventWhere: Prisma.EventWhereInput) =>
      this.prisma.session.count({
        where: {
          ...where,
          events: { some: eventWhere },
        },
      });
    const services = await step({ type: EventType.SECTION_VIEW, section: 'services' });
    const realisations = await step({ type: EventType.SECTION_VIEW, section: 'realisations' });
    const contact = await step({ type: EventType.SECTION_VIEW, section: 'contact' });
    const formStart = await step({ type: EventType.FORM_START });
    const formSubmit = await step({ type: EventType.FORM_SUBMIT });
    return [
      { step: 'Visite', count: base },
      { step: 'Services vus', count: services },
      { step: 'Réalisations vues', count: realisations },
      { step: 'Contact vu', count: contact },
      { step: 'Formulaire commencé', count: formStart },
      { step: 'Formulaire envoyé', count: formSubmit },
    ];
  }

  async hours(query: StatsQueryDto) {
    const { from, to } = this.period(query);
    const rows = await this.prisma.$queryRaw<
      Array<{ dow: number; hour: number; visits: bigint }>
    >(Prisma.sql`
      SELECT
        DAYOFWEEK(CONVERT_TZ(s.startedAt, '+00:00', '+02:00')) AS dow,
        HOUR(CONVERT_TZ(s.startedAt, '+00:00', '+02:00')) AS hour,
        COUNT(*) AS visits
      FROM Session s
      WHERE s.isExcluded = false
        ${query.includeBots ? Prisma.empty : Prisma.sql`AND s.isBot = false`}
        AND s.startedAt >= ${from} AND s.startedAt <= ${to}
      GROUP BY dow, hour
    `);
    return rows.map((r) => ({
      dayOfWeek: Number(r.dow),
      hour: Number(r.hour),
      visits: Number(r.visits),
    }));
  }
}

function bucketScreens(
  screens: Array<{ screenW: number | null; screenH: number | null }>,
): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const s of screens) {
    const w = s.screenW ?? 0;
    let label = 'Inconnu';
    if (w > 0 && w < 768) label = 'Mobile (<768px)';
    else if (w < 1024) label = 'Tablette (768–1023px)';
    else if (w >= 1024) label = 'Desktop (≥1024px)';
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}
