import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { csvWithBom } from '../common/utils/csv.utils';
import { PrismaService } from '../prisma/prisma.service';
import { buildSessionWhere } from '../stats/stats-filter.util';
import type { StatsQueryDto } from '../stats/dto/stats-query.dto';
import { formatEventLabel } from './event-label.util';

export interface SessionListQuery extends StatsQueryDto {
  page?: number;
  pageSize?: number;
  q?: string;
  minDuration?: number;
  maxDuration?: number;
  converted?: boolean;
  isBounce?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  private listWhere(query: SessionListQuery): Prisma.SessionWhereInput {
    const where = buildSessionWhere(query);
    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }
    if (query.minDuration != null || query.maxDuration != null) {
      where.activeSeconds = {};
      if (query.minDuration != null) where.activeSeconds.gte = query.minDuration;
      if (query.maxDuration != null) where.activeSeconds.lt = query.maxDuration;
    }
    if (query.converted === true) where.converted = true;
    if (query.converted === false) where.converted = false;
    if (query.isBounce === true) where.isBounce = true;
    if (query.isBounce === false) where.isBounce = false;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        ...(where.OR ?? []),
        { ip: { contains: q } },
        { city: { contains: q } },
        { isp: { contains: q } },
        { referrer: { contains: q } },
      ];
    }
    return where;
  }

  async list(query: SessionListQuery) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const where = this.listWhere(query);
    const orderField =
      query.sort === 'duration'
        ? 'activeSeconds'
        : query.sort === 'depth'
          ? 'maxScrollPct'
          : query.sort === 'clicks'
            ? 'clickCount'
            : 'startedAt';
    const orderDir = query.order === 'asc' ? 'asc' : 'desc';

    const [total, items, ipGroups] = await Promise.all([
      this.prisma.session.count({ where }),
      this.prisma.session.findMany({
        where,
        orderBy: [{ [orderField]: orderDir }, { startedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { shareLink: { select: { id: true, name: true, platform: true, slug: true } } },
      }),
      this.prisma.session.groupBy({ by: ['ip'], where }),
    ]);

    const ips = items.map((s) => s.ip);
    const ipCounts =
      ips.length === 0
        ? []
        : await this.prisma.session.groupBy({
            by: ['ip'],
            where: { ip: { in: ips }, isExcluded: false },
            _count: { _all: true },
          });
    const ipCountMap = new Map(ipCounts.map((g) => [g.ip, g._count._all]));

    return {
      total,
      uniqueIps: ipGroups.length,
      page,
      pageSize,
      items: items.map((s) => ({ ...s, ipVisitCount: ipCountMap.get(s.ip) ?? 1 })),
    };
  }

  async detail(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        visitor: true,
        pageViews: { orderBy: { enteredAt: 'asc' } },
        events: { orderBy: { occurredAt: 'asc' } },
        leads: true,
        shareLink: { select: { id: true, name: true, platform: true, slug: true } },
      },
    });
    if (!session) throw new NotFoundException('Visite introuvable.');

    type TimelineItem = {
      kind: 'pageview' | 'event';
      at: string;
      label: string;
      data: unknown;
    };

    const timeline: TimelineItem[] = [];

    for (const pv of session.pageViews) {
      timeline.push({
        kind: 'pageview',
        at: pv.enteredAt.toISOString(),
        label: `Arrivée sur ${pv.path}${pv.title ? ` — ${pv.title}` : ''}`,
        data: pv,
      });
    }
    for (const ev of session.events) {
      timeline.push({
        kind: 'event',
        at: ev.occurredAt.toISOString(),
        label: formatEventLabel(ev),
        data: ev,
      });
    }

    timeline.sort((a, b) => a.at.localeCompare(b.at));

    const ipVisitCount = await this.prisma.session.count({
      where: { ip: session.ip, isExcluded: false },
    });

    return { session: { ...session, ipVisitCount }, timeline };
  }

  async visitorProfile(id: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { startedAt: 'desc' } },
        leads: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!visitor) throw new NotFoundException('Visiteur introuvable.');
    const ips = [...new Set(visitor.sessions.map((s) => s.ip))];
    const cities = [...new Set(visitor.sessions.map((s) => s.city).filter(Boolean))];
    return { visitor, ips, cities };
  }

  async exportCsv(query: SessionListQuery): Promise<string> {
    const where = this.listWhere(query);
    const sessions = await this.prisma.session.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 10_000,
    });
    return csvWithBom(
      [
        'id',
        'startedAt',
        'ip',
        'city',
        'country',
        'isp',
        'deviceType',
        'browser',
        'os',
        'sourceCategory',
        'landingPath',
        'exitPath',
        'lastSection',
        'pageviewCount',
        'clickCount',
        'activeSeconds',
        'maxScrollPct',
        'isBounce',
        'converted',
        'isBot',
      ],
      sessions.map((s) => [
        s.id,
        s.startedAt.toISOString(),
        s.ip,
        s.city ?? '',
        s.country ?? '',
        s.isp ?? '',
        s.deviceType,
        s.browser ?? '',
        s.os ?? '',
        s.sourceCategory,
        s.landingPath,
        s.exitPath ?? '',
        s.lastSection ?? '',
        String(s.pageviewCount),
        String(s.clickCount),
        String(s.activeSeconds),
        String(s.maxScrollPct),
        s.isBounce == null ? '' : String(s.isBounce),
        String(s.converted),
        String(s.isBot),
      ]),
    );
  }
}
