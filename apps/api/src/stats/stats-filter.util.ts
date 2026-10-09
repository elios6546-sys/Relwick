import type { Prisma } from '@prisma/client';
import type { StatsQueryDto } from './dto/stats-query.dto';

export function buildSessionWhere(query: StatsQueryDto): Prisma.SessionWhereInput {
  const where: Prisma.SessionWhereInput = {
    isExcluded: false,
  };

  if (!query.includeBots) {
    where.isBot = false;
  }

  if (query.from || query.to) {
    where.startedAt = {};
    if (query.from) {
      where.startedAt.gte = new Date(query.from);
    }
    if (query.to) {
      where.startedAt.lte = new Date(query.to);
    }
  }

  if (query.countryCode) where.countryCode = query.countryCode;
  if (query.city) where.city = query.city;
  if (query.deviceType) where.deviceType = query.deviceType;
  if (query.sourceCategory) where.sourceCategory = query.sourceCategory;
  if (query.browser) where.browser = query.browser;
  if (query.os) where.os = query.os;
  if (query.path) {
    where.OR = [
      { landingPath: { contains: query.path } },
      { exitPath: { contains: query.path } },
    ];
  }

  return where;
}

export function previousPeriod(
  from: Date,
  to: Date,
): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration),
    to: new Date(from.getTime()),
  };
}

export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}
