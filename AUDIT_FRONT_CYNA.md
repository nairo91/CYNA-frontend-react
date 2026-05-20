# Audit Frontend — CYNA-IT

> **Date :** 18 mai 2026 — **Mis à jour :** 20 mai 2026 (soir)  
> **Projet :** CYNA-IT — plateforme e-commerce SaaS de cybersécurité  
> **Analysé par :** Claude Code (assistant senior L3)  
> **Branche analysée :** `main`

---

## Résumé exécutif

| Indicateur | Valeur |
|---|---|
| **Avancement frontend estimé** | **~78 %** *(était 58 % au 2026-05-18)* |
| **Framework** | React 18.3.1 |
| **Routeur** | React Router v6.28.1 |
| **Bundler** | Vite 5.4.1 |
| **Design system** | Tailwind CSS v4 (via plugin Vite) + embryon shadcn/ui (`button`, `dropdown-menu`, `sheet`) + lucide-react + class-variance-authority |
| **Gestion d'état** | React Context API (AuthContext + CartContext) |
| **i18n** | **`i18next 23.16` + `react-i18next 14.1` — 4 locales (FR / EN / AR / HE) avec support RTL**, 9 namespaces JSON |
| **Paiement** | **`@stripe/stripe-js 9.6` + `@stripe/react-stripe-js 6.4` — `PaymentElement` intégré au checkout** |
| **2FA** | **TOTP (via `qrcode.react`) + email — composant `SecuritySettings`** |
| **TypeScript** | ❌ Non (JSX uniquement) |
| **Tests** | ❌ Aucun (ni unitaires, ni E2E) |
| **App mobile** | ❌ Non commencée |

### Ce qui fonctionne bien

- **Authentification complète** : login + register + reset + vérif email + Google SSO + **2FA TOTP** + **2FA email** + notifications de connexion
- **Checkout en 4 étapes (stepper)** : Address → Summary → Payment Stripe → Confirmation
- **Stripe Elements** : `PaymentElement` rendu avec thème dark personnalisé, `stripe.confirmPayment()` avec redirection conditionnelle
- **i18n mature** : 4 locales (FR / EN / arabe / hébreu) + RTL via hook `useLocale()`
- **Pages statiques** : CGU, mentions légales, à propos — toutes présentes avec i18n
- **Espace client complet** : 6 onglets (Profile, Orders, Addresses, Payments, Security, Mail) avec CRUD adresses + méthodes paiement, historique commandes filtrable
- Panier dual-mode invité (localStorage) + connecté (API)
- Catalogue avec recherche, filtres et pagination
- Chatbot IA intégré avec escalade
- Routing protégé par rôle

### Ce qui manque le plus

- **Backoffice admin SPA** (0 % — volontairement, EasyAdmin v5 côté backend `/admin` remplit ce rôle)
- **Téléchargement facture PDF** (bouton + endpoint backend manquants)
- **Tests** (Vitest/Jest non configurés, 0 fichier)
- **App mobile** Android / iOS (0 %)
- Quelques finitions (alerte produit indisponible dans panier, error boundary, nettoyage `siteText.js` legacy)

---

## État des pages et composants

### Pages principales

#### Accueil `/`
**Statut : 🟡 Partiel (70 %)**

| Élément | État | Détail |
|---|---|---|
| Carrousel 3 slides | ✅ Fait | `Carousel.jsx` — 3 slides codées en dur dans `siteText.js` |
| Grille catégories | ✅ Fait | `CategoriesGrid.jsx` — données API |
| Top produits | ✅ Fait | `TopProducts.jsx` — données API |
| Section Hero / intro | ✅ Fait | `Hero.jsx` présent |
| Carrousel modifiable en admin | ❌ Manquant | Le contenu des slides est statique dans le code |
| Texte dynamique configurable | ❌ Manquant | Tout le texte est dans `siteText.js`, pas de CMS |
| Footer non fixe | ✅ Fait | Footer présent, non `position: fixed` |

---

#### Catalogue `/categories` et `/products`
**Statut : 🟡 Partiel (65 %)**

| Élément | État | Détail |
|---|---|---|
| Liste des catégories | ✅ Fait | `CategoriesPage.jsx` avec image + nom + description |
| Grille produits avec pagination | ✅ Fait | 12 produits par page, prev/next |
| Filtre par catégorie | ✅ Fait | `<select>` dans `ProductsPage.jsx` |
| Tri par priorité / prix / nom | ✅ Fait | 4 options de tri |
| Image catégorie avec **surimpression du nom** | ❌ Manquant | Le nom est affiché en-dessous, pas superposé sur l'image |
| Vue liste mobile / grille desktop | ❌ Manquant | Uniquement la grille — pas de toggle vue liste |
| Tri par disponibilité | ❌ Manquant | Pas d'option `available:asc/desc` |
| Produits épuisés **grisés en dernier** | ❌ Manquant | Pas de logique de tri / style sur la disponibilité |

---

#### Fiche produit `/products/:id`
**Statut : 🟡 Partiel (50 %)**

| Élément | État | Détail |
|---|---|---|
| Nom, description, catégorie | ✅ Fait | `ProductDetailPage.jsx` |
| Prix formaté | ✅ Fait | "Sur devis" si absent |
| Sélection quantité | ✅ Fait | `<input type="number">` |
| Sélection durée abonnement | ✅ Fait | 1 / 3 / 6 / 12 mois |
| Bouton Ajouter au panier | ✅ Fait | Fonctionne guest + connecté |
| **Carrousel d'illustrations** | ❌ Manquant | Une seule image, pas de carousel |
| Caractéristiques techniques | ❌ Manquant | Pas de champ dédié affiché |
| **6 services similaires aléatoires** | ❌ Manquant | Section absente |
| **CTA dynamique** (S'abonner / Essayer / Indisponible) | ❌ Manquant | Un seul bouton "Ajouter au panier" quel que soit l'état |
| Badge disponibilité | ❌ Manquant | Pas d'indicateur visible |

---

#### Recherche avancée (intégrée dans `/products`)
**Statut : 🟡 Partiel (55 %)**

| Élément | État | Détail |
|---|---|---|
| Recherche par titre | ✅ Fait | Champ `q` envoyé à `searchCatalog()` |
| Filtre catégorie | ✅ Fait | `<select>` catégorie |
| Tri prix asc / desc | ✅ Fait | Options de tri |
| **Facette description** | ❌ Manquant | Le back peut l'accepter mais le front n'expose pas ce champ |
| **Facette caractéristiques** | ❌ Manquant | Absent |
| **Prix min / max** | ❌ Manquant | Absent |
| Filtre disponibilité | ❌ Manquant | Absent |
| Tri nouveauté | ❌ Manquant | Pas d'option `createdAt:desc` |
| Résultats sans rechargement (debounce) | ❌ Manquant | Nécessite clic sur "Rechercher" |

---

#### Panier `/panier`
**Statut : 🟡 Partiel (75 %)**

| Élément | État | Détail |
|---|---|---|
| Accessible connecté ET invité | ✅ Fait | Dual-mode localStorage / API |
| Affichage produits + quantité | ✅ Fait | Modification quantité en direct |
| Durée abonnement affichée | ✅ Fait | Affichage en lecture seule |
| Total temps réel | ✅ Fait | Calcul `subtotal` dans CartContext |
| Bouton "Passer à la caisse" | ✅ Fait | Redirige vers login si non connecté |
| **Modification durée dans le panier** | ❌ Manquant | La durée est fixée sur la fiche produit, pas modifiable dans le panier |
| **Alerte service indisponible** | ❌ Manquant | Pas de vérification ni alerte de dispo |
| Suppression ligne | ✅ Fait | Bouton "Supprimer" |

---

#### Checkout `/checkout`
**Statut : ✅ Fait (95 %)** *(était 55 %)*

| Élément | État | Détail |
|---|---|---|
| **Tunnel en 4 étapes (stepper)** | ✅ Fait | Composant `Stepper()` avec icônes + progression : Address → Summary → Payment → Confirmation |
| Sélection adresse de facturation | ✅ Fait | Radio buttons + formulaire nouvelle adresse inline |
| Création nouvelle adresse | ✅ Fait | Form `Field()` réutilisable avec validation |
| Récapitulatif + total | ✅ Fait | Aside sticky avec lignes détaillées (qty × prix × durée) |
| **Intégration Stripe Elements** | ✅ Fait | `loadStripe(VITE_STRIPE_PUBLISHABLE_KEY)`, `<Elements>` + `<PaymentElement>`, apparence dark personnalisée (cyan/rouge) |
| **Création PaymentIntent backend** | ✅ Fait | `POST /api/checkout/payment-intent` via `checkoutApi.js`, récupère `clientSecret` |
| **Confirmation paiement** | ✅ Fait | `stripe.confirmPayment()` avec `return_url` vers `/checkout/confirmation/:id` |
| Paiement obligatoire avant commande | ✅ Fait | Le statut Order passe à PAID uniquement via webhook Stripe |
| **Étape connexion / inscription / invité** | ❌ Manquant | Le redirect login est géré depuis le panier mais pas dans le tunnel |

---

#### Confirmation commande `/checkout/confirmation/:id`
**Statut : ✅ Fait (85 %)**

Affiche référence, total, statut, date. Lien vers l'espace client. Manque : bouton télécharger la facture PDF.

---

#### Inscription `/register`
**Statut : ✅ Fait (90 %)**

| Élément | État | Détail |
|---|---|---|
| Formulaire nom / email / mdp / confirmation | ✅ Fait | |
| Validation temps réel côté client | ✅ Fait | 12 car., majuscule, minuscule, chiffre, spécial |
| Messages d'erreur clairs | ✅ Fait | |
| Page "email de confirmation envoyé" | 🟡 Partiel | `VerifyEmailPage.jsx` existe mais le flow post-inscription est basique |
| Check disponibilité email | ✅ Fait | Via API |

---

#### Connexion `/login`
**Statut : ✅ Fait (95 %)**

Formulaire email/mdp, "Se souvenir de moi" (localStorage vs sessionStorage), lien mot de passe oublié, redirection vers la page demandée. Rien de manquant fonctionnellement.

---

#### Mot de passe oublié / Reset `/forgot-password` `/reset-password`
**Statut : ✅ Fait (90 %)**

Les deux pages existent et appellent les API correspondantes.

---

#### Vérification email `/verify-email`
**Statut : 🟡 Partiel (60 %)**

La page existe et appelle l'API. Manque : gestion du cas "lien expiré" et renvoi de l'email de vérification.

---

#### Compte utilisateur `/espace-client`
**Statut : ✅ Fait (85 %)** *(était 60 %)* — `AccountPage.jsx` 1043 lignes, 6 onglets

| Élément | État | Détail |
|---|---|---|
| Affichage infos perso | ✅ Fait | Prénom, nom, email, rôles, vérification |
| **Modification infos perso** | ✅ Fait | Onglet Profile — édition firstname/lastname en place (email read-only) |
| Carnet d'adresses — Créer | ✅ Fait | Onglet Addresses |
| Carnet d'adresses — **Modifier** | ✅ Fait | Bouton edit pré-remplit le formulaire |
| Carnet d'adresses — Supprimer | ✅ Fait | |
| Méthodes de paiement CRUD | ✅ Fait | Onglet Payments — affichage masqué `•••• XXXX`, form avec validation |
| Liste des commandes | ✅ Fait | Onglet Orders — historique groupé par année, filtres recherche + année, statuts colorisés, bouton print |
| **Onglet Security (2FA)** | ✅ Fait | `SecuritySettings.jsx` — TOTP setup avec QR code, 2FA email, toggle notifications login |
| **Onglet Mail** | ✅ Fait | Test envoi mail vers endpoint backend |
| **Gestion abonnements** (renouvellement / résiliation) | ❌ Manquant | Onglet absent — dépend de `/api/me/subscriptions` côté backend |
| Déconnexion | ✅ Fait | |

---

#### Historique commandes (dans `/espace-client`, onglet Commandes)
**Statut : 🟡 Partiel (75 %)** *(était 40 %)*

| Élément | État | Détail |
|---|---|---|
| Liste des commandes | ✅ Fait | Triées par date desc depuis l'API |
| Lien vers le détail | ✅ Fait | |
| **Regroupement par année** | ✅ Fait | Groupes calculés depuis les dates |
| **Filtres année / statut** | ✅ Fait | Select année + statut |
| **Barre de recherche** | ✅ Fait | Filtre par référence/produit |
| Bouton impression | ✅ Fait | Icône Printer |
| **Télécharger facture PDF** | ❌ Manquant | Couplé à la génération PDF côté backend (absente) |

---

#### Contact `/contact`
**Statut : ✅ Fait (90 %)**

Formulaire email/sujet/message + chatbot IA intégré avec escalade vers support humain. Complet pour les besoins du cahier des charges.

---

#### Backoffice admin SPA
**Statut : ❌ Volontairement absent (0 %)**

Pas de pages admin dans le SPA React. Le backoffice est désormais assuré par **EasyAdmin v5 côté backend** (`/admin` — branche `feature/easyadmin-backoffice` mergée). 10 CRUDs complets + dashboard KPI + login dédié. Ce choix simplifie l'architecture (un seul code admin à maintenir, partage de la session Symfony).

---

#### Pages statiques
**Statut : ✅ Fait (100 %)** *(était 0 %)*

| Page | État | Détail |
|---|---|---|
| `/cgu` (CGUPage) | ✅ Fait | Avec i18n (`legal.json`), table des matières, date de mise à jour |
| `/mentions-legales` (LegalPage) | ✅ Fait | Avec i18n, slugification des titres |
| `/a-propos` (AboutPage) | ✅ Fait | Avec i18n, missions, paragraphes |

---

### Composants transversaux

#### Header / Navbar
**Statut : 🟡 Partiel (75 %)**

| Élément | État | Détail |
|---|---|---|
| Logo + lien accueil | ✅ Fait | |
| Barre de recherche (desktop + mobile) | ✅ Fait | Redirige vers `/products?q=` |
| Indicateur panier avec badge | ✅ Fait | `itemCount` dans CartContext |
| Navigation principale | ✅ Fait | Accueil, Catégories, Produits, Contact |
| Menu burger | ✅ Fait | S'ouvre/ferme, se ferme au changement de route |
| **Burger connecté** : lien "Paramètres" | ❌ Manquant | Absent du burger |
| **Burger connecté** : lien "Mes commandes" | ❌ Manquant | Absent (il faut aller dans l'espace client) |
| **Burger connecté** : CGU / Mentions légales / À propos / Contact | ❌ Manquant | Pointent vers des ancres inexistantes |
| **Burger non connecté** : CGU / Mentions légales / À propos | ❌ Manquant | Même ancres cassées |
| Bouton changement de langue | ❌ Manquant | Absent |

---

#### Footer
**Statut : 🟡 Partiel (60 %)**

| Élément | État | Détail |
|---|---|---|
| Présent et non fixe | ✅ Fait | |
| **Liens légaux** (CGU, mentions) | ❌ Manquant | Les pages de destination n'existent pas |
| **Liens réseaux sociaux** | ❌ Manquant | Absents |
| À propos | ❌ Manquant | Page inexistante |

---

#### Pagination
**Statut : 🟡 Partiel (50 %)**

Présente uniquement sur le catalogue `/products`. Absente sur toutes les autres listes (commandes, adresses…).

---

### Exigences non-fonctionnelles

| Exigence | Statut | Détail |
|---|---|---|
| **Mobile-first responsive** | ✅ Fait | Tailwind v4 avec breakpoints standards, design 360 px first |
| **Design system cohérent** | 🟡 Partiel | Tailwind tokens + embryon shadcn (`button`, `dropdown-menu`, `sheet`) — `DESIGN.md` documente la direction esthétique |
| **i18n multilingue** | ✅ Fait | `i18next` + `react-i18next`, 4 locales (FR/EN/AR/HE), 9 namespaces |
| **Support RTL** (arabe, hébreu) | ✅ Fait | Locales AR + HE présentes, hook `useLocale()` gère `dir` HTML |
| **Bouton changement de langue** | ✅ Fait | Dans le menu (sélecteur de locale) |
| **Accessibilité clavier** | 🟡 Partiel | `aria-label` étendus, focus rings, mais pas d'audit WCAG complet |
| **Contrastes suffisants** | 🟡 Partiel | Tokens Tailwind cohérents, non audité formellement |
| **États de chargement** | ✅ Fait | Composant `ResourceState` |
| **Gestion des erreurs** | ✅ Fait | Messages sur chaque formulaire et page |
| **Protection XSS** | 🟡 Partiel | Pas de `dangerouslySetInnerHTML`, sanitisation via React par défaut |
| **Paiement PCI-DSS** | ✅ Fait | Stripe Elements — aucune donnée carte ne transite par notre code |
| **Application mobile Android / iOS** | ❌ Manquant | Non commencée |

---

## Backlog frontend restant

| Ticket # | Intitulé | Difficulté | Statut | Priorité suggérée |
|---|---|---|---|---|
| 1 | Setup projet et architecture | Facile | ✅ Fait | — |
| 2 | Design system / librairie composants | Moyen | 🟡 Partiel — CSS custom sans tokens ni doc | P2 |
| 3 | Header / Navbar | Moyen | 🟡 Partiel — burger incomplet, pas de langue | P1 |
| 4 | Footer | Facile | 🟡 Partiel — liens légaux cassés, pas de réseaux sociaux | P1 |
| 5 | Page Accueil | Moyen | 🟡 Partiel — carrousel statique, texte non dynamique | P2 |
| 7 | Catalogue produits | Moyen | 🟡 Partiel — surimpression, dispo, grisé manquants | P1 |
| 8 | Fiche produit SaaS | Moyen | 🟡 Partiel — pas de carrousel ni similaires ni CTA dynamique | P1 |
| 11 | Recherche avancée | Moyen | 🟡 Partiel — facettes prix min/max et dispo manquantes | P2 |
| 13 | Panier | Facile | 🟡 Partiel — alerte dispo et modif durée manquantes | P1 |
| 15 | Checkout (tunnel 4 étapes) | Difficile | 🟡 Partiel — 1 seule page, pas de stepper ni de paiement réel | P1 |
| 16 | Confirmation commande | Facile | ✅ Fait | — |
| 18 | Inscription | Facile | ✅ Fait | — |
| 19 | Connexion | Facile | ✅ Fait | — |
| 20 | Mot de passe oublié / reset | Facile | ✅ Fait | — |
| 21 | Vérification email | Facile | 🟡 Partiel — renvoi email manquant | P3 |
| 22 | Compte utilisateur | Moyen | 🟡 Partiel — profil en lecture seule, adresses sans update | P1 |
| 24 | Historique commandes | Moyen | 🟡 Partiel — pas de filtres, pas de PDF | P2 |
| 25 | Carnet d'adresses | Facile | 🟡 Partiel — update manquant | P2 |
| 31 | Page Contact | Facile | ✅ Fait | — |
| 35 | Chatbot | Difficile | ✅ Fait | — |
| 39 | Backoffice — CRUD produits | Difficile | ❌ Manquant | P0 |
| 42 | Backoffice — Dashboard / graphiques | Difficile | ❌ Manquant | P0 |
| 45 | Pages statiques (CGU, Mentions, À propos) | Facile | ❌ Manquant | P0 |
| 49 | Internationalisation (i18n) | Difficile | ❌ Manquant | P2 |
| 50 | Accessibilité (WCAG) | Moyen | 🟡 Partiel | P2 |
| 51 | Protection XSS côté client | Facile | 🟡 Partiel | P2 |
| 56 | Application mobile | Très difficile | ❌ Manquant | P3 |

---

## Plan d'action frontend recommandé

> **Mise à jour 2026-05-20 (soir) :** les points 1, 2, 3, 4, 7, 8 et 13 du plan initial sont désormais réalisés (Stripe, i18n RTL, stepper 4 étapes, pages statiques, espace client complet, header refactorisé). Le reste reste pertinent.

---

### 1. ✅ ~~Pages statiques : CGU, Mentions légales, À propos~~ — FAIT
**Pourquoi en premier ?** Sans ces pages, tous les liens du menu burger et du footer sont cassés. C'est aussi une obligation légale.  
**Comment ?** Créer 3 fichiers simples (ex. `CGUPage.jsx`, `LegalPage.jsx`, `AboutPage.jsx`) avec du texte statique, les ajouter dans le routeur, et mettre à jour les `href` dans `siteText.js`.  
**Difficulté :** Facile — 2 à 3 heures.

---

### 2. 🔴 Footer complet + Menu burger différencié
**Pourquoi ?** Le footer affiche des ancres cassées. Le burger n'a pas les bons liens selon si l'utilisateur est connecté ou non (selon le cahier des charges).  
**Comment ?** Mettre à jour `Footer.jsx` (liens vers les vraies pages + icônes réseaux sociaux). Dans `Navbar.jsx`, ajouter une liste de liens "connecté" (Paramètres → `/espace-client`, Mes commandes, CGU, Contact, Déconnexion) et une liste "invité" (Connexion, Inscription, CGU, Contact). La logique `isAuthenticated` est déjà là.  
**Difficulté :** Facile — 3 à 4 heures.

---

### 3. ✅ ~~Backoffice — CRUD produits~~ — COUVERT par EasyAdmin v5 backend (`/admin`)

Décision d'architecture : pas de SPA admin. Le backoffice est géré côté Symfony via EasyAdmin v5. Si un besoin d'admin spécifique apparaît (ex : opérations bulk côté mobile), réévaluer.

---

### 4. ✅ ~~Backoffice — Dashboard avec graphiques~~ — COUVERT par EasyAdmin (dashboard KPI + endpoints `/api/admin/dashboard/*`)

---

### 5. 🟠 Fiche produit : carrousel, services similaires et CTA dynamique
**Pourquoi ?** La fiche produit est l'élément le plus important du parcours d'achat. Afficher un seul bouton "Ajouter au panier" sans tenir compte de la disponibilité est une erreur UX.  
**Comment ?**  
  - Carrousel : remplacer la `<img>` par un composant `Carousel` (réutiliser `Carousel.jsx` existant si possible)  
  - CTA dynamique : `product.available === false` → bouton "Indisponible" (grisé) ; `product.trialAvailable` → bouton "Essayer gratuitement" ; sinon → "S'abonner"  
  - Similaires : appeler `getServices({ category: product.category.id, limit: 6 })` et afficher une grille  
**Difficulté :** Moyen — 4 à 6 heures.

---

### 6. 🟠 Catalogue : surimpression du nom, disponibilité et produits grisés
**Pourquoi ?** Le cahier des charges précise ces éléments visuels et fonctionnels.  
**Comment ?**  
  - Surimpression : CSS `position: absolute` sur `.category-card-link` — mettre le `<strong>` en overlay sur l'image  
  - Produits épuisés : dans `ProductsPage.jsx`, trier les résultats côté front pour que les indisponibles arrivent en dernier, et ajouter une classe CSS `product-card--unavailable` (opacité réduite)  
  - Filtre disponibilité : ajouter un `<select>` "Disponibilité" dans le formulaire de filtres  
**Difficulté :** Moyen — 4 à 6 heures.

---

### 7. ✅ ~~Checkout : tunnel en 4 étapes (stepper)~~ — FAIT (avec Stripe Elements en plus)

---

### 8. 🟠 Compte utilisateur : gestion abonnements
**Pourquoi ?** L'espace client est désormais 85 % complet (édition profil + CRUD adresses + 2FA + commandes). Reste : gestion des abonnements (renouvellement / résiliation).  
**Comment ?** Dépend du backend (`/api/me/subscriptions` n'existe pas encore). Voir backlog backend ticket 36.  
**Difficulté :** Moyen — 1 journée *après* que le backend expose les endpoints.

---

### 9. 🟡 Historique commandes : filtres et export PDF
**Pourquoi ?** L'historique actuel est une liste plate sans possibilité de filtrage. L'export PDF est requis.  
**Comment ?**  
  - Filtres : ajouter un `<select>` d'année (calculée depuis les dates de commandes) et un filtre par statut  
  - PDF : utiliser la librairie **jsPDF** ou **react-pdf** pour générer un PDF côté client depuis les données de commande  
**Difficulté :** Moyen — 1 journée.

---

### 10. 🟡 Recherche avancée : facettes prix min/max et disponibilité
**Pourquoi ?** La recherche actuelle manque les filtres prix (min/max) et disponibilité, qui sont dans le cahier des charges.  
**Comment ?** Ajouter deux `<input type="number">` (prix min / max) et un `<select>` disponibilité dans le formulaire de `ProductsPage.jsx`. Passer ces valeurs à `searchCatalog()` et s'assurer que l'API les accepte.  
**Difficulté :** Facile — 2 à 3 heures.

---

### 11. 🟡 Panier : alerte service indisponible et modification durée
**Pourquoi ?** Si un produit devient indisponible entre l'ajout au panier et la commande, l'utilisateur doit être alerté.  
**Comment ?**  
  - Vérifier `product.available` pour chaque ligne du panier (appel API ou champ stocké)  
  - Afficher une alerte `auth-feedback-error` sur la ligne concernée  
  - Ajouter un `<select>` durée sur chaque ligne (similaire à celui de la fiche produit)  
**Difficulté :** Moyen — 3 à 4 heures.

---

### 12. 🟡 Accessibilité : navigation clavier et contrastes
**Pourquoi ?** Requis par le cahier des charges. Sans audit WCAG, on ne sait pas si les éléments interactifs sont vraiment accessibles.  
**Comment ?** Utiliser l'extension Chrome **axe DevTools** (gratuite) pour identifier les problèmes. Points classiques : focus visible sur tous les boutons, `alt` sur toutes les images, étiquettes `<label>` liées aux `<input>`, contrastes suffisants (ratio 4.5:1 minimum).  
**Difficulté :** Moyen — 1 journée d'audit + corrections.

---

### 13. ✅ ~~i18n multilingue avec support RTL~~ — FAIT

`i18next` + `react-i18next` installés, **4 locales** (FR / EN / AR / HE) en place via 9 fichiers JSON par namespace, hook `useLocale()` gère la direction `dir`. Reste à finir de migrer le contenu legacy de `src/content/siteText.js` (~1 h).

---

### 14. 🟢 Application mobile Android / iOS
**Pourquoi ?** Requis par le cahier des charges, mais c'est le chantier le plus long et le plus indépendant du reste.  
**Comment ?** Deux approches possibles pour un niveau L3 :  
  - **React Native** (recommandé si vous connaissez React) — permet de réutiliser une partie de la logique métier (contextes, API) mais pas les composants UI  
  - **PWA** (Progressive Web App) — moins "natif" mais beaucoup plus simple : ajouter un `manifest.json`, un service worker, et la gestion hors ligne. Fait depuis le projet React existant.  
> Conseil : commencer par la PWA pour valider le besoin, puis passer à React Native si des notifications push ou une UX vraiment native sont requises.  
**Difficulté :** Très difficile (React Native) / Moyen (PWA) — 2 à 4 semaines.

---

## Annexe : Fichiers clés du projet

| Fichier | Rôle |
|---|---|
| `src/App.jsx` | Racine React |
| `src/routes/AppRouter.jsx` | Toutes les routes de l'application |
| `src/routes/ProtectedRoute.jsx` | Garde de route par rôle |
| `src/context/AuthContext.jsx` | État d'authentification global |
| `src/context/CartContext.jsx` | État du panier global (guest + connecté) |
| `src/api/http.js` | Client HTTP centralisé (fetch + JWT) |
| `src/api/authApi.js` | Login, register, reset, verify |
| `src/api/catalogApi.js` | Catégories, produits, recherche |
| `src/api/cartApi.js` | Panier API |
| `src/api/orderApi.js` | Commandes + contact |
| `src/api/addressApi.js` | Adresses utilisateur |
| `src/api/paymentMethodApi.js` | Méthodes de paiement |
| `src/content/siteText.js` | Tous les textes FR de l'interface |
| `src/i18n/chatbot.js` | Traductions chatbot FR/EN |
| `src/components/ResourceState.jsx` | Wrapper loading / error / skeleton |
| `src/components/Chatbot.jsx` | Chatbot IA complet |
| `src/index.css` | Tous les styles CSS custom |

---

*Rapport généré automatiquement par analyse statique du code source le 18 mai 2026, mis à jour le 20 mai 2026.*

---

## Changelog des implémentations

### 2026-05-20 (soir) — Stripe + 2FA + i18n + pages statiques

| Fichier | Action | Détail |
|---------|--------|--------|
| `package.json` | ✅ Modifié | Ajout `@stripe/stripe-js 9.6`, `@stripe/react-stripe-js 6.4`, `i18next 23.16`, `react-i18next 14.1`, `qrcode.react 4.2`, `lucide-react`, `class-variance-authority`, `@radix-ui/react-slot`, `daisyui`, `tailwindcss v4` (via `@tailwindcss/vite`) |
| `src/pages/CheckoutPage.jsx` | ✅ Refondu | 604 lignes — stepper 4 étapes, `<Elements>` + `<PaymentElement>` Stripe avec thème dark, `stripe.confirmPayment()` |
| `src/api/checkoutApi.js` | ✅ Créé | `POST /api/checkout/payment-intent` |
| `src/pages/AccountPage.jsx` | ✅ Refondu | 1043 lignes — 6 onglets (Profile/Orders/Addresses/Payments/Security/Mail), CRUD complet, filtres commandes |
| `src/components/account/SecuritySettings.jsx` | ✅ Créé | Setup TOTP avec `qrcode.react` + 2FA email + toggle notifications login |
| `src/pages/CGUPage.jsx`, `LegalPage.jsx`, `AboutPage.jsx` | ✅ Créés | Pages statiques avec i18n |
| `src/i18n/index.js` + `src/i18n/locales/{fr,en,ar,he}/*.json` | ✅ Créés | 4 locales × 9 namespaces = 36 fichiers JSON |
| `src/components/ui/{button,dropdown-menu,sheet}.jsx` | ✅ Créés | Embryon shadcn/ui |
| `src/components/Navbar.jsx` | ✅ Refondu | Header refactorisé (commit `4c41c35`), navigation logique RTL-compatible |
| `src/pages/LoginPage.jsx` | ✅ Modifié | Gère `requires2fa.method` (`email` vs `totp`) et appelle `verify2fa` |
| `vite.config.js` | ✅ Modifié | Plugin `@tailwindcss/vite` (Tailwind v4 sans `tailwind.config.js`) |
| `src/content/siteText.js` | 🟡 Legacy | Coexiste avec i18n — à migrer complètement |

### 2026-05-19 — Google SSO + 2FA frontend (cf. audit backend)

Voir `CYNA-Web/AUDIT_BACK_CYNA.md` section "Changelog 2026-05-19".
