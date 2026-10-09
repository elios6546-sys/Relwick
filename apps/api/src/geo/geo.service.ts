import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isPrivateOrLocalIp } from '../common/utils/ip.utils';
import { SimpleLruCache } from '../common/utils/lru-cache';
import type { EnvironmentVariables } from '../config/env.validation';

export type GeoLookupResult = {
  countryCode: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyKm: number | null;
  timezone: string | null;
  asn: number | null;
  isp: string | null;
};

const LOCAL_NETWORK: GeoLookupResult = {
  countryCode: null,
  country: null,
  region: null,
  city: 'Réseau local',
  postalCode: null,
  latitude: null,
  longitude: null,
  accuracyKm: null,
  timezone: null,
  asn: null,
  isp: null,
};

@Injectable()
export class GeoService implements OnModuleInit {
  private readonly logger = new Logger(GeoService.name);
  private cityReader: ReaderModel | null = null;
  private asnReader: ReaderModel | null = null;
  private readonly cache = new SimpleLruCache<string, GeoLookupResult | null>(
    10_000,
    24 * 60 * 60 * 1000,
  );

  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async onModuleInit(): Promise<void> {
    const cityPath = resolve(
      process.cwd(),
      this.config.get('GEOIP_CITY_DB', { infer: true }),
    );
    const asnPath = resolve(
      process.cwd(),
      this.config.get('GEOIP_ASN_DB', { infer: true }),
    );

    if (existsSync(cityPath)) {
      try {
        this.cityReader = await Reader.open(cityPath);
      } catch (err) {
        this.logger.warn(`Impossible de charger GeoLite2-City : ${String(err)}`);
      }
    } else {
      this.logger.warn(`Fichier GeoLite2-City introuvable : ${cityPath}`);
    }

    if (existsSync(asnPath)) {
      try {
        this.asnReader = await Reader.open(asnPath);
      } catch (err) {
        this.logger.warn(`Impossible de charger GeoLite2-ASN : ${String(err)}`);
      }
    } else {
      this.logger.warn(`Fichier GeoLite2-ASN introuvable : ${asnPath}`);
    }
  }

  getStatus(): 'ok' | 'missing' {
    return this.cityReader ? 'ok' : 'missing';
  }

  resolveIpForLookup(ip: string): string {
    const nodeEnv = this.config.get('NODE_ENV', { infer: true });
    const fake = this.config.get('DEV_FAKE_IP', { infer: true });
    if (
      nodeEnv !== 'production' &&
      fake?.trim() &&
      isPrivateOrLocalIp(ip)
    ) {
      return fake.trim();
    }
    return ip;
  }

  lookup(ip: string): GeoLookupResult | null {
    const lookupIp = this.resolveIpForLookup(ip);
    if (isPrivateOrLocalIp(lookupIp)) {
      return { ...LOCAL_NETWORK };
    }

    const cached = this.cache.get(lookupIp);
    if (cached !== undefined) {
      return cached;
    }

    if (!this.cityReader) {
      this.cache.set(lookupIp, null);
      return null;
    }

    try {
      const city = this.cityReader.city(lookupIp);
      const namesFr = city.country?.names?.['fr'];
      const namesEn = city.country?.names?.['en'];
      const cityFr = city.city?.names?.['fr'];
      const cityEn = city.city?.names?.['en'];
      const regionFr = city.subdivisions?.[0]?.names?.['fr'];
      const regionEn = city.subdivisions?.[0]?.names?.['en'];

      let asn: number | null = null;
      let isp: string | null = null;
      if (this.asnReader) {
        try {
          const asnData = this.asnReader.asn(lookupIp);
          asn = asnData.autonomousSystemNumber ?? null;
          isp = asnData.autonomousSystemOrganization ?? null;
        } catch {
          /* IP absente de la base ASN */
        }
      }

      const result: GeoLookupResult = {
        countryCode: city.country?.isoCode ?? null,
        country: namesFr ?? namesEn ?? null,
        region: regionFr ?? regionEn ?? null,
        city: cityFr ?? cityEn ?? null,
        postalCode: city.postal?.code ?? null,
        latitude: city.location?.latitude ?? null,
        longitude: city.location?.longitude ?? null,
        accuracyKm:
          city.location?.accuracyRadius != null
            ? Math.round(city.location.accuracyRadius)
            : null,
        timezone: city.location?.timeZone ?? null,
        asn,
        isp,
      };
      this.cache.set(lookupIp, result);
      return result;
    } catch {
      this.cache.set(lookupIp, null);
      return null;
    }
  }
}
