import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsCacheService } from '../settings/settings-cache.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsCacheService,
  ) {}

  async closeInactiveSessions(): Promise<number> {
    const { sessionTimeoutMin } = await this.settings.getSettings();
    const cutoff = new Date(Date.now() - sessionTimeoutMin * 60 * 1000);
    const open = await this.prisma.session.findMany({
      where: { endedAt: null, lastActivityAt: { lt: cutoff } },
      select: {
        id: true,
        pageviewCount: true,
        clickCount: true,
        activeSeconds: true,
        lastActivityAt: true,
      },
    });

    for (const s of open) {
      const isBounce =
        s.pageviewCount <= 1 && s.clickCount === 0 && s.activeSeconds < 10;
      await this.prisma.session.update({
        where: { id: s.id },
        data: { endedAt: s.lastActivityAt, isBounce },
      });
    }
    if (open.length > 0) {
      this.logger.log(`${open.length} session(s) clôturée(s).`);
    }
    return open.length;
  }

  async computeDailyStats(): Promise<void> {
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      await this.computeDay(daysAgo);
    }
  }

  private async computeDay(daysAgo: number): Promise<void> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        day: Date;
        visits: bigint;
        uniqueVisitors: bigint;
        pageviews: bigint;
        totalActiveSec: bigint;
        bounces: bigint;
        botVisits: bigint;
      }>
    >(Prisma.sql`
      SELECT
        DATE(CONVERT_TZ(s.startedAt, '+00:00', '+02:00')) AS day,
        SUM(CASE WHEN s.isExcluded = false AND s.isBot = false THEN 1 ELSE 0 END) AS visits,
        COUNT(DISTINCT CASE WHEN s.isExcluded = false AND s.isBot = false THEN s.visitorId END) AS uniqueVisitors,
        SUM(CASE WHEN s.isExcluded = false AND s.isBot = false THEN s.pageviewCount ELSE 0 END) AS pageviews,
        SUM(CASE WHEN s.isExcluded = false AND s.isBot = false THEN s.activeSeconds ELSE 0 END) AS totalActiveSec,
        SUM(CASE WHEN s.isExcluded = false AND s.isBot = false AND s.isBounce = true THEN 1 ELSE 0 END) AS bounces,
        SUM(CASE WHEN s.isBot = true THEN 1 ELSE 0 END) AS botVisits
      FROM Session s
      WHERE DATE(CONVERT_TZ(s.startedAt, '+00:00', '+02:00')) = DATE(CONVERT_TZ(DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${daysAgo} DAY), '+00:00', '+02:00'))
      GROUP BY day
    `);

    for (const row of rows) {
      const dayStart = new Date(row.day);
      const newVisitors = await this.prisma.visitor.count({
        where: {
          firstSeenAt: {
            gte: dayStart,
            lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });
      const leads = await this.prisma.lead.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      await this.prisma.dailyStat.upsert({
        where: { date: dayStart },
        create: {
          date: dayStart,
          visits: Number(row.visits),
          uniqueVisitors: Number(row.uniqueVisitors),
          newVisitors,
          pageviews: Number(row.pageviews),
          totalActiveSec: Number(row.totalActiveSec),
          bounces: Number(row.bounces),
          leads,
          botVisits: Number(row.botVisits),
        },
        update: {
          visits: Number(row.visits),
          uniqueVisitors: Number(row.uniqueVisitors),
          newVisitors,
          pageviews: Number(row.pageviews),
          totalActiveSec: Number(row.totalActiveSec),
          bounces: Number(row.bounces),
          leads,
          botVisits: Number(row.botVisits),
        },
      });
    }
  }

  async purgeOldDetail(): Promise<{ events: number; pageViews: number }> {
    const { retentionDays } = await this.settings.getSettings();
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const [events, pageViews] = await Promise.all([
      this.prisma.event.deleteMany({ where: { occurredAt: { lt: cutoff } } }),
      this.prisma.pageView.deleteMany({ where: { enteredAt: { lt: cutoff } } }),
    ]);
    this.logger.log(
      `Purge : ${events.count} événements, ${pageViews.count} pages vues.`,
    );
    return { events: events.count, pageViews: pageViews.count };
  }
}
