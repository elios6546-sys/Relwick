import { randomUUID } from 'node:crypto';
import {
  DeviceType,
  EventType,
  LeadStatus,
  PrismaClient,
  SourceCategory,
} from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = [
  { city: 'Kolwezi', country: 'République démocratique du Congo', code: 'CD' },
  { city: 'Lubumbashi', country: 'République démocratique du Congo', code: 'CD' },
  { city: 'Kinshasa', country: 'République démocratique du Congo', code: 'CD' },
  { city: 'Likasi', country: 'République démocratique du Congo', code: 'CD' },
  { city: 'Johannesburg', country: 'Afrique du Sud', code: 'ZA' },
  { city: 'Paris', country: 'France', code: 'FR' },
  { city: 'Bruxelles', country: 'Belgique', code: 'BE' },
];

const ISPS = ['Vodacom', 'Orange', 'Airtel', 'Africell'];
const SOURCES = [
  SourceCategory.DIRECT,
  SourceCategory.WHATSAPP,
  SourceCategory.SEARCH,
  SourceCategory.SOCIAL,
  SourceCategory.REFERRAL,
];

const CLICK_NAMES = [
  'hero_cta_appel',
  'header_nav_services',
  'services_card_web',
  'realisations_filter_web',
  'contact_whatsapp',
];

function demoIp(index: number): string {
  const block = index % 3;
  const last = (index % 250) + 1;
  if (block === 0) return `192.0.2.${last}`;
  if (block === 1) return `198.51.100.${last}`;
  return `203.0.113.${last}`;
}

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length]!;
}

function randomBetween(min: number, max: number, seed: number): number {
  return min + (seed * 17) % (max - min + 1);
}

async function main(): Promise<void> {
  const visitorCount = 600;
  const sessionCount = 900;
  const leadCount = 25;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  console.log('Génération des visiteurs et sessions de démo…');

  const visitorIds: string[] = [];
  for (let i = 0; i < visitorCount; i++) {
    const id = randomUUID();
    visitorIds.push(id);
    const seen = new Date(now - randomBetween(1, 60, i) * dayMs);
    const loc = pick(CITIES, i);
    const ip = demoIp(i);
    await prisma.visitor.create({
      data: {
        id,
        firstSeenAt: seen,
        lastSeenAt: new Date(seen.getTime() + randomBetween(0, 5, i) * 3600000),
        sessionCount: randomBetween(1, 3, i + 7),
        firstIp: ip,
        lastIp: ip,
        lastCity: loc.city,
        lastCountry: loc.code,
        isBot: i % 20 === 0,
      },
    });
  }

  const sessionIds: string[] = [];
  for (let s = 0; s < sessionCount; s++) {
    const id = randomUUID();
    sessionIds.push(id);
    const visitorId = pick(visitorIds, s);
    const loc = pick(CITIES, s + 3);
    const ip = demoIp(s + 100);
    const started = new Date(now - randomBetween(0, 59, s) * dayMs - randomBetween(0, 86400, s) * 1000);
    const eveningBoost =
      started.getUTCHours() >= 16 || started.getUTCHours() <= 2 ? 1 : 0;
    if (eveningBoost && s % 3 === 0) {
      started.setUTCHours(18 + (s % 5));
    }
    const activeSeconds = randomBetween(15, 900, s);
    const pageviews = randomBetween(1, 5, s);
    const clicks = randomBetween(0, 8, s + 2);
    const isBot = s % 20 === 0;
    const mobile = s % 10 !== 0 && s % 10 !== 1 && s % 10 !== 2;
    const ended =
      s % 4 === 0 ? null : new Date(started.getTime() + activeSeconds * 1000);
    const isBounce =
      ended != null && pageviews <= 1 && clicks === 0 && activeSeconds < 10;

    await prisma.session.create({
      data: {
        id,
        visitorId,
        ip,
        ipVersion: 4,
        asn: 10000 + (s % 500),
        isp: pick(ISPS, s),
        countryCode: loc.code,
        country: loc.country,
        region: loc.city,
        city: loc.city,
        accuracyKm: randomBetween(25, 200, s),
        userAgent: mobile
          ? 'Mozilla/5.0 (Linux; Android 13) Chrome/120.0 Mobile'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        browser: 'Chrome',
        browserVersion: '120.0',
        os: mobile ? 'Android' : 'Windows',
        osVersion: mobile ? '13' : '10',
        deviceType: mobile ? DeviceType.MOBILE : DeviceType.DESKTOP,
        screenW: mobile ? 412 : 1920,
        screenH: mobile ? 915 : 1080,
        viewportW: mobile ? 412 : 1440,
        viewportH: mobile ? 800 : 900,
        language: 'fr-FR',
        browserTimezone: 'Africa/Lubumbashi',
        referrer: s % 5 === 0 ? 'https://www.google.com/' : s % 7 === 0 ? 'https://wa.me/243975993035' : null,
        referrerDomain: s % 5 === 0 ? 'www.google.com' : s % 7 === 0 ? 'wa.me' : null,
        sourceCategory: pick(SOURCES, s),
        landingPath: '/',
        exitPath: s % 3 === 0 ? '/#contact' : '/',
        lastSection: pick(['hero', 'services', 'realisations', 'contact'], s),
        pageviewCount: pageviews,
        eventCount: clicks + pageviews + 2,
        clickCount: clicks,
        maxScrollPct: randomBetween(25, 100, s) as number,
        activeSeconds,
        startedAt: started,
        lastActivityAt: new Date(started.getTime() + activeSeconds * 1000),
        endedAt: ended,
        isBounce: ended ? isBounce : null,
        isBot,
        isExcluded: false,
        converted: false,
      },
    });

    const pvId = randomUUID();
    await prisma.pageView.create({
      data: {
        id: pvId,
        sessionId: id,
        path: '/',
        title: 'Relwick — Sites web et applications à Kolwezi',
        enteredAt: started,
        lastActivityAt: new Date(started.getTime() + activeSeconds * 1000),
        activeSeconds,
        maxScrollPct: randomBetween(30, 95, s),
      },
    });

    const events = [
      {
        sessionId: id,
        pageViewId: pvId,
        type: EventType.PAGEVIEW,
        name: 'pageview',
        label: 'Accueil',
        occurredAt: started,
      },
      {
        sessionId: id,
        pageViewId: pvId,
        type: EventType.SECTION_VIEW,
        section: 'services',
        value: randomBetween(3000, 12000, s),
        occurredAt: new Date(started.getTime() + 5000),
      },
      {
        sessionId: id,
        pageViewId: pvId,
        type: EventType.SCROLL_DEPTH,
        value: 50,
        occurredAt: new Date(started.getTime() + 8000),
      },
      ...Array.from({ length: Math.min(clicks, 3) }).map((_, c) => ({
        sessionId: id,
        pageViewId: pvId,
        type: EventType.CTA_CLICK,
        name: pick(CLICK_NAMES, s + c),
        label: 'Réserver un appel',
        section: 'hero',
        occurredAt: new Date(started.getTime() + 10000 + c * 2000),
      })),
    ];
    await prisma.event.createMany({ data: events });
  }

  console.log('Génération des leads…');
  for (let l = 0; l < leadCount; l++) {
    const sessionId = pick(sessionIds, l * 3);
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) continue;
    const statuses = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.CALL_SCHEDULED,
      LeadStatus.CONVERTED,
      LeadStatus.LOST,
    ];
    await prisma.lead.create({
      data: {
        visitorId: session.visitorId,
        sessionId: session.id,
        fullName: `Prospect démo ${l + 1}`,
        phone: `+2439759930${String(l).padStart(2, '0')}`,
        email: l % 2 === 0 ? `demo${l}@example.com` : null,
        projectType: 'Site web',
        callSlot: pick(['Matin', 'Après-midi', 'Soir'], l),
        message: 'Demande générée pour le dashboard.',
        consent: true,
        status: pick(statuses, l),
        ip: session.ip,
        city: session.city,
        createdAt: new Date(session.startedAt.getTime() + 60000),
      },
    });
    await prisma.session.update({
      where: { id: sessionId },
      data: { converted: l % 3 !== 0 },
    });
  }

  console.log(
    `Démo : ${visitorCount} visiteurs, ${sessionCount} sessions, ${leadCount} leads.`,
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
