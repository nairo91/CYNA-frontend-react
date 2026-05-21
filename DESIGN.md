# Cyna Design System — Rulebook

> **Companion to `CLAUDE.md`.** This file is the single source of truth for the design system of the Cyna front-office SPA. Every system-level decision (token, variant, pattern) is written here **before or as part of** its implementation — never after. If code and this file disagree, the code is wrong.
>
> **Status:** `v0.1 — scaffold`. Tokens and patterns flagged `[TBD]` are starter values to validate during Sprint 1. Do not freeze the system until the audit pass and the Header / Footer redesign are merged.

---

## 0. Tooling state

| Item | Value | Source |
|---|---|---|
| React | `18.3.1` | `package.json` |
| Vite | `5.4.1` | `package.json` |
| Router | `react-router-dom 6.28.1` | `package.json` |
| Tailwind | `4.3.0` (via `@tailwindcss/vite`) | `package.json` |
| DaisyUI | `5.5.20` (themes: `light`, `dark`, `valentine`) | `src/index.css` |
| Stripe | `@stripe/react-stripe-js 6.4.0` | `package.json` |
| Icon library | none installed yet — **target: `lucide-react`** `[TBD]` | — |
| TypeScript | **not used** — JSX only | `package.json` |
| shadcn/ui | **not installed** — see § A. Tooling decision below | — |
| Tests | none (no Vitest, no Playwright) | `package.json` |
| **Node.js** | **≥ 20.19 or ≥ 22.12 required** by Vite 5.4 (uses `node:util` `styleText` API) | error log 2026-05-19 |
| Aliases | none configured in `vite.config.js` — **target: `@/*` → `src/*`** `[TBD]` | `vite.config.js` |
| `prefers-color-scheme` | DaisyUI's `--prefersdark` maps to `dark` theme | `src/index.css` |

### § A. Tooling decision — shadcn vs DaisyUI (Sprint 1 gate)

The operating manual specifies **shadcn/ui** as the default component source. The codebase currently uses **DaisyUI 5** on top of Tailwind 4. The two systems do not compose well:
- DaisyUI delivers fully-styled components via CSS classes (`btn`, `card`, `input`).
- shadcn delivers unstyled, copy-paste React components built on Radix primitives, controlled by Tailwind utilities + CSS variables.

**Proposed resolution (to validate with the user before Sprint 1):**
1. **Add shadcn/ui as the new primitive layer**, configured against the existing Tailwind 4 setup.
2. **Keep DaisyUI installed only for the transition** — used by legacy pages we don't touch this sprint.
3. **Strip DaisyUI page by page** as each page is refactored. By end of Sprint 4, DaisyUI is removed.
4. Install `lucide-react` as the single icon library.
5. Add `@/*` alias in `vite.config.js` + `jsconfig.json` to match shadcn conventions.

> **Action item:** confirm this approach with the user during the kick-off.

---

## 1. Aesthetic direction & brand voice

### Conceptual direction: **"Confident technical"**

Cyna is a B2B cybersecurity vendor. The interface must feel like infrastructure for serious people who buy serious things — closer to **Stripe, Linear, Cloudflare Zero Trust, Snyk, Tailscale** than to a generic SaaS template.

**Pillars.**
- **Sober.** No purple gradients, no rainbow CTAs, no glassmorphism by default. Dark, neutral surfaces. Color used as signal, not decoration.
- **Technical.** Tabular numerals on prices, dates, identifiers. Mono font for IDs and SHA-like data. Precise grids. Honest, generous whitespace.
- **Trustworthy.** Security signals (PCI-DSS, ISO 27001, encryption, SLAs) appear at decision points — pricing, checkout, account creation — never as decorative badges in the hero.
- **Restrained motion.** Every animation has a purpose. Scale-on-press, stagger reveals, interruptible transitions. No looping ambient motion in product surfaces.

### What we explicitly reject

- Three-feature-card hero, centered, with emoji icons.
- Purple → pink gradients on CTAs.
- Inter Light for everything.
- Glassmorphism overlays on top of marketing photography.
- "Magic UI" animated grids in section backgrounds.
- Emoji in UI strings.
- More than two typefaces.

### Brand voice (microcopy)

- **French primary.** Direct, technical, declarative. "Démarrer un essai", not "C'est parti pour 30 jours d'essai gratuit !".
- **English secondary.** Same register. "Start free trial", not "Get started in seconds!".
- **No exclamation marks** outside genuine confirmation states ("Commande confirmée").
- **No "we"-marketing.** Use the imperative ("Protégez votre infrastructure") or the product as subject ("Cyna SOC détecte…"). Avoid "Nous vous accompagnons" filler.

---

## 2. Color tokens (primitive → semantic → component)

> **Layered token model.** Primitives are raw colors. Semantics describe role (`surface`, `text`, `border`, `accent`). Components reference semantics. **Never use a primitive token directly in a component — always go through a semantic name.**

### 2.1 Primitives `[TBD — validate at Sprint 1]`

| Token | Value | Notes |
|---|---|---|
| `--cyna-navy-50` | `#EEF0FB` | lightest |
| `--cyna-navy-100` | `#D6DAF3` | |
| `--cyna-navy-200` | `#A5ADE3` | |
| `--cyna-navy-300` | `#7480D0` | |
| `--cyna-navy-400` | `#4E5BBE` | |
| `--cyna-navy-500` | `#3540A8` | |
| `--cyna-navy-600` | `#28318A` | |
| `--cyna-navy-700` | `#1E2470` | |
| `--cyna-navy-800` | `#1A1F5C` | |
| `--cyna-navy-900` | `#1E1B4B` | brand anchor |
| `--cyna-navy-950` | `#0B0B23` | darkest surface |
| `--cyna-cyan-300` | `#67E8F9` | neon accent light |
| `--cyna-cyan-400` | `#22D3EE` | neon accent default |
| `--cyna-cyan-500` | `#06B6D4` | neon accent strong |
| `--cyna-zinc-50` → `--cyna-zinc-950` | Tailwind zinc family | neutrals |
| `--cyna-emerald-500` | `#10B981` | success / trust |
| `--cyna-amber-500` | `#F59E0B` | warning |
| `--cyna-rose-500` | `#F43F5E` | error / destructive |

### 2.2 Semantic tokens (the layer components use)

| Semantic token | Light mode | Dark mode |
|---|---|---|
| `--bg-canvas` | `--cyna-zinc-50` | `--cyna-navy-950` |
| `--bg-surface` | `#FFFFFF` | `--cyna-navy-900` |
| `--bg-surface-elevated` | `#FFFFFF` (with shadow) | `--cyna-navy-800` |
| `--bg-overlay` | `rgba(11,11,35,0.45)` | `rgba(11,11,35,0.65)` |
| `--text-primary` | `--cyna-navy-950` | `--cyna-zinc-50` |
| `--text-secondary` | `--cyna-zinc-700` | `--cyna-zinc-300` |
| `--text-muted` | `--cyna-zinc-500` | `--cyna-zinc-400` |
| `--text-inverse` | `--cyna-zinc-50` | `--cyna-navy-950` |
| `--border-default` | `--cyna-zinc-200` | `--cyna-navy-700` |
| `--border-strong` | `--cyna-zinc-300` | `--cyna-navy-600` |
| `--border-focus` | `--cyna-cyan-400` | `--cyna-cyan-300` |
| `--accent-default` | `--cyna-cyan-500` | `--cyna-cyan-400` |
| `--accent-hover` | `--cyna-cyan-400` | `--cyna-cyan-300` |
| `--accent-foreground` | `#FFFFFF` | `--cyna-navy-950` |
| `--state-success` | `--cyna-emerald-500` | `--cyna-emerald-500` |
| `--state-warning` | `--cyna-amber-500` | `--cyna-amber-500` |
| `--state-danger` | `--cyna-rose-500` | `--cyna-rose-500` |

### 2.3 Contrast budget (WCAG 2.1 AA — non-negotiable)

- Body text on `--bg-canvas`: ≥ 4.5:1
- Body text on `--bg-surface`: ≥ 4.5:1
- Disabled / placeholder text: ≥ 3:1
- Non-text UI (icons, borders of focused controls, dividers carrying meaning): ≥ 3:1
- Focus ring vs adjacent surface: ≥ 3:1

Every token combination above must be checked with an automated tool (axe DevTools or Polypane contrast checker) **before being added to a component**.

### 2.4 What semantic tokens replace

| Forbidden | Use instead |
|---|---|
| Hard-coded `#1E1B4B` in JSX | `var(--bg-surface)` on dark theme |
| `bg-indigo-900` (Tailwind primitive) | `bg-[var(--bg-surface)]` or a Tailwind theme extension `bg-surface` |
| `text-gray-500` | `text-muted` (mapped to `--text-muted`) |

---

## 3. Typography scale & pairing

### 3.1 Typefaces `[TBD — validate at Sprint 1]`

- **Display + body:** `Geist Sans` (variable). Fallback: `Inter`, then `system-ui`. Rationale: precise, technical, designed by Vercel — neutral but distinctive. Free and self-hostable.
- **Mono:** `Geist Mono`. Used for prices, dates, IDs, code snippets in the chatbot, and any cell where alignment of digits matters.
- **No third typeface.** Marketing flourishes use weight + size variation on the same family.

### 3.2 Scale (modular, base 16 px, ratio ~1.2)

| Token | Size | Line height | Weight default | Usage |
|---|---|---|---|---|
| `text-display-2xl` | 64 / 4rem | 1.05 | 600 | Hero landing only |
| `text-display-xl` | 48 / 3rem | 1.1 | 600 | Page H1 on large screens |
| `text-display-lg` | 36 / 2.25rem | 1.15 | 600 | Page H1 default |
| `text-h2` | 28 / 1.75rem | 1.2 | 600 | Section heading |
| `text-h3` | 22 / 1.375rem | 1.3 | 600 | Sub-section heading |
| `text-h4` | 18 / 1.125rem | 1.35 | 600 | Card title |
| `text-body-lg` | 18 / 1.125rem | 1.55 | 400 | Hero subtitle / pull quote |
| `text-body` | 16 / 1rem | 1.55 | 400 | Default body |
| `text-body-sm` | 14 / 0.875rem | 1.5 | 400 | Secondary body, helper text |
| `text-caption` | 12 / 0.75rem | 1.4 | 500 | Labels, badges |
| `text-eyebrow` | 12 / 0.75rem | 1 | 600 | Above-title eyebrows (uppercase, +0.08em tracking) |

### 3.3 Rules

- **Body line length:** 60–75 characters max — use `max-w-prose` or `max-inline-size: 65ch`.
- **Tabular nums** (`font-variant-numeric: tabular-nums`) **mandatory** on: prices, totals, quantities in cart, dates in order history, durations, IDs.
- **No font weight below 400** in production UI. Display can go to 600 / 700 but never 800 / 900.
- **Heading hierarchy** is semantic (`<h1>` once per page, then `<h2>`, `<h3>` in order). Visual scale and semantic level are decoupled via classes.

---

## 4. Spacing, radii, elevation

### 4.1 Spacing scale (Tailwind 4 base unit = 0.25 rem = 4 px)

Use Tailwind's default scale (`1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32`). Do not introduce custom spacing tokens unless an entire pattern needs one.

**Logical properties only:** `pl-*` → `ps-*`, `pr-*` → `pe-*`, `ml-*` → `ms-*`, `mr-*` → `me-*`. Tailwind 4 supports these natively.

### 4.2 Radii (concentric)

| Token | Value | Where |
|---|---|---|
| `--radius-sm` | `6px` | inner controls (checkbox, small chip) |
| `--radius-md` | `10px` | inputs, buttons (default) |
| `--radius-lg` | `14px` | cards, dropdowns |
| `--radius-xl` | `18px` | modals, sheets |
| `--radius-2xl` | `24px` | hero panels |
| `--radius-full` | `9999px` | pills, avatars |

**Concentric rule:** when nesting, **child radius = parent radius − padding**. Example: a card with `--radius-lg` (14) and `p-3` (12) holds a child with `--radius-sm` or below. This is enforced visually in every review.

### 4.3 Elevation (shadows — layered, not stacked)

| Token | Value (light) | Value (dark) | Use |
|---|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(11,11,35,0.06)` | `0 1px 2px rgba(0,0,0,0.4)` | resting card |
| `--shadow-md` | `0 4px 6px -2px rgba(11,11,35,0.08), 0 2px 4px -2px rgba(11,11,35,0.05)` | inverted | dropdown, popover |
| `--shadow-lg` | `0 12px 24px -6px rgba(11,11,35,0.12), 0 4px 8px -4px rgba(11,11,35,0.08)` | inverted | modal, sheet |
| `--shadow-focus` | `0 0 0 3px var(--border-focus, 60%)` | same | focus ring |

**No `box-shadow` outside these tokens.** No neon glow on hover by default — only on focused or active CTAs, and only on the accent color.

---

## 5. Motion grammar

### 5.1 Durations

| Token | Value | Use |
|---|---|---|
| `--motion-instant` | `0ms` | reduced motion override |
| `--motion-fast` | `120ms` | hover, pressed, color change |
| `--motion-base` | `200ms` | reveal, fade, layout micro |
| `--motion-slow` | `300ms` | state changes (open/close, expand) |
| `--motion-page` | `400ms` | page transitions (route change) |

**Hard ceiling:** state changes ≤ 300 ms. Anything longer feels broken on a fast laptop. Page transitions ≤ 400 ms.

### 5.2 Easings

- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)` — Material standard. Use for everything unless a specific reason.
- **Enter:** `cubic-bezier(0.0, 0, 0.2, 1)` — fast start, gentle finish. Use for opening modals, dropdowns.
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)` — gentle start, fast finish. Use for dismissing.

### 5.3 Patterns

- **Scale-on-press:** every primary button and clickable card uses `active:scale-[0.96]` with `transition-transform duration-120 ease-out`. Exact value `0.96`, never `0.95` or `0.97`.
- **Stagger reveal:** lists of items entering use a 30 ms stagger, max 8 items animated (skip the rest).
- **Interruptible:** all transitions are interruptible. If user hovers in then out before the transition ends, the hover-out starts from current state, not from the end state.
- **`prefers-reduced-motion: reduce`** → all motion tokens collapse to `--motion-instant`. Transitions remain (for state correctness) but durations are 0.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Component conventions

> **Default source: shadcn/ui** once installed (see § A). Until then, document the agreed shape so the migration is mechanical.

### 6.1 Button

- **Sizes:** `sm` (h-9, text-sm), `md` (h-10, text-sm) **default**, `lg` (h-11, text-base).
- **Hit area:** minimum 40×40 px **including padding**, regardless of visible size.
- **Variants:** `primary` (accent bg, inverse fg), `secondary` (surface bg, primary fg, border), `outline` (transparent bg, border-strong, primary fg), `ghost` (transparent bg, no border, hover surface), `destructive` (danger bg, white fg).
- **States:** rest, hover, focus-visible, active, disabled, loading. Loading replaces label with spinner — keeps width via `min-w`.
- **Focus ring:** `--shadow-focus`, always visible on keyboard focus, never removed.
- **Scale-on-press:** mandatory.

### 6.2 Input / textarea

- **Height:** `h-10` for input, min `h-24` for textarea.
- **Padding:** `px-3 py-2`.
- **Border:** `--border-default` rest, `--border-strong` hover, `--border-focus` focus + `--shadow-focus` ring.
- **Label:** always present (`<label htmlFor>`), positioned above. No floating labels by default.
- **Helper / error text:** below input, `text-body-sm`, `--text-muted` (helper) or `--state-danger` (error).
- **Required:** asterisk in label color `--state-danger`, plus `aria-required="true"`.
- **Group composition:** shadcn `FieldGroup` / `Field` / `InputGroup` once installed.

### 6.3 Card

- **Padding:** `p-4` (mobile) → `p-6` (≥ md).
- **Radius:** `--radius-lg`.
- **Border:** `--border-default`, `1px`.
- **Background:** `--bg-surface`.
- **Shadow:** `--shadow-sm` rest, `--shadow-md` on hover **only if interactive**.
- **Interactive cards** (entire card is a link) get `cursor-pointer`, focus ring on the wrapping `<a>`, and scale-on-press.

### 6.4 Modal / Dialog / Sheet

- **Built on:** shadcn `Dialog` (Radix). On mobile (< 640 px), Dialog → Sheet (bottom).
- **Backdrop:** `--bg-overlay`, fade in 200 ms.
- **Content:** scale-in from `0.96` to `1`, 200 ms, ease-enter.
- **Close:** ESC, click backdrop, X button (top-right, ≥ 40×40 px hit area).
- **Focus trap** mandatory. Return focus to trigger on close.

### 6.5 Table

- Use shadcn `Table`. Tabular nums for all numeric cells. Sticky header on long tables. Row hover background `--bg-surface-elevated`. Selection via checkbox in leading column, ≥ 40×40 hit area.

### 6.6 Navigation (header)

- **Desktop:** horizontal nav, logo on `inline-start`, primary links centered or `inline-start`, account + cart on `inline-end`.
- **Mobile (< 768 px):** logo + search trigger + cart + burger trigger. Drawer opens as sheet from `inline-end` (or `inline-start` in RTL — Radix handles this when configured with logical directions).
- **Sticky:** yes, with `backdrop-blur` and reduced height on scroll.

### 6.7 Toast / Notification

- **Position:** top-`inline-end` on desktop, bottom-center on mobile.
- **Duration:** 4 s default, 7 s for errors, dismissible.
- **Auto-stack** max 3, then collapse to "+N notifications".

---

## 7. Accessibility floor (WCAG 2.1 AA)

Mandatory minimums on every screen we ship:

- **Color contrast** per § 2.3. Verified with axe DevTools before merge.
- **Keyboard:** all interactive elements reachable in logical Tab order. ESC closes overlays. Arrow keys navigate menus, listboxes, radio groups.
- **Focus:** **always visible**, `--shadow-focus` ring. `outline: none` is forbidden unless replaced.
- **Hit area:** ≥ 40×40 px for every interactive element. Icon-only buttons get `aria-label`.
- **Forms:** every input has `<label htmlFor>` or `aria-labelledby`. Errors linked via `aria-describedby`. `aria-invalid` on errored inputs.
- **Images:** meaningful images get descriptive `alt`. Decorative images get `alt=""`. Never `alt="image"`.
- **Headings:** semantic order, no skipping levels for visual size — use classes for that.
- **Live regions:** toasts and async errors use `aria-live="polite"` (or `"assertive"` for blocking errors only).
- **Reduced motion:** § 5.3 rule enforced globally.
- **i18n + RTL:** logical CSS properties only. `<html lang="…" dir="…">` set on locale change. Icons that imply direction (arrows, chevrons) are flipped in RTL via `[dir="rtl"] .icon-rotate-rtl { transform: scaleX(-1); }`.

**Tool of record:** `axe DevTools` Chrome extension. Run on every page touched by a PR.

---

## 8. Page-level patterns

> **Each entry must list:** purpose, primary user goal, key components, mobile layout, desktop layout, empty / loading / error states, accessibility notes. Entries below are scaffolded for the redesign — fill in as each page is shipped.

### 8.1 Home `/` `[TBD — Sprint 2]`
**Purpose.** Convert visitors → trial / contact / catalogue exploration.
**User goal.** Understand what Cyna is in < 10 s; pick a path (catalogue, demo, contact).
**Key components.** Hero, social proof / logo strip, three-tier value prop (SOC / EDR / XDR), feature carousel, pricing teaser, testimonial, trust signals, CTA panel, Footer.
**Mobile.** Single column, hero ≤ 100 vh, vertical scroll only.
**Desktop.** Hero full-width with right-side product mockup, sections at max 1240 px, asymmetric grids preferred over centered.
**States.** Carousel slides loaded from `/api/carousel_slides` — show skeleton while loading; if empty, fall back to a static editorial slide.
**A11y.** Carousel pauses on focus/hover, has pause control, keyboard-navigable.

### 8.2 Catalogue `/categories` & `/products` `[TBD — Sprint 2]`
**Purpose.** Help the visitor narrow to the right product.
**User goal.** See what's available, filter, find one to evaluate.
**Key components.** Filters sidebar (collapses to sheet on mobile), product grid, sort dropdown, pagination, empty state.
**Mobile.** Filters as bottom-sheet trigger. Grid 1 → 2 columns at 480 px.
**Desktop.** Filters in `inline-start` sidebar (sticky). Grid 3 → 4 cols at ≥ 1280 px.
**States.** Loading: skeleton cards. Empty (after filter): editorial empty state with "reset filters" CTA. Error: retry CTA.
**A11y.** Filter changes announced via live region. Sort dropdown is a real `<select>` or shadcn `Select` with proper ARIA.

### 8.3 Product `/products/:id` `[TBD — Sprint 2]`
**Purpose.** Convince the visitor to add the service to cart.
**User goal.** Understand what they get, at what price, how to start.
**Key components.** Image carousel, title block, price + duration selector, primary CTA (dynamic: "S'abonner" / "Essayer" / "Indisponible"), tech specs accordion, similar products (6, randomized within category), security badges.
**Mobile.** Image carousel above the fold, sticky bottom CTA bar with price + add-to-cart.
**Desktop.** Two-column: media on `inline-start`, info on `inline-end`. Sticky CTA card on scroll.
**States.** Out-of-stock disables CTA, shows alternative similar products prominently.
**A11y.** Carousel arrows + dots, swipe + keyboard. CTA disabled state announced.

### 8.4 Cart `/panier` `[TBD — Sprint 3]`
**Purpose.** Let the user review and adjust before checkout.
**User goal.** Confirm what they're buying, change quantity / duration, proceed.
**Key components.** Line items (image, name, duration `<select>`, quantity stepper, line total, remove), totals card (subtotal, VAT, total), promo code input, primary CTA "Passer à la caisse".
**Mobile.** Stacked lines, totals card pinned at bottom.
**Desktop.** Two-column: items on `inline-start`, totals card sticky on `inline-end`.
**States.** Empty cart with editorial CTA. Unavailable item shows inline warning + "remove" suggestion.
**A11y.** Quantity stepper has `<input type="number">` fallback; +/- buttons have `aria-label`.

### 8.5 Checkout `/checkout` `[TBD — Sprint 3]`
**Purpose.** Convert cart → paid order with minimum friction.
**User goal.** Complete payment in ≤ 4 deliberate steps.
**Key components.** Stepper (4 steps: Identité → Adresse → Paiement → Confirmation), step forms, sticky order summary, Stripe Elements (in step 3 only), trust signals (PCI-DSS, SSL).
**Mobile.** Stepper as horizontal dots with active step label. Summary collapses to expandable accordion.
**Desktop.** Stepper at top full-width. Form on `inline-start` 60 %, summary on `inline-end` 40 % sticky.
**States.** Each step independently validates. Network error on Stripe → inline error, keep form state. Success → step 4 confirmation + email.
**A11y.** Stepper is a `<ol>` with `aria-current="step"`. Each step heading is `<h2>`. Stripe Elements have proper `aria-label` set via Stripe options.

### 8.6 Auth (login / register / forgot / reset / verify) `[TBD — Sprint 3]`
**Purpose.** Get the user authenticated or verified.
**User goal.** Minimum-effort access.
**Key components.** Centered card (max 440 px), title, form, primary CTA, secondary links (forgot pw, alt route), social proof / trust line.
**Mobile.** Card edge-to-edge with `--radius-xl`.
**Desktop.** Centered card on `--bg-canvas`, decorative side panel optional.
**States.** Password strength meter on register. Email-taken inline. Account locked after N failures.
**A11y.** Password visibility toggle keyboard-accessible. Caps-lock warning. Honor browser autofill.

### 8.7 Account area `/espace-client` `[TBD — Sprint 4]`
**Purpose.** Self-service for clients (orders, subscriptions, billing, profile).
**User goal.** Find any past interaction or change a setting.
**Key components.** Sidebar nav (collapses on mobile) with Profile / Addresses / Payment methods / Subscriptions / Orders. Each tab is its own page.
**Mobile.** Sidebar becomes a top tab strip or a sheet trigger.
**Desktop.** Persistent sidebar `inline-start`, content on `inline-end`.
**States.** Empty state per tab (e.g., "Aucune commande pour le moment"). Loading: per-tab skeleton.
**A11y.** Sidebar nav uses `<nav>` with `aria-label`. Active tab marked with `aria-current="page"`.

### 8.8 Search `[TBD — Sprint 2]`
**Purpose.** Bring the user directly to a product.
**User goal.** Type 3 characters → see results in < 100 ms perceived.
**Key components.** Search input (sticky in header), result list, filters dropdown, empty state with suggested categories.
**Mobile.** Search opens as full-screen sheet from header trigger.
**Desktop.** Inline dropdown under header search, or dedicated `/products?q=` page for filtered results.
**States.** Debounced 200 ms. While typing → cached results visible. Network slow → skeleton. No match → suggestions.
**A11y.** Combobox pattern (`role="combobox"`, `aria-expanded`, arrow keys navigate). Results have `aria-live`.

### 8.9 Contact `/contact` (form + chatbot) `[TBD — Sprint 4]`
**Purpose.** Capture leads + provide instant support.
**User goal.** Get an answer or send a message.
**Key components.** Two-column on desktop: form on `inline-start`, chatbot panel on `inline-end`. Single column on mobile, form first, chatbot as fixed FAB.
**States.** Form success → in-place confirmation, not a redirect. Chatbot offline → fallback to form.
**A11y.** Chatbot is a labelled landmark. Messages have proper roles. Escalation to human is a clear button, not a link.

### 8.10 Legal (CGU, Mentions légales, À propos) `[TBD — Sprint 1]`
**Purpose.** Compliance + transparency.
**Key components.** Long-form text, table of contents on `inline-start` (desktop), last-updated date.
**A11y.** Real `<h2>` / `<h3>` hierarchy. ToC links use `<a href="#anchor">`. Skip-to-content link at top of `<main>`.

---

## 9. Anti-patterns (things we don't do)

- **No purple-pink gradient CTAs.** Solid accent or outlined.
- **No centered three-card hero** as a default solution.
- **No emoji in UI.** Lucide icons only.
- **No icon-only buttons without `aria-label`.**
- **No glassmorphism over photography.** Subtle blur on header is fine.
- **No `box-shadow` outside the elevation tokens.** No neon glow on every CTA — accent shadow is reserved for primary, focused.
- **No `position: fixed` footer.** Footer is in flow.
- **No `<div onClick>`** for interactive elements. `<button>` or `<a>` always.
- **No directional CSS** (`left`, `right`, `margin-left`, `padding-right`, `text-align: left`). Logical only.
- **No raw hex codes** in JSX or CSS outside `DESIGN.md`.
- **No third typeface.** Two families max.
- **No animation > 300 ms** for state changes, > 400 ms for page transitions.
- **No loading spinners > 1 s without a skeleton fallback.**
- **No empty state without a CTA.** Always offer a next step.
- **No success modal that auto-closes.** Manual dismissal only.
- **No autoplay carousel without a pause control.**
- **No `localStorage` for anything more sensitive than cart IDs and UI preferences.**

---

## Change log

| Date | Section | Change | Why |
|---|---|---|---|
| 2026-05-19 | All | Initial scaffold | First-run setup per `CLAUDE.md` § 9 |
| 2026-05-19 | § A | **shadcn/ui locked as target system**, DaisyUI deprecated in-place (transition mode, removed page-by-page through Sprint 4) | User validation |
| 2026-05-19 | § 1 | **"Confident technical" aesthetic locked** (navy `#1E1B4B` + cyan `#22D3EE`, Geist Sans/Mono, sober) | User validation |
| 2026-05-19 | § 0 | i18n + RTL scheduled for **Sprint 2.5** (between Catalogue and Auth/Checkout) to avoid re-touching new pages | User validation |
| 2026-05-19 | Sprint plan | Sprint 1 priority: tuyauterie shadcn → tokens → 3 pages statiques → Footer → Header → a11y pass | User validation |
| 2026-05-19 | § 1.1 setup | shadcn primitives `button`, `sheet`, `dropdown-menu` installed in `src/components/ui/` — ready for Sprint 2 (Auth / Product / Checkout) | Sprint 1 |
| 2026-05-19 | § 3 typography | **Inter + JetBrains Mono** (Google Fonts) selected as v0.1 fonts. Geist not available on Google Fonts; self-host upgrade deferred. Loaded via `<link>` in `index.html` with `preconnect` | Sprint 1 |
| 2026-05-19 | § 2 colors | Light/dark mode tokens implemented in OKLCH, with cyan primary `oklch(0.65 0.16 215)` (light) / `oklch(0.7 0.17 215)` (dark) over navy surfaces | Sprint 1 |
| 2026-05-19 | § 0 tooling | `<html class="dark">` activated to force dark mode shadcn tokens (Cyna identity). DaisyUI `data-theme="dark"` kept in parallel for legacy CSS during transition | Sprint 1 |
| 2026-05-19 | § 6.6 header | Navbar built with **manual primitives** (not shadcn `NavigationMenu`/`Sheet`) for Sprint 1 reliability — swap to shadcn deferred to a Sprint 2.5 refactor pass | Sprint 1 — pragmatic |
| 2026-05-19 | § 5 motion | Mobile sheet entry uses `animate-in slide-in-from-right duration-300 ease-out` (via `tw-animate-css`). **Exit animation deferred** — sheet unmounts instantly on close. Note: `slide-in-from-right` is physical, not logical — RTL animation direction will need fix when i18n lands | Sprint 1 — known limitation |
| 2026-05-19 | § 6 Carousel | Autoplay 6s + pause-on-hover, pause-on-focus, explicit pause button (WCAG 2.2.2 A). ARIA `role="region"` + `aria-roledescription="carrousel"` + `role="tab"` indicators. Keyboard arrows nav. `prefers-reduced-motion` only suppresses the slide TRANSITION (via `motion-safe:`) — autoplay itself stays on so users opting out of animation on Windows aren't stuck on slide 1 | Sprint 2 |
| 2026-05-19 | § 6 Carousel | Bottom-bar layout: `[<]  [• • •]  [>]` centered (arrows flank dots), pause button absolute end. Iteration after user feedback that previous side-by-side grouping felt off | Sprint 2 — iteration |
| 2026-05-19 | § 6 CartContext | Added `updateDuration(itemKey, durationMonths)` action. `mapApiCartToItems` now exposes `available: it.saasService?.available !== false`. Patches `/api/cart_items/:id` with `{ durationMonths }` — assumes backend writable on the entity | Sprint 3 |
| 2026-05-19 | § 8.4 Cart | Per-line duration `<select>` (1/3/6/12 mois) — modifie en direct via context. Per-line `available===false` shows inline alert + grise (opacity-60) + disables qty/duration controls. Aggregate alert in sticky summary | Sprint 3 |
| 2026-05-19 | § 8.5 Checkout | 4-step stepper `[Adresse → Récap → Paiement → Confirmation]`. Step state local. Stripe Elements lazily instantiated at step 3. Sticky summary on desktop, full-width on mobile. Stripe Appearance theme aligned: bg `cyna-navy-950`, primary `cyna-cyan-400`, danger `cyna-rose-500`, font Inter | Sprint 3 |
| 2026-05-19 | § 8.6 Auth | `AuthPageLayout` refondu (drop DaisyUI badges/cards, drop blur deco, drop Material icons). Single neutral container with shadcn tokens. All 5 auth pages (Login/Register/Forgot/Reset/Verify) refondues sur ce pattern. Resend verification email ajouté côté UI — endpoint `POST /api/verify-email/resend` à implémenter back | Sprint 3 |
| 2026-05-19 | § 8.7 Account | `AccountPage` refondu intégralement. Sidebar nav (sticky desktop, horizontal-scroll mobile). Tabs : Profil (édition firstname/lastname via `PATCH /api/me`), Commandes (groupées par année, filtre année + recherche par référence + bouton "Imprimer / PDF" via `window.print()`), Adresses (création + **édition inline** + suppression), Paiement (CRUD mock), Sécurité (intact), Mail. Anciennes classes `.account-*` à retirer en cleanup futur | Sprint 4 |
| 2026-05-19 | § 8.9 Contact | `ContactPage` refondu Tailwind. Drop DaisyUI blur deco, drop Material icons. Layout 2-col desktop, succès state avec icône emerald, team list avec avatar à initiale | Sprint 4 |
| 2026-05-19 | § 0 DaisyUI cleanup | **DaisyUI plugin gardé chargé** (Chatbot.jsx depend de variables `--brand`, `--surface`, `--text-soft` qui en proviennent). `AppShell` migré de `bg-base-100 text-base-content` vers `bg-background text-foreground` (tokens shadcn). NotFoundPage refondu. Tous les écrans applicatifs sont maintenant en Tailwind/shadcn ; les seuls vestiges DaisyUI sont les variables CSS utilisées par le Chatbot. Cleanup final = ticket dédié (refactor Chatbot.jsx ~300 lignes) | Sprint 4 — cleanup partiel |
| 2026-05-19 | § 8.2 Catalogue | **Category name overlaid on image** (bottom-start) with gradient `from-background/95 via-background/50 to-transparent` — applies to both `CategoriesGrid` (home) and `/categories`. Cahier des charges requirement | Sprint 2 |
| 2026-05-19 | § 8.2 ProductsPage | Debounce 300 ms on filter draft → URL sync. Client-side stable sort places unavailable items last within current page. Filters: `q`, `category`, `sort`, `minPrice`, `maxPrice`, `available=1`. Sort by createdAt and availability deferred — backend ticket required | Sprint 2 |
| 2026-05-19 | § 8.3 Product | Dynamic CTA: `available !== false` → "Ajouter au panier" with quantity stepper + duration select; otherwise disabled "Indisponible" button + hint. **Single image** displayed — multi-image carousel deferred (no backend support yet). Similar products section: 6 max, same category, current excluded. Tech specs section deferred — no dedicated field on backend | Sprint 2 |
| 2026-05-19 | § 6 ResourceState | Uses native Tailwind `motion-safe:animate-pulse` skeleton instead of custom shimmer keyframes — respects `prefers-reduced-motion` automatically | Sprint 2 |
| 2026-05-20 | § 0 i18n | **`i18next` + `react-i18next` adoptés** (FR par défaut, EN actif). Config dans `src/i18n/index.js`, traductions JSON par namespace dans `src/i18n/locales/{fr,en}/{common,home,catalog,cart,checkout,auth,account,legal,contact}.json`. Hook `useLocale()` synchronise `<html lang>`/`<html dir>` au changement. Persistance localStorage `cyna-locale`. Détection initiale : localStorage → `navigator.language` → `fr`. Interpolation `{{var}}` (default i18next, pas `{var}` comme l'ancien `siteText.js`). Pattern d'usage : `const { t } = useTranslation('namespace'); t('clé')`. Pour les arrays : `t('clé', { returnObjects: true })`. Pour la pluralisation : clés `_one`/`_other` avec `t('clé', { count: n })` | Sprint 2.5a |
| 2026-05-20 | § 6.6 header + § 0 footer | Navbar + Footer + AppShell (skip-link) migrés vers `useTranslation('common')`. Switcher de langue **activé** (EN passe `available:true`), branché sur `useLocale().setLocale`. `siteText.js` conservé en l'état pour les 13 autres consommateurs non migrés (sera supprimé à la fin du Sprint 2.5c). Le chatbot bascule automatiquement FR/EN car `resolveChatbotLocale()` lit `document.documentElement.lang` que `useLocale` met à jour | Sprint 2.5a |
| 2026-05-20 | § 0 typo FR | Accents restaurés en passant dans les traductions FR (`catégories`, `réinitialiser`, `sécurité`, etc.). L'ancien `siteText.js` avait été désaccentué — probable encodage cassé lors d'une édition antérieure. Le JSON i18n est désormais la source de vérité ASCII-safe | Sprint 2.5a |
| 2026-05-20 | § 8.1-8.4 i18n migration | **Home + Catalogue + Cart migrés vers i18next**. 7 fichiers : `Hero`, `Carousel`, `CategoriesGrid`, `TopProducts` (namespace `home`), `CategoriesPage`, `ProductsPage`, `ProductDetailPage` (namespace `catalog`), `CartPage` (namespace `cart`). Patterns établis : (a) `useTranslation('ns', { keyPrefix: 'sub' })` pour les pages avec un sous-objet unique (ex. `ProductsPage`) ; (b) `useTranslation(['ns1', 'ns2'])` + clés préfixées (ex. `t('catalog:categories.eyebrow')`) quand on consomme 2 namespaces (`CategoriesPage`) ; (c) `t('arrayKey', { returnObjects: true })` pour récupérer un tableau structuré ; (d) pluralisation native via `t('itemsCount', { count })` avec clés `_one`/`_other` (ex. `cart.itemsCount`, `catalog.products.resultsCount`) — **`count` est la variable réservée**, pas `total` ; (e) interpolations multiples avec `t('pageInfo', { current, total })`. **Intl.NumberFormat locale** dérivé de `i18n.resolvedLanguage` (`fr-FR` ou `en-GB`) dans les `formatPrice` — la devise reste EUR, seul le séparateur change | Sprint 2.5b |
| 2026-05-20 | § 0 i18n a11y | Clés a11y manquantes ajoutées dans `home.json` (`intro.pointsAriaLabel`, `carousel.{ariaLabel,regionLabel,slideAriaLabel,previousSlide,nextSlide,indicatorsAriaLabel,goToSlide,play,pause}`, `categories.eyebrow`, `products.eyebrow`), `catalog.json` (`products.paginationAriaLabel`, `productDetail.{available,imageAlt,quantityIncrease,quantityDecrease}`) et `cart.json` (`perUnitMonth`, `lineTotal`). Toutes les chaînes ARIA en dur des 7 composants sont désormais traduites | Sprint 2.5b |
| 2026-05-20 | § 8.5–8.10 i18n migration | **Sprint 2.5c : Auth + Checkout + Account + pages statiques migrés**. 12 fichiers : `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage` (namespace `auth`), `CheckoutPage`, `OrderConfirmationPage` (namespace `checkout`), `AccountPage` (avec 5 sous-composants ProfileTab/OrdersTab/AddressesTab/PaymentsTab/MailTab), `PrivateAreaPage` (namespace `account`), `ContactPage` (namespace `contact`), `CGUPage`, `LegalPage`, `AboutPage`, `NotFoundPage` (namespace `legal`). Pattern dominant : `useTranslation('ns'); const text = t('section', { returnObjects: true })` — permet de garder `text.x.y` dans le JSX sans tout réécrire. Pour les sous-composants d'AccountPage qui ont besoin de chaînes additionnelles, chaque sous-composant appelle son propre `useTranslation('account')` plutôt que de recevoir `t` en prop. Locale Intl.NumberFormat / toLocaleDateString dérivée de `i18n.resolvedLanguage` partout | Sprint 2.5c |
| 2026-05-20 | § 0 i18n a11y suite | Nouvelles clés ajoutées : `auth.register.{firstnameLabel,lastnameLabel,bothNamesRequired}`, `checkout.checkout.stepperAriaLabel`, `account.account.{sectionsAriaLabel,ordersDiscover,ordersNoMatch,ordersYearAriaLabel,ordersCount_one/_other,addressesIntro,deleteAddressConfirm,editAddressTitle,newAddressTitle,deletePaymentConfirm,paymentsIntro,newPaymentTitle}`, `contact.{successTitle,sendAnother}`, `legal.cgu.tocTitle`, `legal.legal.tocTitle`, `legal.about.{missionEyebrow,valuesEyebrow,ctaEyebrow}` | Sprint 2.5c |
| 2026-05-20 | § 0 siteText.js | **`src/content/siteText.js` orphelin conservé sur disque** (plus aucun import après Sprint 2.5c, Vite le tree-shake automatiquement du bundle final → 530 ko gzip 149 ko, identique au build avant migration). **À NE PAS supprimer** sans demande explicite de l'utilisateur — règle de prudence pour préserver l'historique en cas de besoin de rollback partiel ou de référence | Sprint 2.5c |
| 2026-05-20 | § 0 i18n known limitations | **`SecuritySettings.jsx` non migré** ce sprint : composant volumineux (~370 lignes) avec ~30 chaînes en dur pour la 2FA TOTP + 2FA email + notifications de connexion, **mais** il n'importait pas `siteText.js` donc il n'a pas été inclus dans le grep initial. À i18n-ifier dans un sprint dédié, possiblement avec une refonte UI (les classes CSS legacy `.security-card`, `.button-primary` y subsistent — derniers vestiges du DaisyUI à transformer en shadcn) | Sprint 2.5c — known gap |
| 2026-05-20 | § 8.2 ProductsPage | Fix layout filtres : grille `lg:grid-cols-[2fr_1.2fr_1.2fr_repeat(2,minmax(0,7rem))]` remplacée par `lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]`. Le `minmax(0, 7rem)` forçait les colonnes Prix min/max à 112 px max — combiné au `gap-3` et aux 3 colonnes proportionnelles, ça faisait déborder la colonne Prix max hors du formulaire. Tous les `minmax(0, ...)` garantissent que les colonnes peuvent rétrécir sans déborder | Sprint 2.5d |
| 2026-05-20 | § 0 i18n AR + HE | **`ar` et `he` activés dans i18next** (4 langues totales : fr/en/ar/he). Stratégie squelette : 18 nouveaux JSON dans `locales/{ar,he}/*.json` copiés depuis `fr/` — fallback visuel FR jusqu'à traduction native. Switcher Navbar expose `العربية` et `עברית`. Hook `useLocale` expose maintenant `dir` (`'ltr'` ou `'rtl'`) en plus de `locale` — sync `<html lang>` + `<html dir>` automatique au switch | Sprint 2.5d |
| 2026-05-20 | § 5/§ 7 RTL fixes | Animation du sheet mobile Navbar conditionnée par `dir` : `slide-in-from-right` en LTR, `slide-in-from-left` en RTL — corrige le bug connu hérité du Sprint 1. Règle CSS globale dans `index.css` qui cible directement les classes lucide-react (`svg.lucide-arrow-left`, `lucide-arrow-right`, `lucide-arrow-up-right`, `lucide-chevron-left`, `lucide-chevron-right`) avec `transform: scaleX(-1)` en `[dir="rtl"]`. Approche systémique : zéro modification des composants nécessaire, toutes les icônes directionnelles flippent automatiquement en RTL. Override possible avec `.icon-no-flip` ou usage de la classe explicite `.icon-rotate-rtl` pour ajouter le flip à une icône non-lucide | Sprint 2.5d |
| 2026-05-20 | § 0 bundle impact | Bundle JS prod : 530 ko → 582 ko (gzip 149 → 157 ko, +8 ko). Surcoût lié à l'inclusion synchrone des 18 JSON `ar/` + `he/` copiés depuis FR. Optimisation future : passer à `i18next-http-backend` pour charger les langues à la demande, ce qui ramènerait à ~149 ko gzip pour la langue active uniquement | Sprint 2.5d — known cost |
| 2026-05-20 | § 0 i18n AR + HE content | **Traduction native des 5 namespaces publics** (`common`, `home`, `catalog`, `cart`, `auth`) en arabe standard moderne (MSA) et hébreu moderne. Registre B2B sobre. Marques (CYNA, Stripe, OVHcloud), acronymes (SOC, EDR, XDR, RGPD, PCI-DSS), routes URL et variables i18next (`{{count}}`, `{{year}}`, `{{ref}}`, etc.) conservés tels quels. **Limites connues** : (a) la pluralisation arabe complète (6 formes : zero/one/two/few/many/other) n'est pas exploitée — seules `_one` et `_other` existent, i18next mappe automatiquement les autres cas vers `_other` ; (b) pour l'hébreu la forme `_one` a été placée avec le nombre après le mot pour respecter l'ordre naturel ("פריט {{count}}"), à confirmer avec un natif ; (c) **relecture native recommandée** pour le registre formel et la terminologie cyber technique. Les 4 namespaces internes (`checkout`, `account`, `legal`, `contact`) restent en fallback FR | Sprint 2.5d content |
| 2026-05-20 | § 0 bundle impact (suite) | Bundle JS prod après traduction AR + HE : 582 → 578 ko, gzip 157 → 162 ko (+5 ko). Le JS uncompressed est légèrement plus petit (les expressions arabes/hébraïques sont parfois plus concises que le FR), mais le gzip est plus grand car AR/HE utilisent 2-3 octets UTF-8 par caractère vs 1-2 pour FR. Coût acceptable pour la couverture native des 5 namespaces publics | Sprint 2.5d content |
| 2026-05-21 | § 8.7 Account | **`SecuritySettings` refondu** (drop des dernières classes legacy DaisyUI : `.security-card`, `.security-checkbox`, `.security-status`, `.button-primary`, `.button-danger`, `.verification-input`, `.qr-code-wrapper`, `.setup-container`, `.test-container`, `.auth-feedback`). Migration vers tokens shadcn (PRIMARY_BTN / GHOST_BTN / DANGER_BTN locaux, `Feedback` + `StatusPill` + `SectionCard` patterns). Accents restaurés en FR (`sécurité`, `e-mail`, `désactivée`, etc. — l'ancien fichier avait subi le même bug d'encodage que `siteText.js`). Toutes les chaînes (~65) migrées vers `account.json` → clé `security`. EN traduit ; AR/HE en fallback FR comme convenu pour le namespace `account` | Sprint 2.5e cleanup |
| 2026-05-21 | § 0 deps | **`jspdf` 4.2.1 + `jspdf-autotable` 5.0.8** ajoutés pour la facture PDF. Chargement en `import()` dynamique dans `src/lib/invoicePdf.js` → 4 chunks séparés (`jspdf.es.min` 128 ko gzip, `html2canvas` 48 ko, `index.es` 51 ko, `jspdf.plugin.autotable` 10 ko, `purify` 10 ko) chargés uniquement à la 1re génération PDF. Bundle principal ne grossit que de ~5 ko gzip | Sprint 2.5e |
| 2026-05-21 | § 8.5 Checkout / § 8.7 Account | **Export facture PDF** branché à 2 endroits : (a) bouton primaire « Télécharger la facture » dans `OrderConfirmationPage`, (b) bouton icône `FileDown` par ligne dans `OrdersTab` qui charge la commande complète via `getOrder(id)` puis génère. Labels intra-PDF dans `checkout.json` → clé `invoice` (FR + EN traduit, AR/HE en fallback FR). Le `window.print()` global d'OrdersTab est conservé pour imprimer la liste filtrée ; les vraies factures se téléchargent par ligne. Format A4, helvetica, mention "TVA incluse" + footer mentions légales SAS | Sprint 2.5e |
| 2026-05-21 | § 0 perf | Retrait du link Google Fonts `Material+Symbols+Outlined` de `index.html` — chargé inutilement depuis la refonte qui a viré les Material Icons (Sprint 4). Gain : ~70 ko de fonts évitées au 1er chargement, FCP plus rapide | Sprint 2.5e cleanup |
| 2026-05-21 | § 8.2 ProductsPage | Fix débordement layout filtres : `sm:grid-cols-2` remplacé par `sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]` + `min-w-0` ajouté sur tous les `<label>` + `w-full min-w-0` sur tous les inputs/selects. Cause racine : en CSS Grid, les items ont `min-width: auto` par défaut, et `<input type="number">` a une largeur intrinsèque (spinners + placeholder "999") qui peut dépasser sa cell. Pattern à reutiliser sur tout nouveau formulaire à 5+ colonnes | Sprint 2.5e fix |
| 2026-05-21 | § 0 audit | `AUDIT_FRONT_CYNA.md` v3 : avancement réévalué à 86 %, intégration du Sprint 2.5e (SecuritySettings, PDF facture, cleanup font). Décision EasyAdmin documentée : le backoffice n'est PAS dans le scope du SPA React (livré côté Symfony, conforme à `CLAUDE.md`) | Sprint 2.5e doc |

---

*End of design rulebook. Edit this file when a system-level decision is made, not after.*
