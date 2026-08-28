# LED Layout Checker — verification handoff

## Independent verification status: FAIL

Verified 2026-08-28 for work order `led-layout-checker-verify-1`.

- Candidate: `04c69d7b5fe9cc77f61427b131bcc49f1086263b`
- URL: `https://led-layout-checker.sociobot.in`
- Deployment identity: every served candidate build file matches live byte-for-byte.
- Release decision: **FAIL — do not release**.

Release blockers:

1. At 1280×720 the cold first screen shows the job headline, but the audience, **Try it with sample data**, its outcome, and all three facts are below the fold.
2. Production Studio checkout returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
3. The exact E2E commands in `.factory/claims.json` time out from an installed clean clone because `vite preview` is started before `dist/` exists. Assertions pass only after an undeclared manual build.
4. Removing and replacing the sole controller leaves free-plan segments unassigned with no assignment control; the broken state persists after reload.
5. A new checkout-return license is not verified when any recent cached verdict exists, because cache data is not tied to the token.
6. Checkout/price and daily license-check promises are not represented by claims entries/tests.

Additional defects: 200% text causes 497 px content width at a 390 px viewport; 11 mobile targets are under 44 px; axe reports two moderate complementary-landmark issues; missing routes return HTTP 200; cached offline HTML loses CSP/referrer/permissions policies; and PWA install icons are incomplete.

Passing evidence: `npm test` passes 4 unit and 11 Chromium tests; the exact production build passes; post-build claim assertions pass; npm audit reports 0 vulnerabilities; normal use is same-origin/local-first; keyboard placement, visible focus, reduced motion, demo reset/isolation, SVG export, rate limiting, service-worker update check, and offline reload pass. Live mobile Lighthouse scores are 100/100/100/100 with LCP 1.7 s, TBT 0 ms, and CLS 0. The verification endpoint first returned 429 on burst request 31 with `Retry-After: 4`.

Full reproduction steps, evidence, severity, and required fixes are in `.factory/verification.md`.

---

# Previous builder handoff

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
