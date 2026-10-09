# RELWICK — Cahier des charges et prompts Cursor

> Site vitrine Relwick + système de mesure d'audience maison + dashboard administrateur
> Stack : **Next.js** (front + dashboard) · **NestJS** (API) · **MySQL / MariaDB de XAMPP** (base de données) · **Prisma** (ORM)
> Auteur du projet : Elios Ngombe — Kolwezi, RDC · Version du document : octobre 2026

---

## 0. Mode d'emploi (à lire avant de commencer)

1. Le projet se construit **directement dans `C:\xampp\htdocs\Relwick_system`**, à côté des fichiers de design qui y sont déjà. **On ne déplace et on ne supprime rien.** Les éléments de design existants servent de référence et restent à leur place :
   - `Landing page agence web/Landing Relwick.dc.html` → **source de vérité visuelle** de la landing page
   - `Landing page agence web/_ds/relwick-design-system-*/` → tokens CSS, `readme.md` (charte), `tokens/components.css` (classes `.rw-*`)
   - `Landing page agence web/assets/` → `hero-montagnes.jpg`, logos SVG, favicon
   - `Relwick_Identite_v2/` → logos, icônes d'app, `CODE/relwick-tokens.json`
   - `Landing Relwick.pdf` → rendu attendu de la page
2. Place **ce fichier** à la racine : `C:\xampp\htdocs\Relwick_system\RELWICK.md`.
3. Dans Cursor, ouvre le dossier `C:\xampp\htdocs\Relwick_system`, passe en mode **Agent**, et colle les prompts de la **partie B** **un par un, dans l'ordre**. Chaque prompt commence par `@RELWICK.md` pour que Cursor relise ce cahier des charges.
4. Après chaque phase : lance les commandes de vérification indiquées, corrige si besoin, puis fais un commit Git avant de passer à la suivante.
5. Dans le panneau XAMPP, démarre **MySQL**. Crée la base `relwick` en `utf8mb4_unicode_ci` via phpMyAdmin (Apache doit être démarré pour phpMyAdmin) ou avec la commande indiquée en phase 2.
6. **Sécurité locale** : comme le projet est dans `htdocs`, Apache pourrait servir ses fichiers (dont les `.env` avec les mots de passe) à l'adresse `http://localhost/Relwick_system/`. Le prompt B1 crée un fichier `.htaccess` à la racine qui bloque cet accès. Le site lui-même tourne sur `http://localhost:3000` (Next.js) et l'API sur `http://localhost:4000` (NestJS), pas via Apache.

---

# PARTIE A — CAHIER DES CHARGES

## A1. Le projet en une phrase

Relwick est une agence de création de sites web et d'applications (Android, iOS, PC) pour les particuliers et les entreprises, basée à Kolwezi. Le projet comporte :

1. **La landing page publique**, reconstruite en Next.js à l'identique du design Claude Design (`Landing Relwick.dc.html`).
2. **Un traceur d'audience maison** intégré à la landing : chaque visite est enregistrée (IP complète, ville, pays, appareil, source, durée, boutons cliqués, sections vues, profondeur de scroll, endroit où le visiteur s'est arrêté).
3. **Une API NestJS** qui reçoit ces événements, géolocalise les IP, stocke tout dans MySQL et calcule les statistiques.
4. **Un dashboard administrateur** (`/admin`, réservé à Elios seul) qui affiche et filtre toutes ces données, plus les demandes d'appel reçues par le formulaire.

Aucun outil tiers d'analytics (pas de Google Analytics, pas de Matomo) : tout est maison et les données restent dans la base MySQL.

## A2. Choix techniques imposés

| Domaine | Choix |
|---|---|
| Monorepo | **pnpm workspaces** : `apps/web`, `apps/api`, `packages/shared` |
| Runtime | Node.js 22 LTS (ou 20 LTS minimum) |
| Front + dashboard | **Next.js** dernière version stable, App Router, TypeScript strict, React Server Components par défaut |
| Styles | Tokens CSS du design system Relwick (copiés tels quels) + **Tailwind CSS v4** pour la mise en page. Pas d'autre UI kit (pas de shadcn, pas de MUI) : les composants reprennent les classes `.rw-*` de `tokens/components.css` |
| Polices | `next/font/google` : **Instrument Sans** (400/500/600) et **JetBrains Mono** (400) |
| Icônes | `lucide-react` (trait 2 px), conformément à la charte |
| Animations | `motion` (Framer Motion), toujours en respectant `prefers-reduced-motion` |
| Données côté dashboard | **TanStack Query** (cache + polling), **TanStack Table** (tableaux), **Recharts** (graphiques), **react-leaflet** + tuiles OpenStreetMap (carte) |
| API | **NestJS** dernière version stable, TypeScript strict |
| ORM | **Prisma** (provider `mysql`, compatible avec le MariaDB de XAMPP). Si la version installée de Prisma est ≥ 7, suivre la doc officielle : `prisma.config.ts` + adapter MySQL/MariaDB |
| Base de données | MySQL/MariaDB de **XAMPP en local** (`localhost:3306`, utilisateur `root`, sans mot de passe par défaut), base `relwick`, `utf8mb4` |
| Géolocalisation IP | **MaxMind GeoLite2-City** (+ GeoLite2-ASN pour l'opérateur), fichiers `.mmdb` hors ligne lus avec `@maxmind/geoip2-node` |
| Navigateur / OS / appareil | `ua-parser-js` |
| Détection des robots | `isbot` |
| Validation | `class-validator` + `class-transformer` côté API, `zod` côté front, types partagés dans `packages/shared` |
| Auth admin | JWT en cookies **httpOnly** (access 15 min + refresh 7 j avec rotation), mots de passe hachés avec **argon2** |
| Tâches planifiées | `@nestjs/schedule` |
| Sécurité API | `helmet`, CORS en liste blanche, `@nestjs/throttler`, `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` |
| Tests | Jest (API, unitaires + e2e avec supertest), Playwright (parcours front) |
| Langue | Interface 100 % en **français**, fuseau d'affichage **Africa/Lubumbashi (UTC+2, pas d'heure d'été)**, stockage en **UTC** |

Ports en local : front `http://localhost:3000`, API `http://localhost:4000`.

## A3. Arborescence cible

```
relwick/
├─ RELWICK.md                      ← ce fichier
├─                ← copie de Relwick_system (lecture seule, ne jamais modifier)
├─ package.json                    ← scripts racine (dev, build, lint, test, db:*)
├─ pnpm-workspace.yaml
├─ .cursor/rules/relwick.mdc       ← règles Cursor (voir A12)
├─ apps/
│  ├─ web/                         ← Next.js
│  │  ├─ public/brand/             ← logos, favicon, icônes d'app
│  │  ├─ public/images/            ← hero-montagnes.jpg, captures des réalisations
│  │  └─ src/
│  │     ├─ app/
│  │     │  ├─ (site)/page.tsx                 ← landing
│  │     │  ├─ (site)/confidentialite/page.tsx
│  │     │  ├─ (site)/mentions-legales/page.tsx
│  │     │  ├─ admin/login/page.tsx
│  │     │  └─ admin/(protected)/…             ← dashboard
│  │     ├─ components/ui/          ← Button, Input, Select, Card, Badge, Tag, Tabs, Dialog, Toast, Tooltip, Switch, Checkbox, Radio
│  │     ├─ components/site/        ← Header, Hero, Services, Realisations, APropos, Contact, Footer, PrivacyNotice
│  │     ├─ components/admin/       ← Sidebar, PeriodPicker, KpiTile, charts, tables, SessionTimeline, GeoMap…
│  │     ├─ lib/tracker/            ← traceur d'audience
│  │     ├─ lib/api.ts              ← client HTTP (fetch, credentials: 'include')
│  │     └─ styles/tokens/          ← copies exactes des fichiers tokens/*.css
│  └─ api/                         ← NestJS
│     ├─ geo/                      ← GeoLite2-City.mmdb, GeoLite2-ASN.mmdb (ignorés par Git)
│     ├─ prisma/schema.prisma, seed.ts, seed-demo.ts
│     └─ src/
│        ├─ prisma/  config/  common/
│        ├─ auth/                  ← login, refresh, logout, me, mot de passe
│        ├─ collect/               ← réception des événements du traceur
│        ├─ geo/                   ← service MaxMind
│        ├─ leads/                 ← formulaire « Réserver un appel »
│        ├─ stats/                 ← agrégations pour le dashboard
│        ├─ sessions/              ← liste + détail des visites, export CSV
│        ├─ settings/              ← IP exclues, rétention, robots
│        └─ jobs/                  ← clôture des sessions, stats journalières, purge
└─ packages/shared/                ← types TS + constantes partagées (noms d'événements, enums, DTO de collecte)
```

## A4. Charte graphique (rappel — la source complète est `.../readme.md`)

**À respecter strictement, sur la landing ET sur le dashboard.**

- **Couleurs** (variables déjà définies dans `tokens/colors.css`, thème clair par défaut + `[data-theme="dark"]`) :
  - Ivoire `#F9F6F1` = fond · Encre `#0D111E` = texte et fond sombre · Surface `#FFFFFF`
  - **Indigo Relwick `#483EFE`** = action principale, **une seule action principale par écran**
  - **Cuivre `#C6782E`** = accent graphique **≤ 5 %** de la surface (filet, point de donnée, éclat). Jamais en fond de bouton ni en texte courant (pour du texte cuivre : `--rw-copper-text` `#894C06`)
  - Malachite / ambre / rouge = **statuts uniquement** (succès, attention, erreur)
  - Variables sémantiques à utiliser partout : `--rw-bg`, `--rw-surface`, `--rw-surface-sunken`, `--rw-line`, `--rw-line-strong`, `--rw-text`, `--rw-text-muted`, `--rw-primary`, `--rw-primary-hover`, `--rw-primary-soft`, `--rw-copper`, `--rw-success`, `--rw-warning`, `--rw-danger`, `--rw-focus`
- **Typographie** : Instrument Sans partout (titres en 500, crénage −0,02 à −0,035 em), JetBrains Mono seulement pour le code, les IP et les petites numérotations. Échelle dans `tokens/typography.css` (`--fs-display` … `--fs-caption`).
- **Espacements** : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 96 px. Conteneur 1200 px, gouttière `--gutter`, sections espacées de 96 px.
- **Rayons** : 6 px boutons/champs, 10 px cartes, 16 px dialogs, pilule pour badges, **forme feuille** `32px 0` (coins opposés arrondis) pour les visuels de marque.
- **Fonds** : aplats uniquement. **Aucun dégradé**, aucune texture, aucune illustration dessinée.
- **Cartes** : surface blanche, filet 1 px `--rw-line`, pas d'ombre au repos ; si interactives : montée de −4 px + `--shadow-3` au survol.
- **Animations** : courbe `--ease-out` `cubic-bezier(.16,1,.3,1)`, durées 160 / 280 / 560 / 900 ms. Révélations au scroll (fondu + montée 28 px, décalage ~90 ms), titre du hero mot par mot sous masque. Désactiver avec `prefers-reduced-motion`.
- **Focus** : anneau 2 px indigo décalé de 2 px (`--focus-ring`). **Pressé** : `scale(.97)`.
- **Logo** : toujours via les fichiers SVG (`relwick-logo.svg` sur clair, `relwick-logo-on-dark.svg` sur sombre). **Ne jamais retaper « relwick » dans une police.** Largeur min. 80 px. Jamais d'ombre, de dégradé ni de contour sur le logo.
- **Rédaction** : français, **vouvoiement**, l'agence parle en « nous », phrases courtes et concrètes, **aucun emoji**, casse de phrase partout (capitales seulement pour les sur-titres 12 px espacés), boutons = verbe à l'infinitif + objet. Typographie française : espace avant `: ; ? !`, guillemets « », « 9 h – 18 h », « 2 000 € ».

## A5. La landing page (à reproduire fidèlement)

Source de vérité : `Landing page agence web/Landing Relwick.dc.html` (styles inline, structure, textes, comportements) et `Landing Relwick.pdf` (rendu). Le fichier `.dc.html` utilise un moteur propriétaire (`support.js`, balises `<x-dc>`, `{{ variables }}`) : **ne pas le réutiliser tel quel**, le **porter** en composants React propres.

**Ordre et contenu des sections** (chaque `<section>` porte `id` + `data-section` pour le traceur) :

1. **Header** collant (72 px) — logo, nav (Services, Réalisations, À propos, Contact), bouton thème clair/sombre, bouton principal « Réserver un appel ». Après scroll : fond Ivoire 82 % + flou 14 px + filet bas. Menu burger sous 860 px.
2. **Hero** (`#accueil`, `data-section="hero"`) — variante **« panneau »** retenue : photo plein cadre `hero-montagnes.jpg`, panneau vitré en bas à gauche. Sur-titre « Agence web & mobile · Kolwezi », titre « Votre site, vos applications. **Bien faits.** » (dernier groupe en indigo clair), révélé mot par mot. Texte : **« Nous créons des sites web et des applications Android, iOS et PC pour les particuliers et les entreprises. Un seul interlocuteur, de la maquette à la mise en ligne. »** (correction : le design disait seulement « particuliers »). Boutons « Réserver un appel » (principal) et « Voir les services » (secondaire). Mention « Premier appel gratuit de 30 minutes, sans engagement. »
3. **Services** (`#services`) — sur-titre, titre « Quatre plateformes, **un seul interlocuteur.** », 4 cartes numérotées 01–04 (Sites web, Applications Android, Applications iOS, Logiciels PC) avec icône, texte et tags. **Grille : 4 colonnes ≥ 1100 px, 2 × 2 entre 640 et 1100 px, 1 colonne en dessous** (le design laissait une carte orpheline sur une ligne).
4. **Réalisations** (`#realisations`) — titre « Quelques projets **réalisés.** », onglets de filtre (Tout, Sites web, Applications, Logiciels PC), 6 cartes projet en grille 2 colonnes. Visuels : en attendant les vraies captures, aplats teintés (indigo-100, copper-100, ink-100…) avec le libellé « Capture d'écran du projet ». Les images réelles iront dans `public/images/realisations/realisation-1.webp` … `-6.webp` (le composant affiche l'image si le fichier existe dans la liste de données, sinon l'aplat).
5. **À propos** (`#apropos`) — visuel en forme feuille (photo d'Elios à venir : `public/images/elios.webp`, aplat indigo en attendant, bloc indigo décalé derrière), titre « Derrière Relwick, **Elios Ngombe.** », textes, liste (Basé à / Métier / Plateformes), boutons « Réserver un appel » et « Écrire un e-mail ».
6. **Réserver un appel** (`#contact`) — titre « Parlons de **votre projet.** », carte de contact (avatar « EN », e-mail `elios6546@gmail.com`, téléphone `+243 975 993 035`, bouton « Écrire sur WhatsApp » → `https://wa.me/243975993035`, Kolwezi), **formulaire** :
   - Nom complet (obligatoire)
   - Téléphone (obligatoire, ≥ 9 chiffres ; erreur « Numéro incomplet, par exemple +243 975 993 035. »)
   - E-mail (facultatif, format vérifié)
   - Type de projet (Site web · Application Android · Application iOS · Application Android et iOS · Logiciel PC · Je ne sais pas encore)
   - Moment préféré pour l'appel (Matin · Après-midi · Soir, en boutons segmentés)
   - Message (facultatif)
   - Case de consentement obligatoire (« J'accepte d'être recontacté au sujet de ma demande. »)
   - Champ piège invisible `website` (anti-spam)
   - Envoi → **Dialog de confirmation** (« Elios Ngombe vous rappellera au …, de préférence le …, pour parler de votre projet (…). ») avec « Modifier » / « Confirmer » → appel `POST /v1/leads` → **Toast** de succès 5 s. Gestion d'erreur réseau avec message clair.
7. **Footer** — logo sur fond Encre, phrase de présentation, colonnes Services / Agence / Contact, « © 2026 Relwick », liens « Confidentialité » et « Mentions légales ».
8. **Bouton WhatsApp flottant** en bas à droite (comme sur le PDF).

Thème clair/sombre : bascule mémorisée dans `localStorage` (try/catch), attribut `data-theme` sur `<html>`, sans flash au chargement (script inline dans `<head>`).

SEO : metadata Next (`title` « Relwick — Sites web et applications à Kolwezi », description, Open Graph avec image, `lang="fr"`), `sitemap.ts`, `robots.ts` (avec `Disallow: /admin`), données structurées JSON-LD `ProfessionalService` (nom, ville, téléphone, e-mail). Performance : `next/image` pour toutes les images, hero en `priority`, Lighthouse ≥ 90 sur les 4 axes.

## A6. Mesure d'audience — ce qu'on collecte

**Décision du propriétaire** : tout est collecté pour tous les visiteurs, avec une page « Confidentialité » qui l'explique et un petit bandeau d'information non bloquant (« Ce site mesure son audience. En savoir plus » + bouton « Compris », affiché une seule fois). Pas de case à cocher de consentement pour la mesure d'audience.

### Définitions (à appliquer partout, de la même façon)

| Terme | Définition |
|---|---|
| **Visiteur** | Navigateur identifié par un cookie first-party `rw_vid` (UUID v4, 13 mois, `SameSite=Lax`). Un visiteur = une personne approximative |
| **Visite (= session)** | Suite d'activités d'un visiteur sans interruption de plus de **30 minutes**. Identifiant `rw_sid` en `sessionStorage` + horodatage de dernière activité. Après 30 min d'inactivité ou changement de jour (heure de Lubumbashi), nouvelle session |
| **Visites totales** | Nombre de sessions (hors robots et hors IP exclues, sauf filtre contraire) |
| **Visiteurs uniques** | Nombre de `visitorId` distincts sur la période |
| **Nouveau visiteur** | Visiteur dont la première session tombe dans la période |
| **Page vue** | Chargement d'une route Next (y compris navigation côté client) |
| **Temps actif** | Secondes où l'onglet est visible **et** où l'utilisateur a interagi (souris, clavier, scroll, toucher) dans les 30 dernières secondes. Mesuré par battements toutes les 15 s, plafonné à 20 s par battement |
| **Durée de visite** | Somme du temps actif de la session |
| **Rebond** | Session avec 1 seule page vue, **aucun clic** et moins de **10 s** de temps actif |
| **Profondeur de scroll** | Pourcentage maximal atteint de la hauteur de page, paliers 25 / 50 / 75 / 90 / 100 |
| **Section vue** | Section visible à ≥ 50 % pendant ≥ 1 s. On enregistre aussi le temps passé dessus |
| **Point d'arrêt** | Pour chaque session : dernière page (`exitPath`), dernière section vue (`lastSection`), profondeur max de scroll, dernier événement |
| **Visiteur en direct** | Session dont la dernière activité date de moins de **2 minutes** |
| **Conversion** | Session ayant envoyé le formulaire « Réserver un appel » (lead créé) |

### Données par session

- **Réseau** : IP complète (IPv4 ou IPv6, telle que reçue), version d'IP, opérateur / FAI (ASN + organisation, via GeoLite2-ASN)
- **Géolocalisation** (calculée côté serveur depuis l'IP, une fois au début de la session) : pays + code pays, région/province, ville, code postal si dispo, latitude/longitude approximatives, fuseau horaire, rayon de précision (km)
- **Appareil** : user-agent brut, navigateur + version, OS + version, type (ordinateur, mobile, tablette), marque/modèle si connus, taille d'écran, taille de fenêtre, langue du navigateur, fuseau horaire du navigateur
- **Provenance** : referrer complet, domaine du referrer, catégorie de source (Direct, Recherche, Réseaux sociaux, WhatsApp, Autre site, Campagne), paramètres `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- **Parcours** : page d'entrée, page de sortie, dernière section, nombre de pages vues, nombre d'événements, nombre de clics, profondeur max de scroll, temps actif, début, dernière activité, fin, rebond oui/non, robot oui/non, converti oui/non

### Événements suivis

| Type | Quand | Données |
|---|---|---|
| `PAGEVIEW` | Chargement d'une route | path, titre |
| `CLICK` | Clic sur `a`, `button`, `[role=button]`, `[data-track]` | `name` (= `data-track` sinon id sinon généré), `label` (texte visible ≤ 80 caractères ou `aria-label`), section, href, position (`xPct` = x / largeur fenêtre, `yPx` = position verticale dans la page) |
| `CTA_CLICK` | Clic sur un élément `data-track-cta` (tous les boutons « Réserver un appel ») | idem |
| `CONTACT_CLICK` | Liens `tel:`, `mailto:`, `wa.me` | idem + canal (tel, email, whatsapp) |
| `OUTBOUND_CLICK` | Lien vers un autre domaine | idem |
| `SECTION_VIEW` | Sortie d'une section vue | section, temps passé (ms) |
| `SCROLL_DEPTH` | Premier passage d'un palier | palier (25…100) |
| `FORM_START` | Premier focus dans le formulaire | — |
| `FORM_ERROR` | Erreur de validation | **nom du champ uniquement**, jamais sa valeur |
| `FORM_SUBMIT` | Lead créé | id du lead |
| `FILTER_CHANGE` | Onglet Réalisations | catégorie |
| `THEME_TOGGLE` / `MENU_TOGGLE` | Bascule | nouvel état |
| `HEARTBEAT` | Toutes les 15 s si actif | **non stocké comme événement** : met à jour temps actif, scroll max, dernière activité de la session et de la page vue |

**Jamais collecté par le traceur** : contenu des champs de formulaire, mots de passe, frappes clavier, contenu copié. Les coordonnées du prospect sont stockées **uniquement** dans la table `Lead`, via le formulaire.

**Exclusions** : les visites de l'admin (cookie `rw_ignore=1` posé sur le domaine du site à la connexion au dashboard, et route `/admin` jamais tracée) ; les IP de la liste « IP exclues » (paramètres) ; les robots (`isbot` + absence de JavaScript) sont enregistrés mais marqués `isBot = true` et masqués par défaut dans le dashboard.

**Rétention** : événements détaillés purgés après **395 jours** (13 mois, réglable), sessions conservées sous forme agrégée (`DailyStat`) sans limite. Leads conservés jusqu'à suppression manuelle.

### Limite à connaître (à afficher dans le dashboard sous forme d'info-bulle)

La ville déduite d'une IP est **approximative**. En RDC, les IP des opérateurs mobiles (Vodacom, Orange, Airtel, Africell) sont souvent localisées à Kinshasa ou Lubumbashi même si le visiteur est à Kolwezi, et parfois seulement au niveau du pays. Le dashboard affiche le rayon de précision fourni par MaxMind et « Ville inconnue » quand il n'y en a pas.

## A7. Protocole du traceur (front → API)

Le traceur (`apps/web/src/lib/tracker/`) est un module client léger (< 6 ko gzip, sans dépendance), monté une seule fois dans le layout du site (`(site)/layout.tsx`), **jamais sous `/admin`**.

- Envoie en **lots** : file d'attente en mémoire vidée toutes les **5 s**, dès 20 événements, et à `visibilitychange → hidden` / `pagehide`.
- Envoi via `navigator.sendBeacon(url, new Blob([json], { type: 'text/plain' }))` (le type `text/plain` évite le pré-vol CORS) ; repli `fetch(url, { method: 'POST', body: json, keepalive: true, headers: { 'Content-Type': 'text/plain' } })`.
- URL : `${NEXT_PUBLIC_API_URL}/v1/collect`.
- Le cookie `rw_vid` est posé par le front (JS) ; l'API ne pose aucun cookie de suivi.
- Si `rw_ignore=1`, ou `navigator.webdriver === true`, le traceur ne fait rien.

Format d'un lot (type `CollectPayload` dans `packages/shared`) :

```json
{
  "v": 1,
  "visitorId": "3f0c…-uuid-v4",
  "sessionId": "9a1b…-uuid-v4",
  "context": {
    "isNewSession": true,
    "landingPath": "/",
    "referrer": "https://www.google.com/",
    "utm": { "source": null, "medium": null, "campaign": null, "term": null, "content": null },
    "screen": { "w": 1920, "h": 1080 },
    "viewport": { "w": 1440, "h": 900 },
    "language": "fr-FR",
    "timezone": "Africa/Lubumbashi"
  },
  "events": [
    { "type": "PAGEVIEW", "pageViewId": "uuid", "path": "/", "title": "Relwick — …", "ts": 1760000000000 },
    { "type": "CLICK", "pageViewId": "uuid", "name": "hero_cta_appel", "label": "Réserver un appel", "section": "hero", "href": "#contact", "xPct": 0.21, "yPx": 640, "ts": 1760000004000 },
    { "type": "SECTION_VIEW", "pageViewId": "uuid", "section": "services", "value": 8400, "ts": 1760000012000 },
    { "type": "SCROLL_DEPTH", "pageViewId": "uuid", "value": 50, "ts": 1760000013000 },
    { "type": "HEARTBEAT", "pageViewId": "uuid", "activeSeconds": 15, "maxScrollPct": 62, "ts": 1760000015000 }
  ]
}
```

`context` n'est obligatoire que dans le premier lot d'une session ; l'API le garde en mémoire dans la session. Si un lot arrive pour une session inconnue sans `context` (ex. base vidée), l'API crée la session avec les infos disponibles.

**Côté API, `POST /v1/collect`** :
1. Accepte `text/plain` et `application/json` (activer `bodyParser.text({ limit: '64kb' })` sur cette route), parse le JSON, valide (UUID v4, max 50 événements, dates ±24 h de l'heure serveur, chaînes tronquées à leur taille de colonne).
2. Extrait l'IP réelle : `X-Forwarded-For` (premier élément) uniquement si `TRUST_PROXY=true`, sinon `req.socket.remoteAddress`. Normalise `::ffff:1.2.3.4` → `1.2.3.4`.
3. Si l'IP est dans la liste d'exclusion → répond `204` sans rien enregistrer.
4. Nouvelle session : géolocalise (MaxMind, résultat mis en cache LRU 10 000 IP / 24 h), parse le user-agent, détecte le robot, classe la source, crée `Visitor` (upsert) + `Session`.
5. Enregistre `PageView` et `Event` en une transaction ; les `HEARTBEAT` mettent à jour `activeSeconds` (plafond 20 s par battement), `maxScrollPct`, `lastActivityAt` sur la page vue et la session.
6. Met à jour les compteurs de la session (`pageviewCount`, `eventCount`, `clickCount`, `exitPath`, `lastSection`).
7. Répond **204** (même si des événements individuels sont rejetés : on journalise, on ne casse pas le site).
8. Limite : 120 requêtes / minute / IP (throttler).

**En local** l'IP vaut `::1` ou `127.0.0.1` (et `192.168.x.x` depuis un téléphone du même Wi-Fi) → la géolocalisation renvoie « Réseau local ». Variable `DEV_FAKE_IP` (ex. une IP publique congolaise) pour tester la géolocalisation en développement ; ignorée si `NODE_ENV=production`.

## A8. Schéma de base de données (Prisma)

À utiliser tel quel comme point de départ dans `apps/api/prisma/schema.prisma`. Toutes les dates en UTC, précision milliseconde.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum DeviceType {
  DESKTOP
  MOBILE
  TABLET
  UNKNOWN
}

enum SourceCategory {
  DIRECT
  SEARCH
  SOCIAL
  WHATSAPP
  REFERRAL
  CAMPAIGN
}

enum EventType {
  PAGEVIEW
  CLICK
  CTA_CLICK
  CONTACT_CLICK
  OUTBOUND_CLICK
  SECTION_VIEW
  SCROLL_DEPTH
  FORM_START
  FORM_ERROR
  FORM_SUBMIT
  FILTER_CHANGE
  THEME_TOGGLE
  MENU_TOGGLE
}

enum LeadStatus {
  NEW
  CONTACTED
  CALL_SCHEDULED
  CONVERTED
  LOST
}

model Visitor {
  id           String    @id @db.Char(36)
  firstSeenAt  DateTime  @default(now()) @db.DateTime(3)
  lastSeenAt   DateTime  @db.DateTime(3)
  sessionCount Int       @default(0)
  firstIp      String    @db.VarChar(45)
  lastIp       String    @db.VarChar(45)
  lastCity     String?   @db.VarChar(120)
  lastCountry  String?   @db.Char(2)
  isBot        Boolean   @default(false)
  sessions     Session[]
  leads        Lead[]

  @@index([lastSeenAt])
  @@index([firstSeenAt])
}

model Session {
  id               String         @id @db.Char(36)
  visitorId        String         @db.Char(36)
  visitor          Visitor        @relation(fields: [visitorId], references: [id], onDelete: Cascade)

  // Réseau
  ip               String         @db.VarChar(45)
  ipVersion        Int            @db.TinyInt
  asn              Int?
  isp              String?        @db.VarChar(160)

  // Géolocalisation
  countryCode      String?        @db.Char(2)
  country          String?        @db.VarChar(80)
  region           String?        @db.VarChar(120)
  city             String?        @db.VarChar(120)
  postalCode       String?        @db.VarChar(20)
  latitude         Decimal?       @db.Decimal(9, 6)
  longitude        Decimal?       @db.Decimal(9, 6)
  accuracyKm       Int?
  geoTimezone      String?        @db.VarChar(64)

  // Appareil
  userAgent        String         @db.Text
  browser          String?        @db.VarChar(60)
  browserVersion   String?        @db.VarChar(30)
  os               String?        @db.VarChar(60)
  osVersion        String?        @db.VarChar(30)
  deviceType       DeviceType     @default(UNKNOWN)
  deviceVendor     String?        @db.VarChar(60)
  deviceModel      String?        @db.VarChar(60)
  screenW          Int?           @db.SmallInt
  screenH          Int?           @db.SmallInt
  viewportW        Int?           @db.SmallInt
  viewportH        Int?           @db.SmallInt
  language         String?        @db.VarChar(20)
  browserTimezone  String?        @db.VarChar(64)

  // Provenance
  referrer         String?        @db.Text
  referrerDomain   String?        @db.VarChar(255)
  sourceCategory   SourceCategory @default(DIRECT)
  utmSource        String?        @db.VarChar(120)
  utmMedium        String?        @db.VarChar(120)
  utmCampaign      String?        @db.VarChar(120)
  utmTerm          String?        @db.VarChar(120)
  utmContent       String?        @db.VarChar(120)

  // Parcours
  landingPath      String         @db.VarChar(512)
  exitPath         String?        @db.VarChar(512)
  lastSection      String?        @db.VarChar(60)
  pageviewCount    Int            @default(0)
  eventCount       Int            @default(0)
  clickCount       Int            @default(0)
  maxScrollPct     Int            @default(0) @db.TinyInt
  activeSeconds    Int            @default(0)
  startedAt        DateTime       @default(now()) @db.DateTime(3)
  lastActivityAt   DateTime       @db.DateTime(3)
  endedAt          DateTime?      @db.DateTime(3)
  isBounce         Boolean?
  isBot            Boolean        @default(false)
  isExcluded       Boolean        @default(false)
  converted        Boolean        @default(false)

  pageViews        PageView[]
  events           Event[]
  leads            Lead[]

  @@index([startedAt])
  @@index([lastActivityAt])
  @@index([visitorId, startedAt])
  @@index([countryCode, city])
  @@index([ip])
  @@index([sourceCategory])
  @@index([deviceType])
}

model PageView {
  id             String    @id @db.Char(36)
  sessionId      String    @db.Char(36)
  session        Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  path           String    @db.VarChar(512)
  title          String?   @db.VarChar(255)
  enteredAt      DateTime  @db.DateTime(3)
  lastActivityAt DateTime  @db.DateTime(3)
  activeSeconds  Int       @default(0)
  maxScrollPct   Int       @default(0) @db.TinyInt
  events         Event[]

  @@index([sessionId, enteredAt])
  @@index([path, enteredAt])
}

model Event {
  id          BigInt    @id @default(autoincrement())
  sessionId   String    @db.Char(36)
  session     Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  pageViewId  String?   @db.Char(36)
  pageView    PageView? @relation(fields: [pageViewId], references: [id], onDelete: SetNull)
  type        EventType
  name        String?   @db.VarChar(120)
  label       String?   @db.VarChar(160)
  section     String?   @db.VarChar(60)
  href        String?   @db.VarChar(1024)
  value       Int?
  xPct        Float?
  yPx         Int?
  meta        Json?
  occurredAt  DateTime  @db.DateTime(3)
  receivedAt  DateTime  @default(now()) @db.DateTime(3)

  @@index([type, occurredAt])
  @@index([sessionId, occurredAt])
  @@index([name, occurredAt])
  @@index([section, occurredAt])
}

model DailyStat {
  date             DateTime @id @db.Date   // jour calendaire Africa/Lubumbashi
  visits           Int
  uniqueVisitors   Int
  newVisitors      Int
  pageviews        Int
  totalActiveSec   Int
  bounces          Int
  leads            Int
  botVisits        Int
  updatedAt        DateTime @updatedAt @db.DateTime(3)
}

model Lead {
  id          String     @id @default(uuid()) @db.Char(36)
  visitorId   String?    @db.Char(36)
  visitor     Visitor?   @relation(fields: [visitorId], references: [id], onDelete: SetNull)
  sessionId   String?    @db.Char(36)
  session     Session?   @relation(fields: [sessionId], references: [id], onDelete: SetNull)
  fullName    String     @db.VarChar(120)
  phone       String     @db.VarChar(40)
  email       String?    @db.VarChar(190)
  projectType String     @db.VarChar(60)
  callSlot    String     @db.VarChar(20)
  message     String?    @db.Text
  consent     Boolean
  status      LeadStatus @default(NEW)
  notes       String?    @db.Text
  ip          String?    @db.VarChar(45)
  city        String?    @db.VarChar(120)
  createdAt   DateTime   @default(now()) @db.DateTime(3)
  updatedAt   DateTime   @updatedAt @db.DateTime(3)
  contactedAt DateTime?  @db.DateTime(3)

  @@index([status, createdAt])
  @@index([createdAt])
}

model AdminUser {
  id           String         @id @default(uuid()) @db.Char(36)
  email        String         @unique @db.VarChar(190)
  name         String         @db.VarChar(120)
  passwordHash String         @db.VarChar(255)
  lastLoginAt  DateTime?      @db.DateTime(3)
  createdAt    DateTime       @default(now()) @db.DateTime(3)
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id         String    @id @default(uuid()) @db.Char(36)
  userId     String    @db.Char(36)
  user       AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String    @db.VarChar(255)
  expiresAt  DateTime  @db.DateTime(3)
  revokedAt  DateTime? @db.DateTime(3)
  createdAt  DateTime  @default(now()) @db.DateTime(3)
  userAgent  String?   @db.VarChar(255)
  ip         String?   @db.VarChar(45)

  @@index([userId])
}

model AdminLoginAttempt {
  id        BigInt   @id @default(autoincrement())
  email     String   @db.VarChar(190)
  ip        String   @db.VarChar(45)
  success   Boolean
  createdAt DateTime @default(now()) @db.DateTime(3)

  @@index([ip, createdAt])
}

model Setting {
  key       String   @id @db.VarChar(60)
  value     Json
  updatedAt DateTime @updatedAt @db.DateTime(3)
}
```

Réglages (`Setting`) attendus : `excludedIps` (tableau d'IP ou de CIDR), `retentionDays` (395), `showBotsByDefault` (false), `sessionTimeoutMin` (30).

Note MariaDB (XAMPP) : le type `Json` est stocké en `LONGTEXT` avec contrôle de validité, c'est normal. Pour grouper par jour en heure de Lubumbashi en SQL brut, utiliser `CONVERT_TZ(col, '+00:00', '+02:00')` (offsets numériques : pas besoin des tables de fuseaux MySQL). Toujours utiliser `Prisma.sql` / `$queryRaw` avec paramètres, jamais de concaténation de chaînes.

## A9. API NestJS — routes

Préfixe global : aucun (le versionnage est dans les routes). Toutes les réponses JSON en camelCase. Les dates sont envoyées en ISO UTC ; le front les affiche en Africa/Lubumbashi.

**Public**

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | `{ status, db, geo }` (geo vaut `ok` ou `missing`) |
| POST | `/v1/collect` | Réception des lots du traceur (A7) → `204` |
| POST | `/v1/leads` | Formulaire « Réserver un appel » (validation identique au front, champ piège `website` doit être vide, 5 requêtes / 10 min / IP). Lie le lead à `visitorId` + `sessionId` envoyés par le front, marque la session `converted = true`, crée un événement `FORM_SUBMIT`. → `201 { id }` |

**Auth admin** (`/v1/auth/*`)

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/v1/auth/login` | e-mail + mot de passe → cookies `rw_at` (15 min) + `rw_rt` (7 j, path `/v1/auth`). 5 essais / 15 min / IP, puis blocage 15 min. Journalise dans `AdminLoginAttempt` |
| POST | `/v1/auth/refresh` | Rotation du refresh token (l'ancien est révoqué ; réutilisation d'un token révoqué = révocation de tous les tokens de l'utilisateur) |
| POST | `/v1/auth/logout` | Révoque + efface les cookies |
| GET | `/v1/auth/me` | Profil admin |
| PATCH | `/v1/auth/password` | Changement de mot de passe (ancien + nouveau, 12 caractères min.) |

**Dashboard** (`/v1/admin/*`, garde JWT obligatoire)

Paramètres communs de période et de filtre (DTO `StatsQuery`) : `from`, `to` (ISO), `compare` (bool : période précédente de même durée), `countryCode`, `city`, `deviceType`, `sourceCategory`, `browser`, `os`, `path`, `includeBots` (bool, défaut false).

| Méthode | Route | Retour |
|---|---|---|
| GET | `/v1/admin/stats/overview` | KPI : visites totales, visiteurs uniques, nouveaux visiteurs, pages vues, pages/visite, durée moyenne, taux de rebond, leads, taux de conversion, + valeurs de la période précédente et variation en % |
| GET | `/v1/admin/stats/timeseries?interval=hour\|day\|week\|month` | Courbes visites / visiteurs / pages vues / leads |
| GET | `/v1/admin/stats/live` | Nombre de visiteurs en direct + liste (ville, pays, page, section actuelle, appareil, depuis combien de temps, source) |
| GET | `/v1/admin/stats/geo?level=country\|city` | Visites, visiteurs, durée moyenne, conversions par pays ou ville, + coordonnées moyennes pour la carte |
| GET | `/v1/admin/stats/devices` | Répartition par type d'appareil, navigateur, OS, taille d'écran (tranches) |
| GET | `/v1/admin/stats/sources` | Catégories de source, domaines referrers, campagnes UTM, opérateurs (ISP) |
| GET | `/v1/admin/stats/clicks` | Classement des éléments cliqués (`name`, `label`, section, nb de clics, nb de visiteurs distincts, % des visites) |
| GET | `/v1/admin/stats/sections` | Par section : % des visites qui l'atteignent, temps moyen passé, nombre de sorties dessus |
| GET | `/v1/admin/stats/scroll` | Distribution de la profondeur max de scroll (0–25, 25–50, 50–75, 75–90, 90–100) |
| GET | `/v1/admin/stats/exits` | Pages et sections de sortie (où les gens s'arrêtent) |
| GET | `/v1/admin/stats/funnel` | Entonnoir : visite → Services vus → Réalisations vues → Contact vu → formulaire commencé → formulaire envoyé |
| GET | `/v1/admin/stats/hours` | Carte de chaleur jour de la semaine × heure (heure de Lubumbashi) |
| GET | `/v1/admin/sessions` | Liste paginée côté serveur (page, pageSize ≤ 100, tri), filtres communs + `q` (recherche IP, ville, ISP, referrer), `minDuration`, `converted`, `isBounce` |
| GET | `/v1/admin/sessions/:id` | Détail complet + chronologie (pages vues et événements triés) |
| GET | `/v1/admin/sessions/export.csv` | Export CSV (UTF-8 avec BOM pour Excel, séparateur `;`) avec les mêmes filtres |
| GET | `/v1/admin/visitors/:id` | Profil visiteur : toutes ses sessions, première/dernière visite, IP utilisées, villes |
| GET | `/v1/admin/leads` | Liste paginée + filtre par statut + recherche |
| GET | `/v1/admin/leads/:id` | Détail + parcours de la session liée |
| PATCH | `/v1/admin/leads/:id` | Statut, notes, `contactedAt` |
| DELETE | `/v1/admin/leads/:id` | Suppression (confirmation côté UI) |
| GET | `/v1/admin/leads/export.csv` | Export CSV |
| GET / PUT | `/v1/admin/settings` | Réglages (A8) |
| POST | `/v1/admin/settings/exclude-my-ip` | Ajoute l'IP courante de l'admin à la liste d'exclusion |
| POST | `/v1/admin/maintenance/purge` | Purge immédiate selon la rétention (retourne le nombre de lignes supprimées) |

**Tâches planifiées** (`jobs/`, fuseau Africa/Lubumbashi) :
- toutes les 5 min : clôture des sessions inactives depuis > 30 min (`endedAt = lastActivityAt`, calcul de `isBounce`) ;
- tous les jours à 00 h 10 : calcul de `DailyStat` pour la veille (et recalcul des 2 jours précédents) ;
- tous les jours à 03 h 00 : purge des `Event` et `PageView` plus vieux que `retentionDays`.

Les statistiques de plus de 2 jours se lisent dans `DailyStat` quand aucun filtre n'est appliqué ; sinon, requêtes directes sur `Session` (les index A8 sont prévus pour).

## A10. Dashboard administrateur (`/admin`)

Accès : Elios seul. Compte créé par le seed à partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` du `.env` de l'API. Le `middleware.ts` de Next redirige vers `/admin/login` si le cookie `rw_at` est absent ; la validité réelle est vérifiée par l'API (`/v1/auth/me`), avec rafraîchissement silencieux automatique sur une réponse 401 (un seul refresh en vol à la fois). `noindex` sur toutes les pages admin.

**Mise en page** : barre latérale fixe 248 px (logo, navigation avec icônes Lucide, bas : nom de l'admin + déconnexion), barre supérieure avec titre de la page, **sélecteur de période** (Aujourd'hui, Hier, 7 derniers jours, 30 derniers jours, Ce mois-ci, 12 derniers mois, Personnalisé), case « Comparer à la période précédente », bouton thème clair/sombre. La période et les filtres sont dans l'URL (`?from=…&to=…&city=…`) pour pouvoir partager un lien et revenir en arrière. Sous 1024 px, la barre latérale devient un tiroir. Toutes les données passent par TanStack Query ; squelettes de chargement ; états vides en français (« Aucune visite sur cette période. »).

**Pages**

1. **Vue d'ensemble** (`/admin`)
   - Bandeau « En direct » : nombre de visiteurs actifs (point malachite animé), actualisé toutes les 10 s.
   - 8 tuiles KPI : Visites totales · Visiteurs uniques · Nouveaux visiteurs · Pages vues · Durée moyenne · Taux de rebond · Demandes d'appel · Taux de conversion — chacune avec la variation vs période précédente (flèche + couleur succès/danger ; pour le rebond, une baisse est positive).
   - Graphique principal : visites et visiteurs uniques dans le temps (courbe indigo, période précédente en pointillés encre clair).
   - Top 5 villes, Top 5 sources, Répartition appareils (barres horizontales, pas de camembert), Top 5 boutons cliqués, Entonnoir de conversion, 5 dernières demandes d'appel.
2. **En direct** (`/admin/live`) — liste des visiteurs actifs (ville, pays avec drapeau via code pays en texte, page et section actuelles, appareil, source, durée depuis l'arrivée), actualisée toutes les 5 s ; clic → détail de la session.
3. **Visites** (`/admin/sessions`) — tableau filtrable et triable : date/heure, IP complète (police mono, copier en un clic), ville, pays, opérateur, appareil + navigateur + OS, source, page d'entrée, point d'arrêt (dernière section), pages vues, clics, durée, scroll max, badges (Rebond, Converti, Robot). Panneau de filtres (période, pays, ville, appareil, source, durée minimale, converti, rebond, robots), recherche libre, pagination serveur, bouton « Exporter en CSV ».
4. **Détail d'une visite** (`/admin/sessions/[id]`) — en-tête (IP, ville, pays, opérateur, précision, appareil, écran, langue, source/UTM, début, durée, statut) ; mini-carte Leaflet avec le point approximatif et le cercle de précision ; **chronologie** verticale lisible : « 14 h 02 min 05 — Arrivée sur / depuis Google », « Section Hero vue 12 s », « Clic sur “Voir les services” (hero) », « Scroll 75 % », « Formulaire commencé », « Erreur : téléphone », « Quitte le site sur la section Contact ». Lien vers le profil du visiteur et vers le lead s'il existe.
5. **Visiteurs** (`/admin/visitors/[id]`) — historique de toutes les sessions d'un visiteur, IP et villes utilisées, première et dernière visite.
6. **Géographie** (`/admin/geo`) — carte Leaflet (cercles proportionnels aux visites, couleur indigo, aucun dégradé), tableau pays puis villes (visites, visiteurs, durée moyenne, conversions), note sur la précision des IP en RDC.
7. **Comportement** (`/admin/behavior`) — onglets : Clics (classement des boutons/liens), Sections (atteinte, temps moyen, sorties), Scroll (distribution), Sorties (où les gens s'arrêtent), Heures (carte de chaleur jour × heure, palette indigo séquentielle), Entonnoir.
8. **Sources** (`/admin/sources`) — catégories, referrers, campagnes UTM, opérateurs.
9. **Appareils** (`/admin/devices`) — types, navigateurs, OS, tailles d'écran.
10. **Demandes d'appel** (`/admin/leads`) — tableau (date, nom, téléphone cliquable `tel:`, e-mail, projet, créneau, ville, statut en badge), filtre par statut, changement de statut en ligne, panneau latéral de détail avec notes, parcours de la visite associée, export CSV, suppression avec Dialog de confirmation. Pastille du nombre de demandes `NEW` dans la barre latérale.
11. **Paramètres** (`/admin/settings`) — profil et mot de passe, IP exclues (ajout/suppression, bouton « Exclure mon IP actuelle »), durée de rétention, afficher les robots par défaut, purge manuelle (Dialog de confirmation), état du service (`/health` : base, fichiers GeoLite2 présents ou non, date des fichiers).

**Graphiques** : Recharts, couleurs prises dans les variables CSS (indigo pour la série principale, encre clair pour la comparaison, cuivre seulement pour un point de mise en avant), grilles discrètes `--rw-line`, info-bulles en surface blanche avec filet, nombres formatés `Intl.NumberFormat('fr-FR')`, durées en « 2 min 35 s », pourcentages « 42,3 % ». Lisibles en clair et en sombre.

## A11. Variables d'environnement

`apps/api/.env` (fournir un `.env.example` commenté) :

```
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://root:@localhost:3306/relwick"
WEB_ORIGIN=http://localhost:3000
TRUST_PROXY=false
JWT_ACCESS_SECRET=change-me-64-caracteres-aleatoires
JWT_REFRESH_SECRET=change-me-autre-64-caracteres
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
ADMIN_EMAIL=elios6546@gmail.com
ADMIN_PASSWORD=change-me-au-premier-lancement
ADMIN_NAME="Elios Ngombe"
GEOIP_CITY_DB=./geo/GeoLite2-City.mmdb
GEOIP_ASN_DB=./geo/GeoLite2-ASN.mmdb
DEV_FAKE_IP=
RETENTION_DAYS=395
APP_TIMEZONE=Africa/Lubumbashi
```

`apps/web/.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP=243975993035
```

Fichiers GeoLite2 : créer un compte gratuit sur maxmind.com, télécharger **GeoLite2-City** et **GeoLite2-ASN** au format `.mmdb`, les placer dans `apps/api/geo/`. Sans ces fichiers, l'API démarre quand même (géolocalisation à `null`, avertissement dans les logs et dans `/health`). Ajouter un script `pnpm geo:check` qui affiche la date des fichiers et le résultat pour une IP de test.

## A12. Règles pour Cursor (`.cursor/rules/relwick.mdc`)

```
---
description: Règles du projet Relwick
alwaysApply: true
---
- Le cahier des charges de référence est RELWICK.md à la racine. En cas de doute, il fait foi.
- Ne jamais modifier le dossier .
- TypeScript strict partout, aucun `any` implicite. Types partagés dans packages/shared.
- Textes d'interface en français, vouvoiement, sans emoji, typographie française.
- Couleurs uniquement via les variables CSS --rw-* et les palettes des tokens. Aucun code hexadécimal en dur dans les composants. Aucun dégradé.
- Une seule action principale (bouton indigo plein) par écran.
- Logo toujours via les SVG de public/brand, jamais retapé dans une police.
- Accessibilité : focus visible, contrastes AA, labels sur tous les champs, navigation clavier, prefers-reduced-motion respecté.
- API : DTO validés avec class-validator, SQL brut uniquement via Prisma.sql paramétré, aucune donnée de formulaire dans les événements du traceur.
- Dates stockées en UTC, affichées en Africa/Lubumbashi.
- Après chaque modification : pnpm lint, pnpm typecheck et les tests concernés doivent passer.
```

## A13. Critères d'acceptation globaux

- [ ] `pnpm dev` à la racine lance l'API (4000) et le front (3000) ensemble.
- [ ] La landing est visuellement fidèle au PDF et au `.dc.html` en clair et en sombre, de 360 px à 1920 px, sans défilement horizontal.
- [ ] Une visite sur la landing crée en base : 1 visiteur, 1 session (IP, géoloc ou « Réseau local », appareil, source), des pages vues et des événements ; le temps actif augmente pendant la lecture et s'arrête quand l'onglet est caché.
- [ ] Ouvrir le site dans 2 navigateurs différents → 2 visiteurs uniques ; revenir après 30 min → nouvelle visite, même visiteur.
- [ ] Chaque bouton « Réserver un appel », les liens de nav, WhatsApp, e-mail, téléphone, filtres et bascule de thème génèrent un événement nommé (voir table des noms en B8).
- [ ] Le formulaire crée un lead visible dans `/admin/leads` et la session correspondante apparaît « Convertie ».
- [ ] Le dashboard affiche les visites totales et toutes les vues décrites en A10, filtrables par période, ville, pays, appareil et source, avec export CSV.
- [ ] Les visites de l'admin connecté et des IP exclues ne sont pas comptées.
- [ ] Sans fichiers GeoLite2, rien ne plante.
- [ ] Les tests passent (`pnpm test`), Lighthouse landing ≥ 90.

---

# PARTIE B — PROMPTS À COLLER DANS CURSOR (dans l'ordre)

> Colle chaque bloc tel quel dans le chat Cursor en mode Agent. Attends la fin, vérifie, commit, puis passe au suivant.

## B1. Initialisation du monorepo

```text
@RELWICK.md
Lis entièrement RELWICK.md (parties A1 à A13). Tu es le développeur principal de ce projet. Nous allons travailler en phases ; pour cette phase 1, ne code que ce qui est demandé ici.

Phase 1 — Initialisation du monorepo. Le dossier courant est C:\xampp\htdocs\Relwick_system : il contient déjà les références de design (Landing page agence web/, Relwick_Identite_v2/, Landing Relwick.pdf, une photo jpg). Ne les déplace pas, ne les modifie pas, ne les supprime pas ; construis le projet autour.
0. Crée à la racine un fichier .htaccess contenant « Require all denied » pour qu'Apache (XAMPP) ne serve jamais les fichiers du projet (.env, code source).
1. Initialise un dépôt Git et un monorepo pnpm avec pnpm-workspace.yaml : apps/web, apps/api, packages/shared (arborescence A3).
2. apps/web : crée une app Next.js (dernière version stable, App Router, TypeScript, ESLint, Tailwind CSS v4, dossier src/, alias @/*). Supprime uniquement le contenu de démonstration de Next.js.
3. apps/api : crée un projet NestJS (dernière version stable, TypeScript strict). Ajoute @nestjs/config (validation des variables d'env avec un schéma), helmet, CORS limité à WEB_ORIGIN avec credentials, ValidationPipe global (whitelist, forbidNonWhitelisted, transform), cookie-parser, @nestjs/throttler, et un endpoint GET /health.
4. packages/shared : package TypeScript exportant les enums et types de A7/A8 (EventType, DeviceType, SourceCategory, LeadStatus, CollectPayload, CollectEvent, constantes SECTION_IDS, TRACK_NAMES vide pour l'instant). Consommé par web et api.
5. Scripts racine : dev (api + web en parallèle), build, lint, typecheck, test, format (Prettier), db:migrate, db:seed, db:studio.
6. Crée les fichiers .env.example de A11 (api et web) et un .gitignore (node_modules, .env*, apps/api/geo/*.mmdb, .next, dist). Configure ESLint, Prettier et TypeScript pour ignorer les dossiers de design existants.
7. Crée .cursor/rules/relwick.mdc avec le contenu exact de A12.
8. Crée un README.md en français : prérequis (Node 22, pnpm, XAMPP avec MySQL démarré ; Apache seulement pour phpMyAdmin), installation, création de la base, téléchargement GeoLite2, commandes.

Vérification attendue : pnpm install, pnpm dev → http://localhost:3000 affiche une page vide et http://localhost:4000/health répond {"status":"ok"}. pnpm lint et pnpm typecheck passent. Donne-moi à la fin la liste des fichiers créés et les commandes à lancer.
```

## B2. Base de données Prisma + seed

```text
@RELWICK.md
Phase 2 — Base de données (A8, A11).
1. Dans apps/api, installe Prisma et configure-le pour MySQL (MariaDB de XAMPP). Si la version de Prisma installée l'exige, utilise prisma.config.ts et l'adapter MySQL/MariaDB officiel selon la documentation de cette version.
2. Écris prisma/schema.prisma en reprenant EXACTEMENT le schéma de A8 (tu peux ajouter des index si utile, mais ne retire aucun champ).
3. Crée un PrismaModule/PrismaService global NestJS (connexion au démarrage, arrêt propre).
4. Donne-moi la commande SQL pour créer la base : CREATE DATABASE relwick CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; puis lance la première migration (nom : init).
5. prisma/seed.ts : crée (ou met à jour) le compte admin depuis ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME (hash argon2) et les réglages par défaut (excludedIps: [], retentionDays: 395, showBotsByDefault: false, sessionTimeoutMin: 30). Idempotent.
6. prisma/seed-demo.ts (script séparé pnpm db:seed:demo) : génère des données de démonstration réalistes sur les 60 derniers jours pour développer le dashboard : environ 600 visiteurs, 900 sessions, pages vues, événements cohérents (clics avec les noms de B8, sections, scroll, heartbeats déjà agrégés dans activeSeconds), villes surtout Kolwezi, Lubumbashi, Kinshasa, Likasi, plus quelques-unes à l'étranger (Johannesburg, Paris, Bruxelles), opérateurs Vodacom, Orange, Airtel, Africell, 70 % mobile, sources variées (Direct, WhatsApp, Google, Facebook), 5 % de robots, environ 25 leads avec statuts variés, plus de visites en soirée. Toutes les données de démo ont des IP dans des plages de documentation (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) et un script pnpm db:clear-demo pour les supprimer.

Vérification : la migration passe sur le MySQL de XAMPP, pnpm db:seed et pnpm db:seed:demo fonctionnent, pnpm db:studio montre les tables remplies.
```

## B3. Authentification admin (API)

```text
@RELWICK.md
Phase 3 — Module auth NestJS (A9 section Auth, A11).
Implémente /v1/auth/login, /refresh, /logout, /me, /password :
- argon2 pour les mots de passe ; JWT access (15 min) et refresh (7 jours) dans des cookies httpOnly rw_at et rw_rt (sameSite lax, secure selon COOKIE_SECURE, domain selon COOKIE_DOMAIN, rw_rt limité au path /v1/auth).
- Refresh tokens stockés hachés dans RefreshToken, rotation à chaque refresh, détection de réutilisation (révoque tout).
- Limitation : 5 tentatives / 15 min / IP sur login, journalisation dans AdminLoginAttempt, message d'erreur générique « E-mail ou mot de passe incorrect. ».
- Garde JwtAuthGuard réutilisable + décorateur @CurrentAdmin().
- Pour toute requête mutante sur /v1/admin/*, exiger l'en-tête X-Requested-With: relwick (protection CSRF simple en plus de SameSite).
- Tests e2e (supertest) : login OK, login KO, accès /v1/auth/me sans cookie = 401, refresh, logout.
```

## B4. Géolocalisation, user-agent et réception des événements

```text
@RELWICK.md
Phase 4 — Collecte (A6, A7, A8).
1. GeoModule : service qui charge GeoLite2-City et GeoLite2-ASN (chemins en env) au démarrage avec @maxmind/geoip2-node, cache LRU (10 000 IP, 24 h). lookup(ip) renvoie { countryCode, country (nom en français si dispo, sinon anglais), region, city, postalCode, latitude, longitude, accuracyKm, timezone, asn, isp } ou des null. IP privées/locales → { city: "Réseau local" }. Si les fichiers manquent : log d'avertissement, retourne null, ne plante jamais. DEV_FAKE_IP remplace l'IP locale hors production. Script pnpm geo:check.
2. Utilitaires : extraction de l'IP réelle (TRUST_PROXY, X-Forwarded-For, normalisation ::ffff:), test d'appartenance à une liste d'IP/CIDR (excludedIps), parse user-agent avec ua-parser-js → browser, os, deviceType, vendor, model ; détection robot avec isbot ; classification de la source (SourceCategory) à partir du referrer et des UTM : moteurs de recherche → SEARCH, facebook/instagram/tiktok/x/linkedin/youtube → SOCIAL, wa.me/whatsapp → WHATSAPP, présence d'utm_* → CAMPAIGN, referrer interne ou vide → DIRECT, sinon REFERRAL.
3. CollectModule : POST /v1/collect exactement comme décrit en A7 (text/plain accepté, validation, limites, transaction, mise à jour des compteurs, HEARTBEAT plafonné à 20 s, 204 toujours, throttler 120/min/IP). Le DTO vient de packages/shared.
4. Lis le réglage excludedIps (mis en cache 60 s) et ignore ces IP.
5. Tests unitaires : classification des sources, parse UA (mobile Android, iPhone, Windows Chrome, Googlebot), extraction IP, CIDR. Test e2e : un lot complet (PAGEVIEW, CLICK, SECTION_VIEW, SCROLL_DEPTH, HEARTBEAT) crée Visitor, Session, PageView, Events et met à jour activeSeconds / maxScrollPct / exitPath / lastSection.
```

## B5. Leads, tâches planifiées et statistiques (API)

```text
@RELWICK.md
Phase 5 — Leads, jobs et statistiques (A6 définitions, A9 routes Dashboard + tâches planifiées).
1. LeadsModule : POST /v1/leads public (validation identique au formulaire de A5, champ piège website, throttle 5/10 min/IP, lien visitorId/sessionId, session.converted = true, événement FORM_SUBMIT, enregistre ip et city). Routes admin GET liste/détail, PATCH, DELETE, export CSV.
2. JobsModule (@nestjs/schedule, fuseau APP_TIMEZONE) : clôture des sessions inactives (toutes les 5 min, calcul de isBounce selon la définition A6), DailyStat (00 h 10, veille + 2 jours précédents), purge selon retentionDays (03 h 00).
3. StatsModule : toutes les routes /v1/admin/stats/* de A9 avec le DTO StatsQuery commun (période, compare, filtres, includeBots). Respecte EXACTEMENT les définitions de A6 (visites, visiteurs uniques, nouveaux, rebond, durée moyenne = moyenne de activeSeconds, conversion = leads / visites). Groupements par jour/heure en heure de Lubumbashi via CONVERT_TZ(col, '+00:00', '+02:00'). SQL brut uniquement via Prisma.sql. Exclure isExcluded = true toujours, et isBot = true sauf includeBots.
4. SessionsModule : liste paginée filtrable, détail avec chronologie fusionnée (pages vues + événements triés par date, chaque élément avec un libellé français prêt à afficher côté front, ex. « Clic sur “Voir les services” (section hero) »), profil visiteur, export CSV (UTF-8 BOM, séparateur ;).
5. SettingsModule : GET/PUT réglages, exclude-my-ip, purge manuelle.
6. Tests : avec un jeu de données contrôlé, vérifie overview (visites, uniques, rebond, conversion), funnel, exits, et le calcul de comparaison avec la période précédente.
Documente toutes les routes avec @nestjs/swagger, accessible sur /docs uniquement hors production.
```

## B6. Design system dans Next.js

```text
@RELWICK.md
Phase 6 — Fondations du front (A2, A4).
1. Copie dans apps/web/src/styles/tokens/ les fichiers EXACTS de Landing page agence web/_ds/relwick-design-system-*/tokens/ (colors.css, typography.css, spacing.css, base.css, components.css). Ne charge pas fonts.css : les polices viennent de next/font/google (Instrument Sans 400/500/600, JetBrains Mono 400) exposées en variables --font-sans et --font-mono.
2. globals.css : importe Tailwind v4 puis les tokens ; déclare dans @theme les correspondances Tailwind vers les variables --rw-* (couleurs sémantiques), les espacements et les rayons, pour pouvoir écrire bg-rw-surface, text-rw-text-muted, rounded-leaf, etc.
3. Copie les assets : logos SVG et favicon de Landing page agence web/assets/ et de Relwick_Identite_v2/ (SVG, ICONES_APP) vers apps/web/public/brand/ ; hero-montagnes.jpg vers public/images/. Configure les icônes (favicon.svg, favicon.ico, apple-touch-icon 180, icônes 192/512) et un manifest.
4. Composants UI dans src/components/ui/, en reprenant les classes .rw-* de components.css et le readme du design system : Button (primary, secondary, ghost, soft, danger ; tailles sm/md/lg ; option flèche qui glisse de 3 px), IconButton, Input (+ multiline), Select, Checkbox, Radio, Switch, SegmentedControl, Card, Badge, Tag, Tabs, Dialog (overlay encre 48 % + flou 6 px, piège du focus, Échap), Toast, Tooltip, Skeleton, Logo (choisit la version claire ou sombre selon le thème). Tous accessibles au clavier.
5. Thème clair/sombre : ThemeProvider + script anti-flash dans <head>, stockage localStorage dans un try/catch.
6. Une page /dev/ui (désactivée en production) qui montre tous les composants dans les deux thèmes, pour que je valide visuellement.
```

## B7. Landing page

```text
@RELWICK.md
Phase 7 — Landing page (A5). Ouvre et étudie en détail Landing page agence web/Landing Relwick.dc.html (structure, styles inline, textes, animations, comportements JavaScript en bas du fichier) et Landing Relwick.pdf. Reproduis-la fidèlement en composants React dans src/components/site/, avec la variante de hero « panneau » (style verre).
Exigences :
- Tous les textes du design, avec la correction « pour les particuliers et les entreprises » dans le hero.
- Chaque section : id (accueil, services, realisations, apropos, contact) + data-section (hero, services, realisations, apropos, contact, footer). Le header a data-section="header".
- Grille Services : 4 colonnes ≥ 1100 px, 2 × 2 de 640 à 1100 px, 1 colonne en dessous.
- Réalisations : données dans un fichier src/content/realisations.ts (titre, description, catégorie web|mobile|pc, tags, image optionnelle, teinte d'aplat). Filtre par Tabs.
- À propos : visuel feuille avec image optionnelle /images/elios.webp.
- Formulaire « Réserver un appel » complet comme décrit en A5 (validation zod, messages d'erreur du design, Dialog de confirmation, appel POST /v1/leads avec visitorId et sessionId du traceur, Toast de succès, gestion d'erreur réseau). En attendant la phase 8, prévois une fonction getTrackingIds() qui renvoie null.
- Animations du design : header translucide après scroll, titre du hero mot par mot, révélations au scroll décalées, survols ; tout désactivé avec prefers-reduced-motion.
- Bouton WhatsApp flottant, footer complet avec liens Confidentialité et Mentions légales.
- SEO de A5 (metadata, Open Graph, JSON-LD, sitemap, robots avec Disallow: /admin), next/image partout.
- Pages /confidentialite et /mentions-legales (voir phase 10 pour le texte complet ; mets un contenu provisoire).
Compare ton rendu au PDF à 1440 px et à 390 px et liste-moi les écarts restants.
```

## B8. Traceur d'audience côté front

```text
@RELWICK.md
Phase 8 — Traceur (A6, A7). Crée src/lib/tracker/ :
- ids.ts : visitorId (cookie rw_vid, UUID v4, 13 mois, SameSite=Lax, Secure en https), sessionId (sessionStorage rw_sid + horodatage de dernière activité ; nouveau si > 30 min d'inactivité ou changement de jour à l'heure de Lubumbashi), pageViewId par route. Tout accès au stockage dans un try/catch.
- queue.ts : file d'événements, envoi par lot toutes les 5 s, à 20 événements, et à visibilitychange hidden / pagehide, via sendBeacon (Blob text/plain) avec repli fetch keepalive. context ajouté au premier lot de chaque session.
- activity.ts : temps actif (onglet visible + interaction dans les 30 dernières secondes), HEARTBEAT toutes les 15 s, profondeur de scroll max et paliers 25/50/75/90/100.
- clicks.ts : écoute globale en phase de capture, élément le plus proche parmi a, button, [role=button], [data-track] ; name = data-track sinon id sinon "<balise>_<texte-slugifié>" ; label = data-track-label sinon aria-label sinon texte visible (80 caractères max) ; section = data-section le plus proche ; types CTA_CLICK (data-track-cta), CONTACT_CLICK (tel:, mailto:, wa.me), OUTBOUND_CLICK (autre domaine), sinon CLICK ; xPct et yPx. Ne lit JAMAIS la valeur d'un champ.
- sections.ts : IntersectionObserver sur [data-section], SECTION_VIEW avec durée quand la section devient visible ≥ 50 % pendant ≥ 1 s puis sort (ou à la sortie de page).
- forms.ts : FORM_START au premier focus, FORM_ERROR avec le nom du champ uniquement.
- index.ts : initTracker() idempotent, désactivé si rw_ignore=1, navigator.webdriver, ou chemin /admin ; API track(type, data) pour les événements manuels ; getTrackingIds() pour le formulaire. Suivi des navigations côté client (usePathname) → PAGEVIEW.
- TrackerProvider monté dans app/(site)/layout.tsx uniquement.
Ajoute les attributs data-track sur la landing avec EXACTEMENT ces noms (et data-track-cta sur tous les « Réserver un appel ») :
header_logo, header_nav_services, header_nav_realisations, header_nav_apropos, header_nav_contact, header_cta_appel, header_theme_toggle, header_menu_toggle, hero_cta_appel, hero_cta_services, services_card_web, services_card_android, services_card_ios, services_card_pc, realisations_filter_all, realisations_filter_web, realisations_filter_mobile, realisations_filter_pc, realisation_card_1 à realisation_card_6, apropos_cta_appel, apropos_cta_email, contact_email, contact_tel, contact_whatsapp, form_submit, dialog_modifier, dialog_confirmer, footer_link_<cible>, whatsapp_float, privacy_notice_ok.
Ajoute aussi les événements FILTER_CHANGE, THEME_TOGGLE, MENU_TOGGLE. Remplis TRACK_NAMES dans packages/shared avec cette liste et un libellé français pour chacun (utilisé par le dashboard).
Bandeau d'information non bloquant (A6) : « Ce site mesure son audience pour s'améliorer. » + lien « En savoir plus » vers /confidentialite + bouton « Compris », affiché une seule fois (localStorage).
Vérification : navigue sur la landing, clique, scrolle, laisse l'onglet en arrière-plan, puis montre-moi dans Prisma Studio la session créée et ses événements. Écris un test Playwright qui vérifie qu'un clic sur « Réserver un appel » du hero envoie un événement CTA_CLICK hero_cta_appel.
```

## B9. Dashboard : authentification et squelette

```text
@RELWICK.md
Phase 9 — Dashboard, partie 1 (A10).
1. /admin/login : page de connexion sobre (logo, e-mail, mot de passe, bouton « Se connecter », erreurs claires), noindex. À la connexion réussie, pose aussi le cookie rw_ignore=1 (1 an) sur le domaine du site pour exclure l'admin des statistiques.
2. middleware.ts : protège /admin/* (sauf /admin/login) en vérifiant la présence de rw_at ou rw_rt.
3. lib/api.ts : client fetch avec credentials: 'include', en-tête X-Requested-With: relwick, rafraîchissement automatique sur 401 (un seul refresh à la fois), redirection vers /admin/login si le refresh échoue. Hooks TanStack Query typés avec packages/shared.
4. Layout admin : barre latérale 248 px (logo, liens avec icônes Lucide : Vue d'ensemble, En direct, Visites, Géographie, Comportement, Sources, Appareils, Demandes d'appel avec pastille du nombre NEW, Paramètres ; en bas nom de l'admin et « Se déconnecter »), barre supérieure (titre, PeriodPicker avec les préréglages de A10 + calendrier personnalisé, case « Comparer », bascule de thème). Période et filtres synchronisés dans l'URL. Tiroir sous 1024 px.
5. Composants admin réutilisables : KpiTile (valeur, libellé, variation colorée, info-bulle de définition), ChartCard, DataTable (TanStack Table, tri, pagination serveur, colonnes masquables), FilterBar, EmptyState, ErrorState, formatters fr-FR (nombres, %, durées « 2 min 35 s », dates en Africa/Lubumbashi).
Respecte la charte A4 : une seule action principale indigo par écran, cartes à filet sans ombre, aucun dégradé, cuivre ≤ 5 %.
```

## B10. Dashboard : pages de statistiques

```text
@RELWICK.md
Phase 10 — Dashboard, partie 2 : implémente les pages 1 à 9 de A10 (Vue d'ensemble, En direct, Visites, Détail d'une visite, Visiteur, Géographie, Comportement, Sources, Appareils), branchées sur les routes /v1/admin/* de A9.
Points d'attention :
- Vue d'ensemble : bandeau « En direct » actualisé toutes les 10 s, 8 KPI avec comparaison, graphique visites + visiteurs (période précédente en pointillés), top villes, sources, appareils, boutons cliqués (libellés français de TRACK_NAMES), entonnoir, 5 derniers leads.
- Visites : toutes les colonnes de A10, IP en police mono avec bouton copier, filtres, recherche, export CSV.
- Détail d'une visite : en-tête complet, mini-carte Leaflet avec cercle de précision (import dynamique sans SSR), chronologie verticale avec les libellés renvoyés par l'API et des icônes par type d'événement, mise en évidence du point d'arrêt.
- Géographie : carte react-leaflet (tuiles OpenStreetMap, attribution visible), cercles proportionnels, tableau pays → villes, info-bulle expliquant la précision des IP en RDC (A6).
- Comportement : onglets Clics, Sections, Scroll, Sorties, Heures (heatmap jour × heure), Entonnoir.
- Graphiques Recharts avec les couleurs des variables CSS, lisibles en clair et en sombre, barres horizontales plutôt que camemberts.
Teste toutes les pages avec les données de pnpm db:seed:demo et liste-moi ce qui ne s'affiche pas correctement.
```

## B11. Demandes d'appel, paramètres et pages légales

```text
@RELWICK.md
Phase 11.
1. Page Demandes d'appel (A10 §10) : tableau, filtre par statut, changement de statut en ligne (badges : NEW indigo, CONTACTED ambre, CALL_SCHEDULED indigo clair, CONVERTED malachite, LOST encre), panneau latéral de détail avec notes enregistrées automatiquement, lien tel:, lien vers la visite associée et son parcours, export CSV, suppression avec Dialog de confirmation.
2. Page Paramètres (A10 §11) : profil + changement de mot de passe, IP exclues (liste, ajout avec validation IP/CIDR, « Exclure mon IP actuelle »), rétention, robots par défaut, purge manuelle avec confirmation, état du service (/health).
3. Pages légales définitives, en français clair, vouvoiement :
   - /confidentialite : responsable du traitement (Relwick, Elios Ngombe, Kolwezi, RDC, elios6546@gmail.com) ; données collectées par la mesure d'audience (liste exacte de A6 : IP complète, localisation approximative déduite de l'IP, opérateur, appareil, navigateur, pages et sections vues, clics, temps passé, profondeur de scroll, provenance) ; finalité (comprendre l'utilisation du site et l'améliorer, suivre les demandes) ; cookie rw_vid (identifiant aléatoire, 13 mois) ; données du formulaire et usage (rappeler la personne) ; durées de conservation (13 mois pour le détail des visites, leads jusqu'à traitement) ; aucune revente ni partage ; hébergement ; droits d'accès, de rectification et de suppression par e-mail ; date de mise à jour.
   - /mentions-legales : éditeur, contact, hébergeur (à compléter), propriété intellectuelle.
   Ajoute en tête de chaque page un commentaire de code : « Texte à faire relire par un juriste avant mise en ligne publique. »
```

## B12. Qualité, sécurité et finitions

```text
@RELWICK.md
Phase 12 — Revue finale. Passe en revue tout le projet et corrige :
1. Sécurité : helmet, CORS strict, cookies, throttling (collect, leads, login), validation de toutes les entrées, absence de SQL concaténé, pas de secret dans le code, en-têtes de sécurité Next (CSP compatible avec les tuiles OpenStreetMap et next/font), /docs désactivé en production, messages d'erreur sans fuite d'informations.
2. Performance : index MySQL utilisés par les requêtes de stats (vérifie avec EXPLAIN les 5 requêtes les plus lourdes sur les données de démo), poids du traceur, Lighthouse de la landing ≥ 90 sur mobile.
3. Accessibilité : navigation clavier complète (landing + dashboard), focus visibles, contrastes AA en clair et en sombre, labels, rôles ARIA des Tabs/Dialog/Toast.
4. Fiabilité : l'API ne plante pas sans GeoLite2, sans réseau ou avec un lot malformé ; le site fonctionne si l'API est éteinte (le traceur échoue en silence, le formulaire affiche une erreur claire).
5. Tests : complète pour atteindre au minimum la collecte, l'auth, les leads, les stats principales (Jest) et le parcours visite → clic → formulaire → lead visible dans le dashboard (Playwright).
6. Vérifie chaque case de A13 et donne-moi un rapport : ce qui est validé, ce qui reste à faire.
7. Mets à jour le README (installation sur un nouveau PC Windows avec XAMPP, commandes, où mettre les vraies captures des réalisations et la photo d'Elios, comment mettre à jour les fichiers GeoLite2 chaque mois).
```

## B13. (Plus tard) Préparation de la mise en ligne

```text
@RELWICK.md
Phase 13 — Préparer la production (à lancer seulement quand l'hébergement sera choisi). Hypothèse par défaut : un VPS Ubuntu avec Nginx, PM2 et MySQL 8.
1. Builds de production de web (output standalone) et api, fichier ecosystem.config.js PM2.
2. Configuration Nginx : relwick.com → Next (3000), api.relwick.com → Nest (4000), HTTPS Let's Encrypt, en-têtes X-Forwarded-For / X-Real-IP transmis, TRUST_PROXY=true, COOKIE_DOMAIN=.relwick.com, COOKIE_SECURE=true, WEB_ORIGIN=https://relwick.com.
3. Script de déploiement (git pull, install, migrate deploy, build, reload PM2), sauvegarde quotidienne de la base (mysqldump compressé, 14 jours conservés), mise à jour mensuelle automatique des fichiers GeoLite2 (geoipupdate).
4. Guide pas à pas DEPLOY.md en français.
```

---

## Annexe — Points à compléter par Elios plus tard

- Captures d'écran réelles des 6 réalisations → `apps/web/public/images/realisations/`
- Photo professionnelle → `apps/web/public/images/elios.webp`
- Compte MaxMind gratuit + fichiers GeoLite2-City et GeoLite2-ASN
- Nom de domaine et hébergeur (pour les mentions légales et la phase 13)
- Relecture juridique de la page Confidentialité avant mise en ligne publique (le site collecte l'IP complète de tous les visiteurs)
