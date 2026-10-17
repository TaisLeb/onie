# Onie Beauty

Awwwards-style concept site for a fictional clean-beauty brand, **"Onie Beauty"**.
This is a **portfolio project, not a real brand** — all product copy, reviews, and
testimonials are invented.

Live: https://onie-beauty.vercel.app (production may be gated by Vercel
Deployment Protection — disable under Project → Settings → Deployment Protection
to make it public).

## Stack

- **Next.js 16** (App Router) + **React 19**, plain JavaScript (`.js` / `.jsx`), no TypeScript
- **Plain CSS** — all global styling lives in [`app/globals.css`](app/globals.css) (~2k lines, no Tailwind/CSS-modules except `app/page.module.css`)
- **GSAP + ScrollTrigger** for scroll animations, **Lenis** for smooth scroll
- **Three.js** for the WebGL shaders (hero background, water-ripple panel)
- Hosted on **Vercel**, source on **GitHub** (`TaisLeb/onie`, branch `main`)

Node 22 is used locally.

## Getting started

```bash
npm install          # node_modules and .next are gitignored — install first
npm run dev          # Next dev server (defaults to http://localhost:3000)
```

> In the Claude Code sessions this was built in, the dev server ran on **port 3014**
> (`PORT=3014 npm run dev`). The committed `dev` script is plain `next dev`, so it
> defaults to 3000 unless you set `PORT`.

```bash
npm run build        # production build
npm run start        # serve the production build
```

## How the code is organized

```
app/
  layout.js               Root layout: fonts, <Nav>, global providers
  page.js                 Homepage (hero, manifesto, products grid, spotlight,
                          story slider, scatter quote band, newsletter)
  globals.css             ALL global styles — the main place to edit visuals
  products/[slug]/page.js Product detail pages (purify / nourish / brighten),
                          incl. the running-marquee + Reviews sections
  about/page.js           "Our Story" / founders page
  cart/page.js            Cart + checkout
  blog/page.js            Static blog listing

components/                (all "use client" unless noted)
  Motion.js               Central GSAP controller — reveals, parallax, the
                          story slider, the marquee pin. Reads data-attributes
                          (data-reveal, data-parallax) off the markup.
  Liquid.js               Hero WebGL shader (lavender field + iridescent rays,
                          cutout portrait composited over it)
  Water.js                WebGL2 ripple simulation for the featured-product panel
  Hero.js, Nav.js, Footer.js, Loader.js, Cursor.js
  ProductBuy.js           Add-to-cart control on product pages
  CartClient.js           Cart page UI (reads real items from localStorage)
  CartLink.js             Nav cart link with live item-count badge
  Newsletter.js, BlogClient.js, Art.js

lib/
  products.js             Product catalogue (shared by homepage + PDPs). Each
                          product has: slug, name, tag, product, price, desc,
                          ingredients, img, behind[], c1, editorial{}.
  cart.js                 Cart state via localStorage + CustomEvent("onie:cart")

public/img/               Optimized WebP images (hero, jars, scatter tiles, etc.)
```

## Conventions & gotchas worth knowing

- **Edit visuals in `app/globals.css`.** Components mostly emit semantic class
  names; the look lives in the stylesheet.
- **GSAP lives in `Motion.js`.** New scroll animations are wired by adding
  `data-reveal="fade|lines|stagger"`, `data-parallax="0.2"`, etc. to markup and
  letting `Motion.js` pick them up — avoid scattering ScrollTriggers elsewhere.
- **`backdrop-filter` (frosted glass) breaks under a transformed ancestor.** A
  parent with `transform` / `will-change: transform` / `filter` becomes a
  "backdrop root" and silently disables blur on children. The Reviews section is
  intentionally built with a pure-CSS `position: sticky` title (no pin/transform)
  so the cards' frost works. Also: Turbopack's CSS minifier drops
  `backdrop-filter` if it's written **before** `-webkit-backdrop-filter`, so
  always put the `-webkit-` line first.
- **Smooth scroll:** Lenis instance is on `window.__lenis` (use
  `window.__lenis.scrollTo(...)`). Don't name a variable `top` in page scripts —
  it collides with `window.top`.
- **WebGL cost:** keep at most the hero + one other live WebGL context; both use
  IntersectionObserver to pause when off-screen.
- **Reduced motion:** `Motion.js` respects `prefers-reduced-motion`.

## Deploy

Push to `main` and deploy to Vercel:

```bash
git push origin main
npx vercel@latest --prod --yes   # explicit production deploy (CLI)
```

The repo is linked to the Vercel project `onie-beauty` (`.vercel/project.json`).
