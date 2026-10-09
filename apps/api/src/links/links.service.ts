import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventType, Prisma, type ShareLink } from '@prisma/client';
import { SHARE_LINK_PARAM, SHARE_PLATFORM_UTM } from '@relwick/shared';
import { randomBytes } from 'node:crypto';
import type { EnvironmentVariables } from '../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import type { StatsQueryDto } from '../stats/dto/stats-query.dto';
import type { CreateShareLinkDto, UpdateShareLinkDto } from './dto/share-link.dto';

const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // sans l, o, 0, 1 (lisibilité)
const SLUG_LENGTH = 7;

export interface ShareLinkStats {
  visits: number;
  uniqueVisitors: number;
  leads: number;
  contacts: number;
  avgDurationSec: number;
}

@Injectable()
export class LinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  private siteOrigin(): string {
    return this.config.get('WEB_ORIGIN', { infer: true }).replace(/\/+$/, '');
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  private randomSlug(): string {
    const bytes = randomBytes(SLUG_LENGTH);
    let out = '';
    for (let i = 0; i < SLUG_LENGTH; i += 1) {
      out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
    }
    return out;
  }

  private async uniqueSlug(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = this.randomSlug();
      const exists = await this.prisma.shareLink.findUnique({ where: { slug } });
      if (!exists) return slug;
    }
    return `${this.randomSlug()}${this.randomSlug().slice(0, 2)}`;
  }

  /** URL courte à partager : https://site/l/abc1234 */
  shortUrl(link: Pick<ShareLink, 'slug'>): string {
    return `${this.siteOrigin()}/l/${link.slug}`;
  }

  /** URL finale (après redirection), avec les paramètres UTM et le marqueur de lien. */
  fullUrl(link: Pick<ShareLink, 'slug' | 'platform' | 'campaign' | 'targetPath'>): string {
    const [pathPart, hash] = link.targetPath.split('#');
    const [path, existingQuery] = pathPart.split('?');
    const params = new URLSearchParams(existingQuery ?? '');
    params.set('utm_source', SHARE_PLATFORM_UTM[link.platform]);
    params.set('utm_medium', 'partage');
    params.set('utm_campaign', this.slugify(link.campaign) || 'lien');
    params.set(SHARE_LINK_PARAM, link.slug);
    const qs = params.toString();
    return `${this.siteOrigin()}${path || '/'}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
  }

  /** Résolution publique d'un lien court : incrémente le compteur et renvoie la cible. */
  async resolve(slug: string): Promise<{ url: string } | null> {
    const link = await this.prisma.shareLink.findUnique({ where: { slug } });
    if (!link || !link.isActive) return null;
    await this.prisma.shareLink.update({
      where: { id: link.id },
      data: { openCount: { increment: 1 } },
    });
    return { url: this.fullUrl(link) };
  }

  async create(dto: CreateShareLinkDto) {
    const slug = await this.uniqueSlug();
    const link = await this.prisma.shareLink.create({
      data: {
        slug,
        name: dto.name,
        platform: dto.platform,
        campaign: dto.campaign?.trim() || dto.name,
        targetPath: dto.targetPath?.trim() || '/',
        note: dto.note?.trim() || null,
      },
    });
    return this.decorate(link, this.emptyStats());
  }

  async update(id: string, dto: UpdateShareLinkDto) {
    await this.getOrThrow(id);
    const data: Prisma.ShareLinkUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.platform !== undefined) data.platform = dto.platform;
    if (dto.campaign !== undefined) data.campaign = dto.campaign || undefined;
    if (dto.targetPath !== undefined) data.targetPath = dto.targetPath || '/';
    if (dto.note !== undefined) data.note = dto.note || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    const link = await this.prisma.shareLink.update({ where: { id }, data });
    const stats = await this.statsFor([id]);
    return this.decorate(link, stats.get(id) ?? this.emptyStats());
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.shareLink.delete({ where: { id } });
  }

  async list(query: StatsQueryDto) {
    const links = await this.prisma.shareLink.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const stats = await this.statsFor(
      links.map((l) => l.id),
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
    const items = links.map((l) => this.decorate(l, stats.get(l.id) ?? this.emptyStats()));
    const totals = items.reduce(
      (acc, l) => ({
        links: acc.links + 1,
        active: acc.active + (l.isActive ? 1 : 0),
        opens: acc.opens + l.openCount,
        visits: acc.visits + l.stats.visits,
        leads: acc.leads + l.stats.leads,
        contacts: acc.contacts + l.stats.contacts,
      }),
      { links: 0, active: 0, opens: 0, visits: 0, leads: 0, contacts: 0 },
    );
    return { items, totals };
  }

  async detail(id: string, query: StatsQueryDto) {
    const link = await this.getOrThrow(id);
    const stats = await this.statsFor(
      [id],
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
    return this.decorate(link, stats.get(id) ?? this.emptyStats());
  }

  private async getOrThrow(id: string): Promise<ShareLink> {
    const link = await this.prisma.shareLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException('Lien introuvable.');
    return link;
  }

  private emptyStats(): ShareLinkStats {
    return { visits: 0, uniqueVisitors: 0, leads: 0, contacts: 0, avgDurationSec: 0 };
  }

  private decorate(link: ShareLink, stats: ShareLinkStats) {
    return {
      ...link,
      shortUrl: this.shortUrl(link),
      fullUrl: this.fullUrl(link),
      stats,
    };
  }

  private async statsFor(
    ids: string[],
    from?: Date,
    to?: Date,
  ): Promise<Map<string, ShareLinkStats>> {
    const map = new Map<string, ShareLinkStats>();
    if (ids.length === 0) return map;

    const where: Prisma.SessionWhereInput = {
      shareLinkId: { in: ids },
      isExcluded: false,
      isBot: false,
    };
    if (from || to) {
      where.startedAt = {};
      if (from) where.startedAt.gte = from;
      if (to) where.startedAt.lte = to;
    }

    const [visits, visitors, leads, contacts] = await Promise.all([
      this.prisma.session.groupBy({
        by: ['shareLinkId'],
        where,
        _count: { _all: true },
        _avg: { activeSeconds: true },
      }),
      this.prisma.session.groupBy({
        by: ['shareLinkId', 'visitorId'],
        where,
      }),
      this.prisma.lead.groupBy({
        by: ['sessionId'],
        where: { session: where },
        _count: { _all: true },
      }),
      this.prisma.event.groupBy({
        by: ['sessionId'],
        where: { type: EventType.CONTACT_CLICK, session: where },
        _count: { _all: true },
      }),
    ]);

    for (const id of ids) map.set(id, this.emptyStats());

    for (const v of visits) {
      if (!v.shareLinkId) continue;
      const s = map.get(v.shareLinkId);
      if (!s) continue;
      s.visits = v._count._all;
      s.avgDurationSec = Math.round(v._avg.activeSeconds ?? 0);
    }
    for (const v of visitors) {
      if (!v.shareLinkId) continue;
      const s = map.get(v.shareLinkId);
      if (s) s.uniqueVisitors += 1;
    }

    // Leads et clics de contact : on retrouve le lien via la session.
    const sessionIds = [
      ...new Set([
        ...leads.map((l) => l.sessionId),
        ...contacts.map((c) => c.sessionId),
      ]),
    ].filter((x): x is string => Boolean(x));
    if (sessionIds.length > 0) {
      const sessions = await this.prisma.session.findMany({
        where: { id: { in: sessionIds } },
        select: { id: true, shareLinkId: true },
      });
      const linkBySession = new Map(sessions.map((s) => [s.id, s.shareLinkId]));
      for (const l of leads) {
        const linkId = l.sessionId ? linkBySession.get(l.sessionId) : null;
        const s = linkId ? map.get(linkId) : undefined;
        if (s) s.leads += l._count._all;
      }
      for (const c of contacts) {
        const linkId = linkBySession.get(c.sessionId);
        const s = linkId ? map.get(linkId) : undefined;
        if (s) s.contacts += c._count._all;
      }
    }
    for (const s of map.values()) s.contacts += s.leads;

    return map;
  }
}
