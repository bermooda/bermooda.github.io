# bermooda landing page design

Date: 2026-08-07  
Repo: `bermooda/bermooda.github.io`  
Related product: `bermooda/bermooda`

## Goal

Replace the Astro blog-starter homepage with a Laravel.com-inspired marketing landing page for bermooda, while keeping the existing blog under `/blog`. Use Tailwind CSS for styling. Deploy as a GitHub organization site (`https://bermooda.github.io`).

## Decisions (confirmed)

| Topic | Choice |
| ----- | ------ |
| Scope | Landing + keep blog (`/blog`) |
| Styles | Tailwind CSS |
| CTAs | Get Started scrolls to install snippet; Docs/GitHub → `https://github.com/bermooda/bermooda` |
| Visual tone | Laravel-like light page; bermooda teal `#23a6b3` as accent |
| Implementation | Single Astro page + section components (Approach 1) |
| Favicon | Copy from bermooda `public/favicon.svg` |
| Logo | Copy from bermooda `public/assets/images/logo-full.svg` |

## Out of scope

- Laravel-style ecosystem product cards (Cloud, Forge, Nova, etc.)
- AI tooling sections, careers, community events, “Used by” logo walls
- Separate docs site or Discord
- npm package deep-links as primary CTAs
- Rebuilding blog content; only restyle shared chrome

## Page structure

Sticky nav + homepage sections (top → bottom):

1. **Nav** — `logo-full` · Docs (GitHub) · Blog · GitHub · Get Started (anchor `#get-started`)
2. **Hero** — brand-first: full logo as primary brand signal, short headline (“Own your ecommerce stack”), one supporting sentence, CTA pair (Get Started / GitHub), terminal-style install snippet
3. **Why bermooda** — 3–4 feature blocks:
   - One app, three surfaces (storefront, admin, REST API)
   - Real commerce primitives (catalog, cart, checkout, orders, …)
   - Themes & plugins
   - Local-first (SQLite to start, no Docker required)
4. **Get Started** — `#get-started` with CLI install commands
5. **Stack** — compact tech row (React Router, Prisma, Stripe, better-auth, Vite, …)
6. **Footer** — logo, Docs, Blog, GitHub, copyright

Blog pages reuse the same Header/Footer chrome.

## Visual system

- **Palette:** white / soft gray section bands (`#f8fafc`–`#f1f5f9`), near-black text, accent teal `#23a6b3`
- **Typography:** Fraunces or Newsreader for display/headlines; Source Sans 3 for body (Google Fonts). No Inter/Roboto/system-default stacks as the primary look
- **Hero atmosphere:** subtle teal wash / soft gradient + light grain — not flat white
- **Layout:** not card-heavy; feature blocks as simple columns; install as a clean terminal panel
- **Buttons:** primary filled teal; secondary outline/ghost
- **Motion (2–3):** nav blur/shadow on scroll; hero staggered fade-in; soft CTA/feature hover
- **Responsive:** stacked mobile; multi-column features + wider terminal on desktop

## Assets

Copy from the bermooda app repo into this site’s `public/`:

| Source (bermooda) | Destination (bermooda.github.io) |
| ----------------- | -------------------------------- |
| `public/favicon.svg` | `public/favicon.svg` (replace Astro default) |
| `public/assets/images/logo-full.svg` | `public/logo-full.svg` |

Wire favicon via `BaseHead` / site `<head>` (and Astro `public/favicon.svg` convention). Use `/logo-full.svg` in nav and hero.

## Site metadata

Update `src/consts.ts`:

- `SITE_TITLE`: `bermooda`
- `SITE_DESCRIPTION`: short line aligned with product (“Own your ecommerce stack” / open-source ecommerce platform)

## Tech implementation

- Keep Astro 7 + existing MDX/RSS/sitemap integrations
- Add Tailwind CSS v4 via `@tailwindcss/vite` (or official Astro Tailwind path compatible with Astro 7)
- Homepage: rewrite `src/pages/index.astro` to compose section components under `src/components/` (e.g. `Hero.astro`, `Features.astro`, `GetStarted.astro`, `Stack.astro`)
- Restyle `Header.astro` / `Footer.astro` for marketing chrome; keep blog routes working
- Prefer CSS/Tailwind for motion; no heavy client frameworks required

### Astro config (organization GitHub Pages)

```js
// astro.config.mjs (conceptual)
site: 'https://bermooda.github.io',
base: '/', // org site at root — not a project subpath
```

### GitHub Actions deploy

Add `.github/workflows/deploy.yml`:

- Trigger: push to default branch (`master`) + `workflow_dispatch`
- Jobs: build with Node ≥ 22.12 → upload `dist/` → deploy with `actions/deploy-pages`
- Permissions: `contents: read`, `pages: write`, `id-token: write`
- Environment: `github-pages`

Repo Pages setting should use **GitHub Actions** as the source (not “Deploy from a branch”).

## Content copy (homepage)

Tone: confident, engineer-facing, concise — match bermooda README positioning.

- **Headline:** Own your ecommerce stack
- **Support:** Open-source ecommerce as one deployable app — themed storefront, merchant admin, and REST API
- **Install (Get Started):**

```bash
npm i -g @bermooda/cli@latest
bermooda install --local --dir ./my-shop -y
```

(Exact flags may be shortened for display; link Docs/GitHub for full README instructions.)

## Success criteria

- Homepage feels compositionally similar to laravel.com (nav, hero+command, features, get-started, footer) without Laravel-specific product noise
- Logo-full and bermooda favicon are used throughout
- `/blog` still works with shared chrome
- `npm run build` succeeds
- Push to `master` deploys to `https://bermooda.github.io` via Actions

## Non-goals for v1

- Pixel-perfect Laravel clone
- Live demo shop embed
- Multiple locale pages
- Separate documentation site
