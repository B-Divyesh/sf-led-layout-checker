# LED Layout Checker — build handoff

Completed 2026-08-28 for work order `led-layout-checker-build-1`.

## What shipped

- A local-first LED planner at `/planner` with multi-point segments, controllers, supplies, data direction, power-point assumptions, brightness, voltage, and per-pixel current settings.
- Live current and power totals plus warnings for missing power points, long single-ended runs, missing controllers, low supply headroom, and supply-voltage mismatches.
- Labeled SVG export for every plan. Studio adds multiple-controller assignment and a text parts summary.
- A one-click `/demo` with a 480-pixel garden arch, 11.5 A estimate, and two power warnings. Demo data uses a separate storage key and can be reset or discarded.
- Sociobot one-time license checkout, return-token capture, daily verification cache, offline optimistic unlock, invalid-license handling, and license restore.
- Offline app shell, local storage, Undo, reversible source/segment removal, keyboard coordinate placement, responsive 390px layout, paused motion control, and reduced-motion behavior.
- Landing, privacy, terms, and designed 404 routes with SPA history/focus handling, metadata, social art, manifest, sitemap, robots file, CSP, and security headers.
- Original generated hero art with prompt provenance. Responsive 600px/1200px WebP and PNG variants are bundled locally.

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm test` passes 4 Vitest checks and 11 Chromium checks. These cover every claim, SVG and parts downloads, demo isolation, offline reload, license verification, persistence, keyboard use at 390px, serious/critical axe findings, route semantics, and console errors.

The clean build writes `dist/index.html`. Final compressed application assets are 10.80 KB JavaScript and 4.68 KB CSS. The mobile hero WebP is 37 KB. `npm audit --audit-level=high` reports 0 vulnerabilities.

The worker verifier passed at `http://127.0.0.1:4173/`: title, `lang`, one `h1`, `main`, image alt text, button labels, and zero console errors.

Lighthouse desktop headless results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 0.9 s |
| Largest contentful paint | 1.7 s |
| Total blocking time | 10 ms |
| Cumulative layout shift | 0 |

Evidence is in the worker-only `.factory/evidence/` directory. Claim definitions and exact commands are in `.factory/claims.json`.

## Known limits and next steps

- Estimates depend on the entered LED, brightness, supply, and injection assumptions. The tool does not calculate wire gauge, fuse size, per-wire voltage drop, mains wiring, or electrical certification.
- Supply placement and segment power points are visual assumptions; v1 does not model individual wire routes between them.
- The factory must register the `led-layout-checker` product and $12 price in Sociobot billing before checkout can complete in production.
- Deployment, DNS, billing registration, and user trials remain factory operations outside this repository.
