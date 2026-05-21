# Audit Frontend — CYNA-IT

> **Date de l'audit :** 2026-05-18 — **Mis à jour :** 2026-05-21 (v3)
> **Auditeur :** Claude (analyse automatisée)
> **Branche analysée :** `main` + `qualite/finitions-securite-pdf-a11y-2026-05-21`

---

## Résumé exécutif

### Avancement frontend estimé : **~86 %** *(était 78 % le matin du 2026-05-21, 58 % au 2026-05-18)*

Le frontend a connu une accélération massive entre le 19 et le 21 mai. Toutes les pages publiques et l'espace client ont été refondues sur **shadcn/ui + Tailwind 4**, DaisyUI est en quasi-disparition (un seul vestige côté Chatbot), l'i18n + RTL sont complets pour 4 langues (FR/EN natif, AR/HE partiel), et toutes les exigences fonctionnelles majeures du cahier des charges sont en place : authentification (login, register, reset, vérification email, Google SSO), 2FA TOTP + email + notifications, panier guest/connecté avec migration auto, checkout en 4 étapes avec Stripe Elements, espace client complet (profil, adresses, paiements, sécurité, commandes), chatbot IA bilingue, footer avec mentions légales et réseaux sociaux.

Le **backoffice n'est pas dans le scope du SPA React** — il est livré en **EasyAdmin v5 côté Symfony** (décision client documentée dans `CLAUDE.md` : *"Back-office — admin MPA (EasyAdmin acceptable per client). Visually consistent but a separate codebase."*).

Les chantiers restants sont essentiellement de la finalisation : autocomplétion d'adresse (à brancher sur la nouvelle API Géo DINUM du back), tests automatisés, PWA, traduction native AR/HE des 4 namespaces internes, refonte du Chatbot pour éliminer DaisyUI, cleanup `index.css`.

### Stack technique détectée

| Composant | Valeur |
|---|---|
| **Framework** | React 18.3.1 + Vite 5.4.21 |
| **Routeur** | react-router-dom 6.28.1 |
| **UI primitives** | shadcn/ui (Radix-based) + Tailwind 4.3 |
| **Icônes** | lucide-react |
| **Animations** | tw-animate-css |
| **i18n** | i18next + react-i18next (FR/EN/AR/HE, RTL OK) |
| **Gestion d'état** | React Context (AuthContext + CartContext) |
| **Client HTTP** | fetch natif via `src/api/http.js` (JWT + intercepteur 401) |
| **Paiement** | @stripe/react-stripe-js 6.4 (Elements) |
| **PDF** | jspdf 4.2 + jspdf-autotable 5.0 (lazy-loaded) |
| **2FA QR Code** | qrcode.react |
| **TypeScript** | ❌ JSX uniquement |
| **Tests** | ❌ Aucun (ni Vitest, ni Playwright) |
| **App mobile native** | ❌ Non commencée |
| **PWA** | ❌ Pas de manifest ni service worker |
| **DaisyUI** | ⚠️ Plugin chargé pour Chatbot uniquement (vestige) |

---

## État des pages et composants

### Pages publiques

#### Accueil `/`
**Statut : ✅ Fait (90 %)**

| Élément | État | Détail |
|---|---|---|
| Carrousel 3 slides | ✅ | `Carousel.jsx` — autoplay 6s + pause hover/focus/btn explicite, ARIA carousel, clavier |
| Grille catégories | ✅ | `CategoriesGrid.jsx` — nom **surimprimé sur image** (cahier des charges) |
| Top produits | ✅ | `TopProducts.jsx` — données API |
| Section Hero | ✅ | `Hero.jsx` |
| Footer non fixe | ✅ | En flux normal |
| Carrousel modifiable en admin | ✅ | Via EasyAdmin côté back |
| i18n complète | ✅ | FR/EN natif, AR/HE traduit |

---

#### Catalogue `/categories` et `/products`
**Statut : ✅ Fait (90 %)**

| Élément | État | Détail |
|---|---|---|
| Liste catégories avec nom **superposé sur image** | ✅ | `CategoriesPage.jsx` + `CategoriesGrid.jsx` — gradient bottom |
| Grille produits 4 colonnes desktop, 1-2 mobile | ✅ | 12 par page |
| Filtre catégorie | ✅ | |
| Filtre **prix min/max** | ✅ | `minPrice`/`maxPrice` |
| Filtre **disponibilité** | ✅ | `availableOnly` |
| Tri prix asc/desc, nom, priorité | ✅ | 4 options |
| Tri nouveauté `createdAt:desc` | ❌ | Deferred — endpoint back ne le supporte pas encore |
| Tri par disponibilité | ❌ | Deferred — backend |
| **Indisponibles grisés et placés en dernier** | ✅ | Stable sort client `opacity-60` |
| Pagination | ✅ | Prev/next |
| Recherche par mot-clé | ✅ | Param `q` avec debounce 300 ms |
| Layout filtre 5 colonnes responsive | ✅ | Fix débordement prix max (2026-05-21) — `min-w-0` + `w-full` + grid `minmax(0,1fr)` |

---

#### Fiche produit `/products/:id`
**Statut : 🟡 Partiel (75 %)**

| Élément | État | Détail |
|---|---|---|
| Nom, description, catégorie | ✅ | |
| Prix formaté | ✅ | "Sur devis" si absent |
| Sélection quantité | ✅ | Stepper +/- |
| Sélection durée abonnement | ✅ | 1/3/6/12 mois |
| **CTA dynamique** | ✅ | "Ajouter au panier" si dispo / "Indisponible" grisé sinon |
| **6 services similaires** | ✅ | Même catégorie, courant exclu |
| Badge disponibilité | ✅ | Pill border |
| **Carrousel d'illustrations multi-images** | ❌ | Deferred — backend n'expose pas `images[]` |
| **Caractéristiques techniques** | ❌ | Deferred — pas de champ `techSpecs` côté back |
| Bouton CTA "Essayer gratuitement" | ❌ | Pas de flag `trialAvailable` côté back |

---

#### Recherche `/products` (formulaire intégré)
**Statut : ✅ Fait (85 %)**

Filtres : `q`, `category`, `minPrice`, `maxPrice`, `availableOnly`, tri (prix asc/desc, nom, priorité), debounce 300 ms, sync URL. Reste : facette description, tri nouveauté, tri disponibilité — tous bloqués côté back.

---

#### Panier `/panier`
**Statut : ✅ Fait (95 %)**

| Élément | État | Détail |
|---|---|---|
| Accessible connecté ET invité | ✅ | Dual-mode localStorage / API avec migration auto au login |
| Affichage produits + quantité | ✅ | Stepper +/- |
| **Modification durée par ligne** | ✅ | `<select>` 1/3/6/12 mois → `PATCH /api/cart_items/:id` |
| **Alerte service indisponible** | ✅ | Inline + grisage + disable des contrôles + résumé sticky |
| Total temps réel | ✅ | `subtotal` dans CartContext |
| Suppression ligne | ✅ | |
| Bouton "Passer à la caisse" | ✅ | Redirige vers login si non connecté |

---

#### Checkout `/checkout`
**Statut : ✅ Fait (90 %)**

| Élément | État | Détail |
|---|---|---|
| **Tunnel 4 étapes (stepper)** | ✅ | Adresse → Récap → Paiement → Confirmation |
| Stepper visuel | ✅ | `<ol>` avec `aria-current="step"` |
| Sélection adresse de facturation | ✅ | Radio + formulaire nouvelle adresse |
| Création/édition adresse inline | ✅ | |
| Récapitulatif sticky | ✅ | Aside desktop, accordion mobile |
| **Paiement Stripe Elements** | ✅ | Lazy-instanciation step 3, theme aligné cyna-navy/cyan |
| Création commande API | ✅ | `POST /api/orders` |
| Validation paiement obligatoire | ✅ | |
| **Autocomplétion adresse** | ❌ | API back disponible (`/api/geo/communes`), pas branchée côté front |

---

#### Confirmation commande `/checkout/confirmation/:id`
**Statut : ✅ Fait (100 %)**

| Élément | État | Détail |
|---|---|---|
| Référence + total + statut + date | ✅ | |
| Lien espace client | ✅ | |
| **Téléchargement PDF facture** | ✅ | jsPDF lazy-load (2026-05-21) |
| Continuer mes achats | ✅ | |
| États loading + error | ✅ | |

---

#### Inscription `/register`
**Statut : ✅ Fait (95 %)**

Formulaire prénom/nom/email/mdp/confirmation, validation temps réel (12 car., maj/min/chiffre/spécial), check disponibilité email, page vérification email, Google SSO. Reste : flow "lien expiré + renvoi email" partiel.

---

#### Connexion `/login`
**Statut : ✅ Fait (100 %)**

Email/mdp, "Se souvenir de moi" (localStorage vs sessionStorage), lien mot de passe oublié, Google SSO, **2FA TOTP** (challenge intégré), redirection vers la page demandée.

---

#### Mot de passe oublié / Reset `/forgot-password` `/reset-password`
**Statut : ✅ Fait (100 %)**

Les deux pages existent, appellent les API, gestion erreurs/succès soignée.

---

#### Vérification email `/verify-email`
**Statut : 🟡 Partiel (75 %)**

Page + appel API OK. UI de renvoi email présente. Endpoint back `POST /api/verify-email/resend` à implémenter pour finaliser.

---

#### Espace client `/espace-client`
**Statut : ✅ Fait (90 %)**

| Onglet | État | Détail |
|---|---|---|
| **Profil — édition prénom/nom** | ✅ | `PATCH /api/me` |
| Lecture email (read-only) | ✅ | Cohérent avec l'API |
| **Carnet d'adresses — CRUD complet** | ✅ | Création + **édition inline** + suppression |
| **Méthodes de paiement** | ✅ | Création (mock) + suppression |
| **Commandes — liste groupée par année** | ✅ | + filtre année + recherche par référence |
| **Téléchargement PDF facture par ligne** | ✅ | Bouton FileDown par commande (2026-05-21) |
| Print liste commandes | ✅ | `window.print()` |
| **Sécurité — 2FA TOTP** | ✅ | QR code + activation + test code + désactivation (refonte shadcn 2026-05-21) |
| **Sécurité — 2FA email** | ✅ | Envoi code 6 chiffres par mail + activation/désactivation |
| **Sécurité — notifications de connexion** | ✅ | Toggle + bouton test |
| **Mail** | ✅ | Envoi mail de test via Brevo |
| **Gestion abonnements** (renouvellement / résiliation) | ❌ | Endpoint `/api/subscriptions` à exposer côté back |

---

#### Contact `/contact`
**Statut : ✅ Fait (95 %)**

Formulaire email/sujet/message + **chatbot IA Gemini intégré** avec **escalade vers support humain** (form complet email/sujet pour invités). Bilingue FR/EN. Refonte shadcn complète (drop DaisyUI deco).

---

#### Pages statiques
**Statut : ✅ Fait (100 %)**

| Page | État |
|---|---|
| CGU `/cgu` | ✅ Articles + ToC sticky desktop |
| Mentions légales `/mentions-legales` | ✅ Articles + ToC |
| À propos `/a-propos` | ✅ Mission / valeurs / CTA |

---

### Composants transversaux

#### Header / Navbar
**Statut : ✅ Fait (95 %)**

| Élément | État | Détail |
|---|---|---|
| Logo + lien accueil | ✅ | |
| Barre de recherche (desktop + mobile) | ✅ | Redirige vers `/products?q=` |
| Indicateur panier avec badge | ✅ | `itemCount` |
| Navigation principale (desktop) | ✅ | Accueil, Catégories, Produits, Contact |
| Menu burger mobile (sheet `inline-end`) | ✅ | Focus trap, ESC, click backdrop |
| **Burger connecté** : Mon espace, Mes commandes, Contact, CGU, Mentions, À propos, Déconnexion | ✅ | |
| **Burger invité** : Connexion, Inscription, Contact, CGU, Mentions, À propos | ✅ | |
| **Switcher de langue** (4 langues) | ✅ | FR/EN/AR/HE avec `<html lang>`/`<html dir>` sync |
| **Theme toggle** (dark/light) | ✅ | Persistance localStorage |
| Dropdown compte (desktop) | ✅ | Avatar initiale + menu |

---

#### Footer
**Statut : ✅ Fait (95 %)**

Logo + baseline, 3 colonnes nav (Solutions, Société, Légal), bandeau contact (mail/tel/adresse), badges trust (RGPD, PCI-DSS, hébergement EU), icônes réseaux sociaux (LinkedIn/X/YouTube/GitHub — SVG inlinés car lucide v1 a retiré les marques), copyright année dynamique. Tous les liens pointent vers les vraies routes.

---

#### Chatbot
**Statut : 🟡 Partiel (90 %)**

Fonctionnel et soigné : intégration Gemini back, multi-tours, FR/EN auto-détecté, escalade vers support humain avec formulaire pour invités. **Dernier vestige DaisyUI** (~300 lignes utilisant les vars CSS `--brand`, `--surface`, `--text-soft`). Migration shadcn en attente.

---

#### Pagination
**Statut : 🟡 Partiel (60 %)**

Présente uniquement sur `/products`. Pas de pagination sur les listes de l'espace client (commandes, adresses…) — mais ces listes sont rarement assez longues pour le justifier.

---

#### Skip-link / a11y globale
**Statut : ✅ Fait (90 %)**

Skip-link `Aller au contenu principal` traduit 4 langues, focus visible partout, aucun `<div onClick>`, contrastes vérifiés sur les tokens semantic shadcn. Reste : audit `axe DevTools` complet page par page non effectué.

---

### Exigences non-fonctionnelles

| Exigence | Statut | Détail |
|---|---|---|
| **Mobile-first responsive** | ✅ | Breakpoints sm/md/lg/xl, testé 360→1280 px |
| **Design system cohérent** | ✅ | `DESIGN.md` v0.4 — tokens shadcn (couleurs, typo, radii, motion) |
| **i18n multilingue (4 langues)** | ✅ | FR/EN natif + AR/HE (5 namespaces publics natifs, 4 internes en fallback FR) |
| **Support RTL** (arabe, hébreu) | ✅ | Logical CSS properties + auto-flip lucide icons en `[dir="rtl"]` |
| **Bouton changement de langue** | ✅ | Navbar — switcher 4 langues |
| **Accessibilité clavier** | ✅ | Tab order, ESC sur overlays, arrow keys carousel |
| **Skip-link** | ✅ | |
| **Focus visible (WCAG 1.4.11)** | ✅ | `--shadow-focus` ring partout |
| **Contrastes 4.5:1 minimum** | 🟡 | Tokens vérifiés, audit `axe` complet à faire |
| **prefers-reduced-motion** | ✅ | Toutes les animations via `motion-safe:` |
| **États loading/error/empty** | ✅ | Composant `ResourceState` + EmptyState dédié |
| **Gestion XSS** | 🟡 | Pas de `dangerouslySetInnerHTML` ; pas de DOMPurify (mais pas nécessaire vu les données affichées) |
| **PWA** | ❌ | Pas de manifest ni service worker |
| **App mobile native (Android/iOS)** | ❌ | Non commencée |

---

## Backlog frontend restant

| # | Intitulé | Difficulté | Statut | Priorité |
|---|---|---|---|---|
| 1 | Backoffice CRUD produits + Dashboard React | — | **Hors scope** (EasyAdmin côté back) | — |
| 2 | **Autocomplétion adresse** dans Checkout via `/api/geo/communes` (DINUM) | Moyen | ❌ À brancher | P1 |
| 3 | **Téléchargement facture via endpoint back** `/api/invoices/{id}/download` (en complément du jsPDF actuel) | Facile | ❌ | P2 |
| 4 | **PWA** (manifest + service worker + offline-first basique) | Moyen | ❌ | P1 |
| 5 | Refacto **Chatbot.jsx** vers shadcn (retirer dernier vestige DaisyUI) | Moyen | ❌ | P2 |
| 6 | Cleanup `index.css` (≈200 lignes legacy DaisyUI orphelin) | Facile | ❌ | P2 |
| 7 | **Traduction native AR/HE** des 4 namespaces internes (checkout, account, legal, contact) | Moyen | ❌ | P2 |
| 8 | **Tests Vitest + Playwright** (smoke parcours achat + auth) | Difficile | ❌ | P2 |
| 9 | Audit a11y `axe DevTools` complet + corrections | Moyen | 🟡 Passe statique faite | P2 |
| 10 | **Gestion abonnements** dans l'espace client (renouvellement/résiliation) | Moyen | ❌ Bloqué par endpoint back | P3 |
| 11 | **Carrousel multi-images** sur fiche produit | Facile | ❌ Bloqué par backend (champ `images[]`) | P3 |
| 12 | **Caractéristiques techniques** sur fiche produit | Facile | ❌ Bloqué par backend (champ `techSpecs`) | P3 |
| 13 | **Renvoi email de vérification** UI déjà en place | Facile | ❌ Bloqué par endpoint back `POST /api/verify-email/resend` | P3 |
| 14 | **App mobile** (PWA validée d'abord, sinon React Native) | Très difficile | ❌ | P3 |
| 15 | Code-splitting locales i18next (passage à `i18next-http-backend`) | Moyen | ❌ Optimisation | P3 |

---

## Plan d'action recommandé

### 🎯 Aujourd'hui — pour atteindre 90 %

1. **Autocomplétion d'adresse** dans Checkout (3-4 h) — branche les inputs ville/code postal/région sur les 5 endpoints `/api/geo/*` du back. Visuellement valorisant, ferme une exigence UX du cahier.
2. **Bouton "Télécharger via back"** (`/api/invoices/{id}/download`) en complément du PDF jsPDF (1 h) — donne une "vraie" facture officielle.

### 🔄 Cette semaine — pour viser 92-94 %

3. **PWA** (1 j) — manifest + service worker, ferme l'exigence "app mobile" du cahier de manière économique.
4. **Cleanup `index.css`** (30 min) — retire les ~200 lignes de classes legacy DaisyUI orphelines.
5. **Refacto Chatbot.jsx** (3-4 h) — élimine la dernière dépendance DaisyUI, permet d'enlever le plugin du `vite.config.js`.
6. **Traduction native AR/HE** des 4 namespaces internes (2-3 h).

### 📦 Plus tard — qualité long terme

7. Tests Vitest + Playwright (2-3 j) — smoke tests parcours critiques.
8. Audit a11y complet `axe DevTools` (1 j d'audit + corrections).
9. Code-splitting locales i18next (2 h) — réduit le bundle initial.

---

## Annexe : Fichiers clés du projet

| Fichier | Rôle |
|---|---|
| `src/App.jsx` | Racine React |
| `src/routes/AppRouter.jsx` | Toutes les routes |
| `src/routes/ProtectedRoute.jsx` | Garde de route par rôle |
| `src/components/AppShell.jsx` | Shell (Navbar + main + Footer + Chatbot + skip-link) |
| `src/context/AuthContext.jsx` | État authentification global |
| `src/context/CartContext.jsx` | État panier global (guest + connecté) |
| `src/api/http.js` | Client HTTP centralisé (fetch + JWT + 401 intercept) |
| `src/api/authApi.js` | Login, register, reset, verify, profile |
| `src/api/catalogApi.js` | Catégories, produits, recherche |
| `src/api/cartApi.js` | Panier serveur |
| `src/api/orderApi.js` | Commandes |
| `src/api/addressApi.js` | Adresses utilisateur |
| `src/api/paymentMethodApi.js` | Méthodes de paiement |
| `src/api/mailApi.js` | Mail test |
| `src/i18n/index.js` | Init i18next |
| `src/i18n/useLocale.js` | Hook locale + dir (`<html lang>`/`<html dir>` sync) |
| `src/i18n/locales/{fr,en,ar,he}/*.json` | 9 namespaces × 4 langues |
| `src/lib/invoicePdf.js` | Génération PDF facture (jsPDF lazy) |
| `src/lib/utils.js` | `cn()` helper (clsx + tailwind-merge) |
| `src/components/Navbar.jsx` | Header + burger + switcher langue + theme + dropdown compte |
| `src/components/Footer.jsx` | Footer + réseaux sociaux + badges trust |
| `src/components/Chatbot.jsx` | Chatbot IA (dernier vestige DaisyUI) |
| `src/components/Carousel.jsx` | Carousel home avec a11y complète |
| `src/components/ResourceState.jsx` | Wrapper loading/error/skeleton |
| `src/components/account/SecuritySettings.jsx` | Onglet sécurité refondu (shadcn) |
| `src/components/ui/*` | Primitives shadcn (button, sheet, dropdown-menu) |
| `src/pages/*.jsx` | 20 pages (auth, catalogue, panier, checkout, account, statiques) |
| `DESIGN.md` | Rulebook design system (tokens + patterns + change log) |
| `package.json` | Dépendances (cf. stack technique ci-dessus) |
| `vite.config.js` | Config Vite (Tailwind plugin, alias `@/*` → `src/*`) |
| `tailwind.config.js` | Tokens Tailwind 4 + thèmes DaisyUI (transition) |

---

## Historique des audits

| Date | Avancement | Faits marquants |
|---|---|---|
| 2026-05-18 | 58 % | Audit initial — backoffice 0 %, pages statiques 0 %, i18n 0 %, design system fragmenté |
| 2026-05-19 | 68 % | Sprint 1 : shadcn installé, refonte Navbar/Footer/Auth/Home/Catalogue/Product/Cart/Checkout/Account/Contact, pages statiques créées |
| 2026-05-20 (matin) | 73 % | Sprint 2.5a-b : i18n FR/EN complète, migration vers `i18next`, switcher langue actif |
| 2026-05-20 (soir) | 78 % | Sprint 2.5c-d : AR/HE actifs + RTL avec auto-flip icônes, refonte AccountPage, traduction native 5 namespaces publics |
| 2026-05-21 (matin) | 78 % | État au début de session — backoffice toujours considéré à faire dans le SPA (erreur — voir décision EasyAdmin) |
| 2026-05-21 (midi) | **86 %** | Sprint 2.5e : SecuritySettings refondu, export PDF facture jsPDF, cleanup font Material Symbols, fix layout filtres ProductsPage |

---

*Rapport généré le 2026-05-21 par analyse statique du code source et du change log `DESIGN.md`.*
