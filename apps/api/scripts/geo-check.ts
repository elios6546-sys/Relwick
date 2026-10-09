/**
 * Vérifie la présence des bases GeoLite2 (geo:check).
 * Implémentation complète dans GeoModule (phase ultérieure).
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const city = process.env.GEOIP_CITY_DB ?? './geo/GeoLite2-City.mmdb';
const asn = process.env.GEOIP_ASN_DB ?? './geo/GeoLite2-ASN.mmdb';

const cityPath = resolve(process.cwd(), city);
const asnPath = resolve(process.cwd(), asn);

let ok = true;

if (!existsSync(cityPath)) {
  console.error(`[geo:check] Fichier City introuvable : ${cityPath}`);
  ok = false;
} else {
  console.log(`[geo:check] City OK : ${cityPath}`);
}

if (!existsSync(asnPath)) {
  console.error(`[geo:check] Fichier ASN introuvable : ${asnPath}`);
  ok = false;
} else {
  console.log(`[geo:check] ASN OK : ${asnPath}`);
}

process.exit(ok ? 0 : 1);
