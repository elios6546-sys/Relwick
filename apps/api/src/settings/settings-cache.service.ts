import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isIpExcluded } from '../common/utils/cidr.utils';

export interface AppSettings {
  excludedIps: string[];
  retentionDays: number;
  showBotsByDefault: boolean;
  sessionTimeoutMin: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  excludedIps: [],
  retentionDays: 395,
  showBotsByDefault: false,
  sessionTimeoutMin: 30,
};

@Injectable()
export class SettingsCacheService {
  private cached: AppSettings = { ...DEFAULT_SETTINGS };
  private cachedAt = 0;
  private readonly ttlMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<AppSettings> {
    if (Date.now() - this.cachedAt < this.ttlMs) {
      return this.cached;
    }
    const rows = await this.prisma.setting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    this.cached = {
      excludedIps: parseStringArray(map.get('excludedIps')),
      retentionDays: parseNumber(map.get('retentionDays'), DEFAULT_SETTINGS.retentionDays),
      showBotsByDefault: parseBoolean(
        map.get('showBotsByDefault'),
        DEFAULT_SETTINGS.showBotsByDefault,
      ),
      sessionTimeoutMin: parseNumber(
        map.get('sessionTimeoutMin'),
        DEFAULT_SETTINGS.sessionTimeoutMin,
      ),
    };
    this.cachedAt = Date.now();
    return this.cached;
  }

  invalidate(): void {
    this.cachedAt = 0;
  }

  async isIpExcluded(ip: string): Promise<boolean> {
    const settings = await this.getSettings();
    return isIpExcluded(ip, settings.excludedIps);
  }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function parseNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return fallback;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}
