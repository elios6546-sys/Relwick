# Relwick — Design System

**Relwick** est une agence de création de sites web et d'applications (Android, iOS, PC) pour les particuliers et les entreprises. Ce design system rassemble l'identité visuelle v2 (oct. 2026, Elios Ngombe), les tokens, des composants React et un kit UI du site vitrine.

## Sources
- `Relwick_Identite_v2/` (dossier local monté) — SVG/, PNG/, ICONES_APP/, SCHEMAS/, CODE/ (`relwick-theme.css`, `relwick-tokens.json`, `relwick_theme.dart`), LISEZ-MOI.txt
- `uploads/relwick-logo-2400w.png`, `uploads/LISEZ-MOI.txt`
- Copies brutes des fichiers de code : `source/`

Aucune interface produit existante n'a été fournie : le kit UI du site est une **composition de référence** construite avec la charte, pas une recréation d'un site existant.

## Index
- `styles.css` — point d'entrée (imports uniquement)
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (espaces, rayons, ombres, motion), `base.css`, `components.css` (classes `.rw-*`)
- `guidelines/` — cartes de spécimens (Colors, Type, Spacing, Brand)
- `assets/logo/` — logos, symboles, wordmarks (SVG + quelques PNG) · `assets/app-icon/` — icônes d'app, favicon · `assets/schemas/` — construction, zone de protection
- `components/` — primitives React
- `ui_kits/website/` — site vitrine interactif
- `SKILL.md` — compatible Agent Skills

## Components
- actions : **Button**, **IconButton**, **Icon**
- forms : **Input** (+ textarea via `multiline`), **Select**, **Checkbox**, **Radio**, **Switch**
- display : **Card**, **Badge**, **Tag**
- navigation : **Tabs**
- feedback : **Dialog**, **Toast**, **Tooltip**

Aucune bibliothèque de composants n'existait dans les sources : ce jeu standard a été conçu à partir des tokens (rayon bouton 6 px et label 14/500, rayon carte 10 px — tirés de `relwick_theme.dart`).

**Intentional additions**
- `Icon` — enveloppe Lucide (CDN) ; la marque ne fournit pas de jeu d'icônes.
- Échelle typographique, ombres et tokens de motion — absents des sources, ajoutés pour le web.

## UI kits
- `ui_kits/website/` — Accueil, Services, Réalisations (filtre), Contact (formulaire → Dialog → Toast), thème clair/sombre.

---

## CONTENT FUNDAMENTALS
- **Langue** : français. **Vouvoiement** systématique (« vous », « votre projet »). L'agence parle en **« nous »**.
- **Ton** : professionnel, direct, rassurant. Phrases courtes et concrètes ; on promet des faits vérifiables (« Réponse sous 48 h », « Une version de test chaque semaine »), jamais de superlatifs creux.
- **Casse** : phrase normale partout (titres, boutons, menus). Les seuls textes en capitales sont les sur-titres (eyebrows) de 12 px espacés.
- **Boutons** : verbe à l'infinitif + objet — « Demander un devis », « Envoyer la demande », « Voir nos réalisations ».
- **Typographie française** : espace avant `: ; ? !`, guillemets « », « h » pour les heures (9 h – 18 h), « € » après le montant (2 000 €).
- **Nom de marque** : toujours « relwick » via les fichiers logo — ne jamais le retaper dans une police pour faire un logo. En texte courant : « Relwick ».
- **Emoji** : jamais.
- Exemples : « Votre site, vos applications. Bien faits. » · « Un seul interlocuteur, de la maquette à la mise en ligne. » · « Devis gratuit, réponse sous 48 h. »

## VISUAL FOUNDATIONS
- **Couleurs** : Ivoire `#F9F6F1` (fond), Encre `#0D111E` (texte, fond sombre), **Indigo Relwick `#483EFE`** = action principale, une seule par écran. **Cuivre `#C6782E`** = accent graphique ≤ 5 % (éclat du logo, filet, point de donnée) — jamais un fond de bouton ni du texte courant (utiliser `copper-text` `#894C06`). Malachite/ambre/rouge réservés aux statuts. Thème sombre complet via `data-theme="dark"`.
- **Type** : Instrument Sans 400/500/600 pour tout (titres en 500, crénage serré −0.02 à −0.035 em) ; JetBrains Mono 400 pour le code et les petites numérotations seulement.
- **Espace** : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 96. Sections espacées de 96 px ; conteneur 1200 px.
- **Fonds** : aplats d'Ivoire / Encre / surface blanche. **Pas de dégradés**, pas de textures, pas d'illustrations dessinées. Le seul motif est la **forme feuille** (`32px 0` — coins opposés arrondis), reprise du symbole, pour les visuels de marque (CTA, tuiles du hero, survol des projets).
- **Rayons** : 6 px (boutons, champs), 10 px (cartes), 16 px (dialogs), feuille 32/0, pilule pour badges.
- **Cartes** : surface blanche, filet 1 px `line` `#E6E0D7`, aucune ombre au repos ; interactives : élévation −4 px + `shadow-3` douce teintée encre au survol.
- **Bordures** : `line` décorative uniquement ; les contrôles utilisent `line-strong` `#8F8A80` (≥ 3:1).
- **Ombres** : rares, douces, teintées Encre (`shadow-1…3`). Jamais sur le logo.
- **Animation** : fluide et posée. Courbe `--ease-out` `cubic-bezier(.16,1,.3,1)`, durées 160 / 280 / 560 / 900 ms. Révélations au scroll (fondu + montée 28 px, décalées de ~90 ms), titres mot par mot sous masque, tuiles qui flottent lentement, bandeau de technos en défilement continu. Le ressort (`--ease-spring`) seulement sur de petits éléments (cases, icône de service). `prefers-reduced-motion` respecté.
- **Survol** : boutons pleins → teinte plus foncée (`primary-hover`) ; secondaires/ghost → fond `surface-sunken` ; liens → soulignement ; flèches qui glissent de 3 px ; liens de nav soulignés indigo qui se déploient depuis la gauche.
- **Pressé** : `scale(.97)`.
- **Focus** : anneau 2 px indigo décalé de 2 px.
- **Transparence / flou** : header collant en Ivoire 82 % + flou 14 px après scroll ; overlay de dialog Encre 48 % + flou 6 px. Nulle part ailleurs.
- **Images** : aucune photo fournie. Emplacements de visuels = aplats teintés des palettes (indigo-100, copper-100…). Préférer des captures d'écran produit réelles, nettes, sans filtre.
- **Logo** : marge libre = 1 module (largeur de l'éclat cuivre) ; min. 80 px de large à l'écran ; jamais de dégradé, ombre, lueur ni contour.

## ICONOGRAPHY
- La marque ne fournit **aucun jeu d'icônes** — seulement logos, symbole et icônes d'app (`assets/`).
- **Substitution** : [Lucide](https://lucide.dev) via CDN (`lucide-static@0.460.0`), trait 2 px, coins arrondis — cohérent avec les terminaisons arrondies du symbole. Rendu par le composant `Icon` (masque CSS, hérite de `currentColor`). Tailles : 16 (petits boutons), 20 (UI), 24–28 (cartes de service).
- Pas d'emoji, pas de caractères Unicode comme icônes (sauf flèches typographiques dans le texte courant si besoin).
- Favicon : `assets/app-icon/relwick-favicon.svg` / `favicon.ico`. Symbole sous 24 px : `relwick-symbol-small.svg`.

## Fonts
Instrument Sans et JetBrains Mono sont chargées depuis Google Fonts (`tokens/fonts.css`) — ce sont les polices officielles de la charte, pas une substitution. Aucun fichier binaire fourni ; ajouter des `.woff2` dans `fonts/` pour un usage hors-ligne.
