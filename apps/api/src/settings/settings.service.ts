import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { extractIp } from '../common/utils/ip.utils';
import type { EnvironmentVariables } from '../config/env.validation';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsCacheService, type AppSettings } from './settings-cache.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SettingsCacheService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly geo: GeoService,
  ) {}

  async getAll(): Promise<AppSettings & { health: { db: string; geo: string } }> {
    const settings = await this.cache.getSettings();
    const dbOk = await this.prisma.ping();
    return {
      ...settings,
      health: {
        db: dbOk ? 'ok' : 'error',
        geo: this.geo.getStatus(),
      },
    };
  }

  async update(body: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.cache.getSettings();
    const next: AppSettings = {
      excludedIps: body.excludedIps ?? current.excludedIps,
      retentionDays: body.retentionDays ?? current.retentionDays,
      showBotsByDefault: body.showBotsByDefault ?? current.showBotsByDefault,
      sessionTimeoutMin: body.sessionTimeoutMin ?? current.sessionTimeoutMin,
    };
    await this.persistSettings(next);
    return next;
  }

  async excludeMyIp(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } }): Promise<AppSettings> {
    const ip = extractIp(
      req as Parameters<typeof extractIp>[0],
      this.config.get('TRUST_PROXY', { infer: true }),
    );
    const settings = await this.cache.getSettings();
    if (!settings.excludedIps.includes(ip)) {
      settings.excludedIps.push(ip);
      await this.persistSettings(settings);
    }
    return settings;
  }

  async purgeNow(): Promise<{ deletedEvents: number; deletedPageViews: number }> {
    const settings = await this.cache.getSettings();
    const cutoff = new Date(Date.now() - settings.retentionDays * 24 * 60 * 60 * 1000);
    const [deletedEvents, deletedPageViews] = await Promise.all([
      this.prisma.event.deleteMany({ where: { occurredAt: { lt: cutoff } } }),
      this.prisma.pageView.deleteMany({ where: { enteredAt: { lt: cutoff } } }),
    ]);
    return {
      deletedEvents: deletedEvents.count,
      deletedPageViews: deletedPageViews.count,
    };
  }

  validateExcludedIps(ips: string[]): void {
    for (const entry of ips) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      if (trimmed.includes('/') && !/^\d+\.\d+\.\d+\.\d+\/\d{1,2}$/.test(trimmed)) {
        throw new BadRequestException(`CIDR invalide : ${entry}`);
      }
    }
  }

  private async persistSettings(settings: AppSettings): Promise<void> {
    this.validateExcludedIps(settings.excludedIps);
    const pairs: Array<[string, Prisma.InputJsonValue]> = [
      ['excludedIps', settings.excludedIps],
      ['retentionDays', settings.retentionDays],
      ['showBotsByDefault', settings.showBotsByDefault],
      ['sessionTimeoutMin', settings.sessionTimeoutMin],
    ];
    for (const [key, value] of pairs) {
      await this.prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
    this.cache.invalidate();
  }
}
