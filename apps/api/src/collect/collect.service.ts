import { Injectable, Logger } from '@nestjs/common';
import { DeviceType, EventType, Prisma, SharePlatform, SourceCategory } from '@prisma/client';
import { EventType as SharedEventType } from '@relwick/shared';
import { Decimal } from '@prisma/client/runtime/library';
import { classifySource, referrerDomain } from '../common/utils/source.utils';
import { ipVersion } from '../common/utils/ip.utils';
import { parseUserAgent } from '../common/utils/ua.utils';
import { GeoService } from '../geo/geo.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsCacheService } from '../settings/settings-cache.service';
import type { CollectEventDto, CollectPayloadDto } from './collect.dto';

const SOCIAL_PLATFORMS: SharePlatform[] = [
  SharePlatform.FACEBOOK,
  SharePlatform.INSTAGRAM,
  SharePlatform.TIKTOK,
  SharePlatform.LINKEDIN,
  SharePlatform.X,
  SharePlatform.YOUTUBE,
];

export function sourceForPlatform(platform: SharePlatform): SourceCategory {
  if (platform === SharePlatform.WHATSAPP) return SourceCategory.WHATSAPP;
  if (SOCIAL_PLATFORMS.includes(platform)) return SourceCategory.SOCIAL;
  return SourceCategory.CAMPAIGN;
}

const CLICK_TYPES: EventType[] = [
  EventType.CLICK,
  EventType.CTA_CLICK,
  EventType.CONTACT_CLICK,
  EventType.OUTBOUND_CLICK,
];

@Injectable()
export class CollectService {
  private readonly logger = new Logger(CollectService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geo: GeoService,
    private readonly settingsCache: SettingsCacheService,
  ) {}

  async process(payload: CollectPayloadDto, ip: string, userAgent: string): Promise<void> {
    if (await this.settingsCache.isIpExcluded(ip)) {
      return;
    }

    const now = new Date();
    const validEvents = payload.events.filter((e) => this.isValidTimestamp(e.ts, now));

    await this.prisma.$transaction(async (tx) => {
      let session = await tx.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session) {
        session = await this.createSession(tx, payload, ip, userAgent, now);
      }

      if (session.isExcluded) {
        return;
      }

      for (const event of validEvents) {
        await this.applyEvent(tx, session.id, payload.visitorId, event);
      }

      await this.refreshSessionCounters(tx, session.id);
    });
  }

  private isValidTimestamp(ts: number, now: Date): boolean {
    const ms = ts > 1e12 ? ts : ts * 1000;
    const diff = Math.abs(now.getTime() - ms);
    return diff <= 24 * 60 * 60 * 1000;
  }

  private eventDate(ts: number): Date {
    return new Date(ts > 1e12 ? ts : ts * 1000);
  }

  private async createSession(
    tx: Prisma.TransactionClient,
    payload: CollectPayloadDto,
    ip: string,
    userAgent: string,
    now: Date,
  ): Promise<Prisma.SessionGetPayload<object>> {
    const ctx = payload.context;
    const landingPath = ctx?.landingPath ?? '/';
    const parsedUa = parseUserAgent(userAgent);
    const geo = this.geo.lookup(ip);
    let source: SourceCategory = classifySource({
      referrer: ctx?.referrer ?? null,
      utmSource: ctx?.utm?.source,
      utmMedium: ctx?.utm?.medium,
      utmCampaign: ctx?.utm?.campaign,
    }) as SourceCategory;

    // Visite issue d'un lien de partage : on la rattache au lien et on affine la source.
    let shareLinkId: string | null = null;
    if (ctx?.shareLink) {
      const link = await tx.shareLink.findUnique({
        where: { slug: ctx.shareLink },
        select: { id: true, platform: true },
      });
      if (link) {
        shareLinkId = link.id;
        source = sourceForPlatform(link.platform);
      }
    }

    const excluded = await this.settingsCache.isIpExcluded(ip);

    await tx.visitor.upsert({
      where: { id: payload.visitorId },
      create: {
        id: payload.visitorId,
        firstSeenAt: now,
        lastSeenAt: now,
        sessionCount: 1,
        firstIp: ip,
        lastIp: ip,
        lastCity: geo?.city ?? null,
        lastCountry: geo?.countryCode ?? null,
        isBot: parsedUa.isBot,
      },
      update: {
        lastSeenAt: now,
        lastIp: ip,
        lastCity: geo?.city ?? null,
        lastCountry: geo?.countryCode ?? null,
        isBot: parsedUa.isBot,
        sessionCount: { increment: ctx?.isNewSession ? 1 : 0 },
      },
    });

    return tx.session.create({
      data: {
        id: payload.sessionId,
        visitorId: payload.visitorId,
        ip,
        ipVersion: ipVersion(ip),
        asn: geo?.asn ?? null,
        isp: geo?.isp ?? null,
        countryCode: geo?.countryCode ?? null,
        country: geo?.country ?? null,
        region: geo?.region ?? null,
        city: geo?.city ?? null,
        postalCode: geo?.postalCode ?? null,
        latitude:
          geo?.latitude != null ? new Decimal(geo.latitude.toFixed(6)) : null,
        longitude:
          geo?.longitude != null ? new Decimal(geo.longitude.toFixed(6)) : null,
        accuracyKm: geo?.accuracyKm ?? null,
        geoTimezone: geo?.timezone ?? null,
        userAgent,
        browser: parsedUa.browser,
        browserVersion: parsedUa.browserVersion,
        os: parsedUa.os,
        osVersion: parsedUa.osVersion,
        deviceType: parsedUa.deviceType as DeviceType,
        deviceVendor: parsedUa.deviceVendor,
        deviceModel: parsedUa.deviceModel,
        screenW: ctx?.screen?.w ?? null,
        screenH: ctx?.screen?.h ?? null,
        viewportW: ctx?.viewport?.w ?? null,
        viewportH: ctx?.viewport?.h ?? null,
        language: ctx?.language ?? null,
        browserTimezone: ctx?.timezone ?? null,
        referrer: ctx?.referrer || null,
        referrerDomain: referrerDomain(ctx?.referrer),
        sourceCategory: source,
        utmSource: ctx?.utm?.source ?? null,
        utmMedium: ctx?.utm?.medium ?? null,
        utmCampaign: ctx?.utm?.campaign ?? null,
        utmTerm: ctx?.utm?.term ?? null,
        utmContent: ctx?.utm?.content ?? null,
        shareLinkId,
        landingPath: landingPath.slice(0, 512),
        lastActivityAt: now,
        isBot: parsedUa.isBot,
        isExcluded: excluded,
      },
    });
  }

  private async applyEvent(
    tx: Prisma.TransactionClient,
    sessionId: string,
    visitorId: string,
    event: CollectEventDto,
  ): Promise<void> {
    const occurredAt = this.eventDate(event.ts);

    if (event.type === SharedEventType.HEARTBEAT) {
      const addSec = Math.min(event.activeSeconds ?? 0, 20);
      const scroll = event.maxScrollPct ?? 0;
      if (event.pageViewId) {
        const pv = await tx.pageView.findUnique({ where: { id: event.pageViewId } });
        if (pv) {
          await tx.pageView.update({
            where: { id: event.pageViewId },
            data: {
              activeSeconds: { increment: addSec },
              maxScrollPct: Math.max(pv.maxScrollPct, scroll),
              lastActivityAt: occurredAt,
            },
          });
        }
      }
      const session = await tx.session.findUniqueOrThrow({ where: { id: sessionId } });
      await tx.session.update({
        where: { id: sessionId },
        data: {
          activeSeconds: { increment: addSec },
          maxScrollPct: Math.max(session.maxScrollPct, scroll),
          lastActivityAt: occurredAt,
        },
      });
      await tx.visitor.update({
        where: { id: visitorId },
        data: { lastSeenAt: occurredAt },
      });
      return;
    }

    if (event.type === SharedEventType.PAGEVIEW && event.pageViewId && event.path) {
      await tx.pageView.upsert({
        where: { id: event.pageViewId },
        create: {
          id: event.pageViewId,
          sessionId,
          path: event.path.slice(0, 512),
          title: event.title?.slice(0, 255) ?? null,
          enteredAt: occurredAt,
          lastActivityAt: occurredAt,
        },
        update: {
          lastActivityAt: occurredAt,
          title: event.title?.slice(0, 255) ?? undefined,
        },
      });
      await tx.session.update({
        where: { id: sessionId },
        data: {
          exitPath: event.path.slice(0, 512),
          lastActivityAt: occurredAt,
        },
      });
    }

    const prismaType = event.type as EventType;
    if (!Object.values(EventType).includes(prismaType)) {
      this.logger.warn(`Type d'événement ignoré : ${event.type}`);
      return;
    }

    await tx.event.create({
      data: {
        sessionId,
        pageViewId: event.pageViewId ?? null,
        type: prismaType,
        name: event.name?.slice(0, 120) ?? null,
        label: event.label?.slice(0, 160) ?? null,
        section: event.section?.slice(0, 60) ?? null,
        href: event.href?.slice(0, 1024) ?? null,
        value: event.value ?? null,
        xPct: event.xPct ?? null,
        yPx: event.yPx ?? null,
        meta: event.meta ? (event.meta as Prisma.InputJsonValue) : undefined,
        occurredAt,
      },
    });

    const sessionUpdate: Prisma.SessionUpdateInput = {
      lastActivityAt: occurredAt,
      eventCount: { increment: 1 },
    };

    if (CLICK_TYPES.includes(prismaType)) {
      sessionUpdate.clickCount = { increment: 1 };
    }
    if (event.section) {
      sessionUpdate.lastSection = event.section.slice(0, 60);
    }
    if (event.path) {
      sessionUpdate.exitPath = event.path.slice(0, 512);
    }
    if (event.type === SharedEventType.SCROLL_DEPTH && event.value != null) {
      const session = await tx.session.findUniqueOrThrow({ where: { id: sessionId } });
      sessionUpdate.maxScrollPct = Math.max(session.maxScrollPct, event.value);
    }

    await tx.session.update({ where: { id: sessionId }, data: sessionUpdate });
    await tx.visitor.update({
      where: { id: visitorId },
      data: { lastSeenAt: occurredAt },
    });
  }

  private async refreshSessionCounters(
    tx: Prisma.TransactionClient,
    sessionId: string,
  ): Promise<void> {
    const [pvCount, evCount, clickCount] = await Promise.all([
      tx.pageView.count({ where: { sessionId } }),
      tx.event.count({ where: { sessionId } }),
      tx.event.count({
        where: { sessionId, type: { in: CLICK_TYPES } },
      }),
    ]);
    await tx.session.update({
      where: { id: sessionId },
      data: { pageviewCount: pvCount, eventCount: evCount, clickCount },
    });
  }
}
