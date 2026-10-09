# Déploiement Relwick (phase B13 — brouillon)

À finaliser quand l’hébergement sera choisi. Hypothèse : VPS Ubuntu, Nginx, PM2, MySQL 8.

## Builds

```bash
pnpm install
pnpm --filter @relwick/shared build
pnpm --filter @relwick/api build
pnpm --filter @relwick/web build
```

Pour Next.js en mode `standalone`, ajouter dans `apps/web/next.config.ts` : `output: 'standalone'`.

## Variables de production (exemple)

- `TRUST_PROXY=true`
- `COOKIE_DOMAIN=.relwick.com`
- `COOKIE_SECURE=true`
- `WEB_ORIGIN=https://relwick.com`
- Secrets JWT longs et uniques
- `DATABASE_URL` pointant vers MySQL distant

## Nginx (esquisse)

- `relwick.com` → Next.js `:3000`
- `api.relwick.com` → NestJS `:4000`
- HTTPS Let’s Encrypt
- En-têtes `X-Forwarded-For` / `X-Real-IP`

## PM2

Créer un `ecosystem.config.js` lançant `apps/api` et `apps/web` (ou le serveur standalone Next).

## Ops

- `prisma migrate deploy` à chaque déploiement
- Sauvegarde quotidienne `mysqldump` (rétention 14 jours)
- Mise à jour mensuelle GeoLite2 (`geoipupdate`)
