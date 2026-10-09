# Relwick

Site vitrine Relwick + mesure d’audience maison + dashboard administrateur.

Stack : **Next.js** (`apps/web`) · **NestJS** (`apps/api`) · **MySQL / MariaDB XAMPP** · **Prisma** · monorepo **pnpm**.

## Prérequis

- Node.js 22 LTS (20 minimum)
- pnpm 9+
- XAMPP avec **MySQL démarré** (Apache uniquement pour phpMyAdmin)
- Compte MaxMind gratuit (optionnel) pour GeoLite2-City et GeoLite2-ASN

## Installation

```bash
# 1. Cloner / ouvrir le dossier
cd C:\xampp\htdocs\Relwick_system

# 2. Dépendances
pnpm install
pnpm --filter @relwick/shared build

# 3. Créer la base (phpMyAdmin ou SQL)
CREATE DATABASE relwick CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. Variables d'environnement
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local
# Éditer apps\api\.env : ADMIN_PASSWORD, secrets JWT

# 5. Migration + seed admin
pnpm db:migrate
pnpm db:seed

# 6. (Optionnel) données de démo pour le dashboard
pnpm db:seed:demo

# 7. (Optionnel) fichiers GeoLite2
# Placer GeoLite2-City.mmdb et GeoLite2-ASN.mmdb dans apps/api/geo/
pnpm geo:check

# 8. Lancer
pnpm dev
```

- Front : http://localhost:3000  
- API : http://localhost:4000/health  
- Docs API (hors prod) : http://localhost:4000/docs  
- Admin : http://localhost:3000/admin/login  

Identifiants admin : `ADMIN_EMAIL` / `ADMIN_PASSWORD` du `.env` API.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `pnpm dev` | API + web en parallèle |
| `pnpm build` | Build production |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Qualité |
| `pnpm db:migrate` | Migrations Prisma |
| `pnpm db:seed` | Compte admin + réglages |
| `pnpm db:seed:demo` | Données de démo (~60 jours) |
| `pnpm db:clear-demo` | Supprime les données de démo |
| `pnpm db:studio` | Prisma Studio |
| `pnpm geo:check` | Vérifie les fichiers MaxMind |

## Assets à fournir plus tard

- Captures des 6 réalisations → `apps/web/public/images/realisations/realisation-1.webp` … `-6.webp`
- Photo d’Elios → `apps/web/public/images/elios.webp`
- Fichiers GeoLite2 → `apps/api/geo/` (à mettre à jour chaque mois via le compte MaxMind / geoipupdate)

## Sécurité locale (XAMPP)

Le fichier `.htaccess` à la racine refuse tout accès Apache à ce dossier (protection des `.env`). Le site tourne via Next.js et NestJS, pas via Apache.

## Structure

```
apps/web          Landing + dashboard Next.js
apps/api          API NestJS + Prisma
packages/shared   Types et constantes partagés
RELWICK.md        Cahier des charges
```

## Licence / auteur

Elios Ngombe — Kolwezi, RDC · Relwick
# Relwick
