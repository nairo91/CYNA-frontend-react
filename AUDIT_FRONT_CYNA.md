# Audit Frontend — CYNA-IT

> **Date :** 18 mai 2026  
> **Projet :** CYNA-IT — plateforme e-commerce SaaS de cybersécurité  
> **Analysé par :** Claude Code (assistant senior L3)

---

## Résumé exécutif

| Indicateur | Valeur |
|---|---|
| **Avancement frontend estimé** | **~58 %** |
| **Framework** | React 18.3.1 |
| **Routeur** | React Router v6.28.1 |
| **Bundler** | Vite 5.4.1 |
| **Design system** | CSS custom (classes utilitaires maison) — aucune librairie externe |
| **Gestion d'état** | React Context API (AuthContext + CartContext) |
| **i18n** | Aucune librairie — texte centralisé en FR dans `siteText.js` ; chatbot bilingue FR/EN |
| **TypeScript** | ❌ Non (JSX uniquement) |
| **Tests** | ❌ Aucun (ni unitaires, ni E2E) |
| **App mobile** | ❌ Non commencée |

### Ce qui fonctionne bien

- Authentification complète (login, register, reset mot de passe, vérification email)
- Panier dual-mode invité (localStorage) + connecté (API) avec migration automatique
- Catalogue avec recherche, filtres et pagination
- Intégration API propre via un client `fetch` centralisé
- Composant `ResourceState` pour les états de chargement / erreur
- Chatbot IA intégré avec escalade vers support humain
- Routing protégé par rôle

### Ce qui manque le plus

- **Backoffice admin** (0 % — aucune page admin existante)
- **Pages statiques** CGU / Mentions légales / À propos (0 %)
- **i18n réelle** avec support RTL (0 %)
- **Application mobile** Android / iOS (0 %)
- Plusieurs pages nécessitent une complétion (fiche produit, historique, compte)

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
**Statut : 🟡 Partiel (55 %)**

| Élément | État | Détail |
|---|---|---|
| Sélection adresse de facturation | ✅ Fait | Radio buttons + formulaire nouvelle adresse |
| Création nouvelle adresse | ✅ Fait | Inline dans le checkout |
| Affichage méthodes de paiement | ✅ Fait | Radio buttons |
| Récapitulatif + total | ✅ Fait | Aside avec les lignes |
| Création commande API | ✅ Fait | `createOrder()` + redirect |
| **Tunnel en 4 étapes distinctes** | ❌ Manquant | Tout est sur une seule page — pas d'étapes (stepper) |
| **Étape connexion / inscription / invité** | ❌ Manquant | Le redirect login est géré depuis le panier mais pas dans le tunnel |
| **Formulaire de paiement saisi** | ❌ Manquant | Les méthodes s'affichent mais aucune intégration Stripe / autre |
| Paiement obligatoire avant commande | ❌ Manquant | La commande passe même sans méthode de paiement |

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
**Statut : 🟡 Partiel (60 %)**

| Élément | État | Détail |
|---|---|---|
| Affichage infos perso | ✅ Fait | Prénom, nom, email, rôles, vérification |
| **Modification infos perso** | ❌ Manquant | Lecture seule — pas de formulaire d'édition |
| Carnet d'adresses — Créer | ✅ Fait | |
| Carnet d'adresses — **Modifier** | ❌ Manquant | Seule la suppression est disponible |
| Carnet d'adresses — Supprimer | ✅ Fait | |
| Méthodes de paiement CRUD | ✅ Fait | Création (mock) + suppression |
| Liste des commandes | ✅ Fait | Avec lien vers détail |
| **Gestion abonnements** (renouvellement / résiliation) | ❌ Manquant | Onglet absent |
| Déconnexion | ✅ Fait | |

---

#### Historique commandes (dans `/espace-client`, onglet Commandes)
**Statut : 🟡 Partiel (40 %)**

| Élément | État | Détail |
|---|---|---|
| Liste des commandes | ✅ Fait | Triées par date desc depuis l'API |
| Lien vers le détail | ✅ Fait | |
| **Regroupement par année** | ❌ Manquant | Liste plate |
| **Filtres année / type** | ❌ Manquant | Aucun filtre |
| **Barre de recherche** | ❌ Manquant | Absente |
| **Télécharger facture PDF** | ❌ Manquant | Absent |

---

#### Contact `/contact`
**Statut : ✅ Fait (90 %)**

Formulaire email/sujet/message + chatbot IA intégré avec escalade vers support humain. Complet pour les besoins du cahier des charges.

---

#### Backoffice admin
**Statut : ❌ Manquant (0 %)**

Aucune page ou composant admin n'existe dans le projet. Tout est à construire :

- Tableau produits triable + sélection multiple
- Formulaires CRUD produits (créer, modifier, supprimer)
- Dashboard avec histogramme ventes 7 j / 5 semaines
- Histogramme multi-couches paniers moyens par catégorie
- Camembert ventes par catégorie

---

#### Pages statiques
**Statut : ❌ Manquant (0 %)**

| Page | État |
|---|---|
| CGU | ❌ Manquante |
| Mentions légales | ❌ Manquante |
| À propos | ❌ Manquante |

Les liens du footer et du menu burger pointent vers des ancres `#footer-legal` et `#footer-about` qui n'existent pas.

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
| **Mobile-first responsive** | 🟡 Partiel | CSS custom avec nav burger, mais pas de breakpoints formels ni de tests vérifiés |
| **Design system cohérent** | 🟡 Partiel | Classes CSS maison cohérentes (`button-primary`, `panel`, `section-title`…), mais pas de design system documenté ni de tokens de design |
| **i18n multilingue** | ❌ Manquant | Texte FR uniquement dans `siteText.js`. Chatbot a FR/EN. Pas de `i18next` ni équivalent |
| **Support RTL** (arabe, hébreu) | ❌ Manquant | Zéro prise en charge RTL |
| **Bouton changement de langue** | ❌ Manquant | Absent |
| **Accessibilité clavier** | 🟡 Partiel | `aria-label` sur Navbar et recherche. Reste du site non audité |
| **Contrastes suffisants** | 🟡 Partiel | Non vérifié formellement (pas d'audit WCAG) |
| **États de chargement** | ✅ Fait | Composant `ResourceState` utilisé sur toutes les pages catalogue |
| **Gestion des erreurs** | ✅ Fait | Messages d'erreur sur chaque formulaire et page |
| **Protection XSS** | 🟡 Partiel | Pas de `dangerouslySetInnerHTML`, mais pas de librairie de sanitisation dédiée |
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

Voici les tâches dans l'ordre du plus bloquant au moins urgent, avec une explication simple pour chaque point.

---

### 1. 🔴 Pages statiques : CGU, Mentions légales, À propos
**Pourquoi en premier ?** Sans ces pages, tous les liens du menu burger et du footer sont cassés. C'est aussi une obligation légale.  
**Comment ?** Créer 3 fichiers simples (ex. `CGUPage.jsx`, `LegalPage.jsx`, `AboutPage.jsx`) avec du texte statique, les ajouter dans le routeur, et mettre à jour les `href` dans `siteText.js`.  
**Difficulté :** Facile — 2 à 3 heures.

---

### 2. 🔴 Footer complet + Menu burger différencié
**Pourquoi ?** Le footer affiche des ancres cassées. Le burger n'a pas les bons liens selon si l'utilisateur est connecté ou non (selon le cahier des charges).  
**Comment ?** Mettre à jour `Footer.jsx` (liens vers les vraies pages + icônes réseaux sociaux). Dans `Navbar.jsx`, ajouter une liste de liens "connecté" (Paramètres → `/espace-client`, Mes commandes, CGU, Contact, Déconnexion) et une liste "invité" (Connexion, Inscription, CGU, Contact). La logique `isAuthenticated` est déjà là.  
**Difficulté :** Facile — 3 à 4 heures.

---

### 3. 🔴 Backoffice — CRUD produits
**Pourquoi ?** Sans interface admin, impossible de gérer le catalogue sans toucher directement à la base de données. C'est bloquant pour l'utilisation réelle de la plateforme.  
**Comment ?**  
  1. Créer une route `/admin` protégée par rôle `ROLE_ADMIN`  
  2. Tableau de produits avec `<table>` triable et cases à cocher  
  3. Formulaire CRUD (créer / modifier / supprimer) en utilisant les endpoints existants de l'API  
  4. Ajouter les fonctions API `createService()`, `updateService()`, `deleteService()` dans `catalogApi.js`  
**Difficulté :** Difficile — 1 à 2 semaines.

---

### 4. 🔴 Backoffice — Dashboard avec graphiques
**Pourquoi ?** Requis par le cahier des charges pour le pilotage business.  
**Comment ?** Installer une librairie de graphiques simple (recommandé : **Recharts** — facile à prendre en main en React). Créer un onglet ou une section Dashboard dans le backoffice avec : histogramme ventes 7 j, histogramme multi-couches paniers par catégorie, camembert répartition par catégorie. Les données viennent d'une API `/api/stats` à créer côté backend.  
**Difficulté :** Difficile — 1 semaine.

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

### 7. 🟠 Checkout : tunnel en 4 étapes (stepper)
**Pourquoi ?** Le cahier des charges demande explicitement 4 étapes : connexion → adresse → paiement → confirmation. Le checkout actuel est une seule page.  
**Comment ?** Ajouter un état local `step` (1 à 4) dans `CheckoutPage.jsx` et afficher un composant par étape. Ajouter un composant visuel `Stepper` (simple liste avec `is-active`). La logique API existante reste la même, il faut juste réorganiser l'UI.  
**Difficulté :** Moyen — 1 journée.

---

### 8. 🟠 Compte utilisateur : édition profil, update adresse, gestion abonnements
**Pourquoi ?** L'espace client est en lecture seule pour le profil — l'utilisateur ne peut pas modifier son prénom, son nom ou son mot de passe. L'adresse ne peut pas être modifiée (seulement supprimée).  
**Comment ?**  
  - Profil : ajouter une section "Modifier" avec formulaire + appel `PATCH /api/me`  
  - Adresses : ajouter un bouton "Modifier" qui pré-remplit le formulaire existant + appel `updateAddress()`  
  - Abonnements : si le backend expose `/api/subscriptions`, ajouter un onglet avec renouvellement / résiliation  
**Difficulté :** Moyen — 1 à 2 jours.

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

### 13. 🟡 i18n multilingue avec support RTL
**Pourquoi ?** Exigence non-fonctionnelle du cahier des charges. Permet d'ajouter l'arabe et l'hébreu.  
**Comment ?**  
  1. Installer **i18next** + **react-i18next** (`npm install i18next react-i18next`)  
  2. Déplacer le contenu de `siteText.js` dans des fichiers JSON par langue (`fr.json`, `en.json`, `ar.json`)  
  3. Ajouter `dir="rtl"` sur `<html>` selon la langue active  
  4. Ajouter un bouton de sélection de langue dans le menu  
> **Note :** Cette tâche est transversale à toute l'application. La faire avant d'ajouter de nouvelles pages évite de devoir tout retranscrire après. C'est un investissement de 2 à 3 jours mais qui simplifie la suite.  
**Difficulté :** Difficile — 2 à 3 jours.

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

*Rapport généré automatiquement par analyse statique du code source le 18 mai 2026.*
