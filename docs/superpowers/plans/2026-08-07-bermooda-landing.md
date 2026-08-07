# bermooda Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Laravel-inspired marketing homepage for bermooda in Astro + Tailwind, keep `/blog`, and deploy to GitHub Pages at `https://bermooda.github.io`.

**Architecture:** Replace the blog-starter homepage with Astro section components (`Hero`, `Features`, `GetStarted`, `Stack`) composed in `index.astro`. Share a Tailwind-styled `Header`/`Footer` across landing and blog. Brand assets come from the sibling `bermooda` repo. Organization GitHub Pages deploys via Actions (`withastro/action` + `deploy-pages`); `site` is the org URL and `base` stays `/`.

**Tech Stack:** Astro 7, Tailwind CSS v4 (`@tailwindcss/vite`), Google Fonts (Fraunces + Source Sans 3), GitHub Actions Pages deploy.

**Spec:** `docs/superpowers/specs/2026-08-07-bermooda-landing-design.md`

## Global Constraints

- Accent color: `#23a6b3` (bermooda teal from logo)
- CTAs: Get Started → `#get-started`; Docs/GitHub → `https://github.com/bermooda/bermooda`
- Keep `/blog` working; do not remove content collections
- No Laravel ecosystem product cards, AI sections, “Used by” logos, careers
- Node ≥ 22.12; org Pages site → `site: 'https://bermooda.github.io'`, `base: '/'`
- Logo: `/logo-full.svg`; favicon: bermooda `favicon.svg`
- Headline copy: “Own your ecommerce stack”
- Prefer Tailwind utility classes; avoid card-heavy layouts
- Motion: nav scroll shadow, hero staggered fade-in, CTA hover — CSS only

## File Structure

| File | Responsibility |
| ---- | -------------- |
| `public/favicon.svg` | Brand favicon (from bermooda) |
| `public/logo-full.svg` | Full wordmark logo (from bermooda) |
| `astro.config.mjs` | Site URL, Tailwind Vite plugin, fonts/integrations |
| `src/styles/global.css` | Tailwind import, `@theme` tokens, base/blog prose, motion keyframes |
| `src/consts.ts` | `SITE_TITLE`, `SITE_DESCRIPTION`, shared GitHub URL constant |
| `src/components/BaseHead.astro` | Meta, favicon, font links; drop Atkinson / `.ico` if unused |
| `src/components/Header.astro` | Sticky marketing nav |
| `src/components/Footer.astro` | Marketing footer |
| `src/components/HeaderLink.astro` | Nav link active state (Tailwind) |
| `src/components/Hero.astro` | Hero section |
| `src/components/Features.astro` | Why bermooda feature grid |
| `src/components/GetStarted.astro` | `#get-started` install commands |
| `src/components/Stack.astro` | Tech stack row |
| `src/pages/index.astro` | Landing composition |
| `.github/workflows/deploy.yml` | GitHub Pages build + deploy |
| `src/layouts/BlogPost.astro` | Keep blog layout; inherits shared Header/Footer via existing usage |

---

### Task 1: Brand assets + site metadata + Astro Pages config

**Files:**
- Create: `public/logo-full.svg` (copy)
- Modify: `public/favicon.svg` (replace with bermooda copy)
- Modify: `src/consts.ts`
- Modify: `astro.config.mjs`

**Interfaces:**
- Produces: `SITE_TITLE = 'bermooda'`, `SITE_DESCRIPTION`, `GITHUB_URL = 'https://github.com/bermooda/bermooda'`
- Produces: `astro.config.mjs` with `site: 'https://bermooda.github.io'`

- [ ] **Step 1: Copy brand assets from the sibling bermooda repo**

```bash
cp /Users/cvgellhorn/dev/bermooda/bermooda/public/favicon.svg \
  /Users/cvgellhorn/dev/bermooda/bermooda.github.io/public/favicon.svg
cp /Users/cvgellhorn/dev/bermooda/bermooda/public/assets/images/logo-full.svg \
  /Users/cvgellhorn/dev/bermooda/bermooda.github.io/public/logo-full.svg
```

Expected: both files exist under `public/`.

- [ ] **Step 2: Update `src/consts.ts`**

Replace file contents with:

```ts
export const SITE_TITLE = 'bermooda';
export const SITE_DESCRIPTION =
	'Own your ecommerce stack — open-source ecommerce with storefront, admin, and REST API in one app.';
export const GITHUB_URL = 'https://github.com/bermooda/bermooda';
```

- [ ] **Step 3: Set organization site URL in `astro.config.mjs`**

Change `site: 'https://example.com'` to:

```js
site: 'https://bermooda.github.io',
```

Do **not** set `base` (org `.github.io` repos serve from `/`). Leave existing `integrations` and `fonts` untouched in this task — fonts are replaced in Task 2.

- [ ] **Step 4: Verify assets and consts**

```bash
test -f public/favicon.svg && test -f public/logo-full.svg && \
  grep -q "bermooda" src/consts.ts && \
  grep -q "bermooda.github.io" astro.config.mjs && echo OK
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add public/favicon.svg public/logo-full.svg src/consts.ts astro.config.mjs
git commit -m "$(cat <<'EOF'
chore: add brand assets and GitHub Pages site URL

EOF
)"
```

---

### Task 2: Install Tailwind v4 and replace global styles

**Files:**
- Modify: `package.json` / lockfile (via npm)
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/components/BaseHead.astro`

**Interfaces:**
- Consumes: `SITE_TITLE` from consts
- Produces: Tailwind available via `@import "tailwindcss"`; CSS theme tokens `--color-brand`, font families
- Produces: BaseHead loads Fraunces + Source Sans 3 (Google Fonts), SVG favicon only

- [ ] **Step 1: Install Tailwind packages**

```bash
npm install tailwindcss @tailwindcss/vite
```

Expected: packages added to `dependencies`.

- [ ] **Step 2: Register the Vite plugin and simplify fonts in `astro.config.mjs`**

Replace `astro.config.mjs` with:

```js
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://bermooda.github.io',
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
```

Remove the local Atkinson `fonts` config (fonts will load via Google Fonts in BaseHead).

- [ ] **Step 3: Replace `src/styles/global.css`**

```css
@import 'tailwindcss';

@theme {
	--color-brand: #23a6b3;
	--color-brand-dark: #1b858f;
	--color-ink: #0f172a;
	--color-muted: #64748b;
	--color-surface: #f8fafc;
	--color-surface-2: #f1f5f9;
	--font-display: 'Fraunces', ui-serif, Georgia, serif;
	--font-sans: 'Source Sans 3', ui-sans-serif, system-ui, sans-serif;
}

@layer base {
	html {
		scroll-behavior: smooth;
	}

	body {
		@apply bg-white font-sans text-ink antialiased;
	}

	::selection {
		background: color-mix(in srgb, var(--color-brand) 25%, white);
	}
}

/* Blog prose compatibility (layouts still use these class hooks lightly) */
.prose a {
	@apply text-brand underline-offset-2 hover:underline;
}

@keyframes fade-up {
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-up {
	animation: fade-up 0.7s ease-out both;
}

.animation-delay-100 {
	animation-delay: 100ms;
}
.animation-delay-200 {
	animation-delay: 200ms;
}
.animation-delay-300 {
	animation-delay: 300ms;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
}
```

- [ ] **Step 4: Update `src/components/BaseHead.astro`**

Replace contents with:

```astro
---
import '../styles/global.css';
import type { ImageMetadata } from 'astro';
import FallbackImage from '../assets/blog-placeholder-1.jpg';
import { SITE_TITLE } from '../consts';

interface Props {
	title: string;
	description: string;
	image?: ImageMetadata;
}

const canonicalURL = new URL(Astro.url.pathname, Astro.site);

const { title, description, image = FallbackImage } = Astro.props;
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="sitemap" href="/sitemap-index.xml" />
<link
	rel="alternate"
	type="application/rss+xml"
	title={SITE_TITLE}
	href={new URL('rss.xml', Astro.site)}
/>
<meta name="generator" content={Astro.generator} />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
	rel="stylesheet"
/>

<link rel="canonical" href={canonicalURL} />

<title>{title}</title>
<meta name="description" content={description} />

<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image.src, Astro.url)} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(image.src, Astro.url)} />
```

- [ ] **Step 5: Verify Tailwind + build config**

```bash
npm run build
```

Expected: build succeeds (exit 0). Existing pages may look unstyled until Header/Footer are rewritten — that is OK for this task.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/styles/global.css src/components/BaseHead.astro
git commit -m "$(cat <<'EOF'
chore: add Tailwind v4 and brand theme tokens

EOF
)"
```

---

### Task 3: Marketing Header, HeaderLink, and Footer

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/HeaderLink.astro`
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `GITHUB_URL`, `SITE_TITLE` from consts; `/logo-full.svg`
- Produces: sticky nav with Docs, Blog, GitHub, Get Started (`#get-started`); footer with same links + © year bermooda

- [ ] **Step 1: Rewrite `HeaderLink.astro` for Tailwind**

```astro
---
import type { HTMLAttributes } from 'astro/types';

type Props = HTMLAttributes<'a'>;

const { href, class: className, ...props } = Astro.props;
const pathname = Astro.url.pathname.replace(import.meta.env.BASE_URL, '');
const subpath = pathname.match(/[^\/]+/g);
const isActive = href === pathname || href === '/' + (subpath?.[0] || '');
---

<a
	href={href}
	class:list={[
		'text-sm font-medium text-ink/80 transition hover:text-brand',
		isActive && 'text-brand',
		className,
	]}
	{...props}
>
	<slot />
</a>
```

- [ ] **Step 2: Rewrite `Header.astro`**

```astro
---
import { GITHUB_URL } from '../consts';
import HeaderLink from './HeaderLink.astro';
---

<header
	id="site-header"
	class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md transition-shadow"
>
	<nav class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href="/" class="flex shrink-0 items-center" aria-label="bermooda home">
			<img src="/logo-full.svg" alt="bermooda" class="h-7 w-auto sm:h-8" width="200" height="30" />
		</a>

		<div class="hidden items-center gap-6 md:flex">
			<a
				href={GITHUB_URL}
				class="text-sm font-medium text-ink/80 transition hover:text-brand"
				target="_blank"
				rel="noopener noreferrer">Docs</a
			>
			<HeaderLink href="/blog">Blog</HeaderLink>
			<a
				href={GITHUB_URL}
				class="text-sm font-medium text-ink/80 transition hover:text-brand"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="bermooda on GitHub"
			>
				GitHub
			</a>
		</div>

		<a
			href="/#get-started"
			class="rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
		>
			Get Started
		</a>
	</nav>
</header>

<script>
	const header = document.getElementById('site-header');
	const onScroll = () => {
		if (!header) return;
		header.classList.toggle('shadow-sm', window.scrollY > 8);
	};
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
</script>
```

- [ ] **Step 3: Rewrite `Footer.astro`**

```astro
---
import { GITHUB_URL } from '../consts';

const year = new Date().getFullYear();
---

<footer class="border-t border-slate-200 bg-surface">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6"
	>
		<div class="space-y-3">
			<a href="/" aria-label="bermooda home">
				<img src="/logo-full.svg" alt="bermooda" class="h-6 w-auto" width="180" height="27" />
			</a>
			<p class="text-sm text-muted">Own your ecommerce stack.</p>
		</div>

		<nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink/80">
			<a href={GITHUB_URL} class="transition hover:text-brand" target="_blank" rel="noopener noreferrer"
				>Docs</a
			>
			<a href="/blog" class="transition hover:text-brand">Blog</a>
			<a href={GITHUB_URL} class="transition hover:text-brand" target="_blank" rel="noopener noreferrer"
				>GitHub</a
			>
		</nav>
	</div>
	<div class="border-t border-slate-200/80 py-4 text-center text-xs text-muted">
		&copy; {year} bermooda. Open source under the project license.
	</div>
</footer>
```

- [ ] **Step 4: Smoke-check blog still renders chrome**

```bash
npm run build && grep -q 'logo-full.svg' dist/blog/index.html && grep -q 'Get Started' dist/blog/index.html && echo OK
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/HeaderLink.astro src/components/Footer.astro
git commit -m "$(cat <<'EOF'
feat: restyle shared nav and footer for marketing chrome

EOF
)"
```

---

### Task 4: Landing section components

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/Features.astro`
- Create: `src/components/GetStarted.astro`
- Create: `src/components/Stack.astro`

**Interfaces:**
- Consumes: `GITHUB_URL`
- Produces: self-contained sections; `GetStarted` root element must have `id="get-started"`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { GITHUB_URL } from '../consts';
---

<section class="relative overflow-hidden">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(35,166,179,0.18),_transparent_55%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
		style="background-image: url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28">
		<img
			src="/logo-full.svg"
			alt="bermooda"
			class="animate-fade-up mx-auto h-10 w-auto sm:h-12"
			width="280"
			height="41"
		/>

		<h1
			class="animate-fade-up animation-delay-100 mx-auto mt-8 max-w-3xl text-center font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl"
		>
			Own your ecommerce stack
		</h1>

		<p
			class="animate-fade-up animation-delay-200 mx-auto mt-5 max-w-2xl text-center text-lg text-muted sm:text-xl"
		>
			Open-source ecommerce as one deployable app — themed storefront, merchant admin, and REST API.
		</p>

		<div class="animate-fade-up animation-delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
			<a
				href="#get-started"
				class="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
			>
				Get Started
			</a>
			<a
				href={GITHUB_URL}
				class="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
				target="_blank"
				rel="noopener noreferrer"
			>
				GitHub
			</a>
		</div>

		<div
			class="animate-fade-up animation-delay-300 mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-ink shadow-lg shadow-slate-900/10"
		>
			<div class="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
				<span class="size-2.5 rounded-full bg-red-400/80"></span>
				<span class="size-2.5 rounded-full bg-amber-400/80"></span>
				<span class="size-2.5 rounded-full bg-emerald-400/80"></span>
				<span class="ml-2 text-xs text-white/50">terminal</span>
			</div>
			<pre
				class="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100 sm:text-[15px]"><code><span class="text-brand">$</span> npm i -g @bermooda/cli@latest
<span class="text-brand">$</span> bermooda install --local --dir ./my-shop -y</code></pre>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Create `src/components/Features.astro`**

```astro
---
const features = [
	{
		title: 'One app, three surfaces',
		body: 'Themed storefront, merchant admin, and public/admin REST APIs in a single React Router app.',
	},
	{
		title: 'Real commerce primitives',
		body: 'Catalog, cart, checkout, payments, shipping, customers, discounts, and inventory — domain logic in one place.',
	},
	{
		title: 'Themes & plugins',
		body: 'Swap storefront UI with themes. Extend behavior with hook-based plugins without forking the core.',
	},
	{
		title: 'Local-first',
		body: 'SQLite for development, PostgreSQL when you need it. No Docker required to start shipping.',
	},
];
---

<section class="border-t border-slate-200 bg-surface" aria-labelledby="why-heading">
	<div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
		<div class="mx-auto max-w-2xl text-center">
			<p class="text-sm font-semibold uppercase tracking-wider text-brand">Why bermooda</p>
			<h2 id="why-heading" class="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
				Batteries included for ecommerce engineers
			</h2>
			<p class="mt-4 text-muted">
				Clone it, scaffold a shop in minutes, and own the stack end to end.
			</p>
		</div>

		<ul class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
			{
				features.map((feature) => (
					<li>
						<h3 class="font-display text-lg font-semibold text-ink">{feature.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
					</li>
				))
			}
		</ul>
	</div>
</section>
```

- [ ] **Step 3: Create `src/components/GetStarted.astro`**

```astro
---
import { GITHUB_URL } from '../consts';
---

<section id="get-started" class="border-t border-slate-200 bg-white" aria-labelledby="get-started-heading">
	<div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
		<div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
			<div>
				<p class="text-sm font-semibold uppercase tracking-wider text-brand">Get started</p>
				<h2 id="get-started-heading" class="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
					Scaffold a shop in minutes
				</h2>
				<p class="mt-4 text-muted">
					Install the CLI, create a local shop, and run the dev server. Full setup details live in the
					repository README.
				</p>
				<a
					href={GITHUB_URL}
					class="mt-6 inline-flex text-sm font-semibold text-brand transition hover:text-brand-dark"
					target="_blank"
					rel="noopener noreferrer"
				>
					Read the docs on GitHub →
				</a>
			</div>

			<div class="overflow-hidden rounded-xl border border-slate-200 bg-ink shadow-lg shadow-slate-900/10">
				<div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
					<span class="text-xs text-white/50">Install</span>
					<span class="text-xs text-white/40">Node.js ≥ 22.22</span>
				</div>
				<pre
					class="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100"><code><span class="text-white/40"># Install the CLI</span>
npm i -g @bermooda/cli@latest

<span class="text-white/40"># Scaffold a local shop</span>
bermooda install --local --dir ./my-shop -y

cd my-shop
bermooda dev</code></pre>
			</div>
		</div>
	</div>
</section>
```

- [ ] **Step 4: Create `src/components/Stack.astro`**

```astro
---
const stack = [
	'React Router',
	'React 19',
	'Prisma',
	'SQLite / PostgreSQL',
	'Stripe',
	'better-auth',
	'Vite',
	'Tailwind CSS',
];
---

<section class="border-t border-slate-200 bg-surface-2" aria-labelledby="stack-heading">
	<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
		<div class="text-center">
			<h2 id="stack-heading" class="font-display text-2xl font-bold text-ink sm:text-3xl">
				Built with a modern Node stack
			</h2>
			<p class="mt-3 text-muted">Familiar tools, one deployable service.</p>
		</div>
		<ul class="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
			{
				stack.map((item) => (
					<li class="text-sm font-semibold tracking-wide text-ink/70">{item}</li>
				))
			}
		</ul>
	</div>
</section>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/components/Features.astro src/components/GetStarted.astro src/components/Stack.astro
git commit -m "$(cat <<'EOF'
feat: add landing page section components

EOF
)"
```

---

### Task 5: Compose the homepage

**Files:**
- Modify: `src/pages/index.astro`
- Optionally tighten: `src/layouts/BlogPost.astro` (only if blog layout still depends on old Bear Blog `main` width CSS — prefer Tailwind wrappers if needed)

**Interfaces:**
- Consumes: `Hero`, `Features`, `GetStarted`, `Stack`, `Header`, `Footer`, `BaseHead`, consts

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Features from '../components/Features.astro';
import Footer from '../components/Footer.astro';
import GetStarted from '../components/GetStarted.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Stack from '../components/Stack.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
---

<!doctype html>
<html lang="en">
	<head>
		<BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
	</head>
	<body class="flex min-h-screen flex-col">
		<Header />
		<main class="flex-1">
			<Hero />
			<Features />
			<GetStarted />
			<Stack />
		</main>
		<Footer />
	</body>
</html>
```

- [ ] **Step 2: Ensure blog layout still has usable page chrome**

Open `src/layouts/BlogPost.astro`. If `main` content is unreadable without old global CSS width rules, wrap the blog content container with Tailwind:

```astro
<main class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
```

(Keep existing Header/Footer imports; do not rebuild blog content.)

- [ ] **Step 3: Build and verify homepage content**

```bash
npm run build && \
  grep -q 'Own your ecommerce stack' dist/index.html && \
  grep -q 'id="get-started"' dist/index.html && \
  grep -q 'logo-full.svg' dist/index.html && \
  grep -q 'favicon.svg' dist/index.html && \
  grep -q '/blog' dist/blog/index.html && \
  echo OK
```

Expected: `OK`

- [ ] **Step 4: Manual visual check**

```bash
npm run preview
```

Visit `http://localhost:4321/` and `/blog`. Confirm: hero logo dominant, teal CTAs, `#get-started` scroll works, blog chrome matches.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/layouts/BlogPost.astro
git commit -m "$(cat <<'EOF'
feat: compose bermooda marketing homepage

EOF
)"
```

---

### Task 6: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: Actions workflow on `master` + `workflow_dispatch` deploying `dist/` to GitHub Pages

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

Use Astro’s official Pages guide. Default branch in this repo is `master`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v7
      - name: Install, build, and upload your site
        uses: withastro/action@v6
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Confirm site config still matches org Pages rules**

```bash
grep -q "site: 'https://bermooda.github.io'" astro.config.mjs && \
  ! grep -q "base:" astro.config.mjs && echo OK
```

Expected: `OK` (no `base` key — root org site).

- [ ] **Step 3: Final production build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "$(cat <<'EOF'
ci: add GitHub Pages deployment workflow

EOF
)"
```

- [ ] **Step 5: Post-merge repo setting (human / after push)**

In GitHub → **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions** (not “Deploy from a branch”).

After the first green Actions run, the site should be live at `https://bermooda.github.io`.

---

## Spec coverage checklist

| Spec requirement | Task |
| ---------------- | ---- |
| Landing + keep blog | 3, 5 |
| Tailwind styles | 2 |
| Laravel-like light + teal accent | 2–5 |
| logo-full + favicon from bermooda | 1 |
| Hero / features / get-started / stack / footer | 4–5 |
| CTAs → `#get-started` + GitHub docs | 3–4 |
| Omit Laravel ecosystem noise | 4–5 (not included) |
| `site` org URL, no `base` | 1, 6 |
| GitHub Actions Pages deploy | 6 |
| SITE_TITLE / DESCRIPTION | 1 |

## Self-review notes

- No placeholders or TBD steps.
- Section component names are consistent across Task 4 and Task 5.
- Deploy branch is `master` to match this repo’s default branch.
- Verification uses `npm run build` + content greps (no Vitest in this Astro starter).
