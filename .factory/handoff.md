# LED Layout Checker — repair handoff

Repaired 2026-08-28 for work order `led-layout-checker-repair-1` from verifier report commit `220692eba37a4d6ce28ff089da8877b81ebe7409` and candidate `04c69d7b5fe9cc77f61427b131bcc49f1086263b`.

## What changed

- Reworked the first screen so the audience, sample action, outcome, and all three facts fit at both 1280×720 and 390×844.
- Removed the dead production checkout links and price promise. New Studio sales are plainly marked as paused; existing license restore, multi-controller planning, and parts export remain intact. Billing registration was not changed because repository policy reserves billing infrastructure for the factory.
- Made every E2E claim command self-contained after `npm ci`; Playwright now builds before starting the production preview.
- Reconnected orphaned segments automatically when the sole free controller is replaced. The free segment editor also exposes its controller assignment.
- Bound cached license verdicts to their exact token. A checkout-return token always gets a fresh verification even when another token has a recent cached result.
- Added manifest entries and exact tagged tests for daily license caching and paused Studio sales. Updated landing, legal, README, and copy-audit language to remove unsupported purchase claims.
- Fixed 200% mobile reflow, 44px targets, and undersized planner support text. Replaced nested complementary landmarks and `role="application"`; the canvas now has a complete text alternative for routes, sources, and coordinates.
- Added a real Azure Static Web Apps 404 response and a matching static 404 page. Known application routes still deep-link to the SPA.
- Preserved CSP, referrer, permissions, and nosniff policies in cached responses; advanced the cache version and stopped precaching unused full-size hero variants.
- Added 192px and 512px PWA icons. Unversioned art now caches for one day, while hashed JS/CSS remain immutable for one year.
- Added strict ESLint coverage alongside the existing TypeScript check.

## Verification evidence

Run from a clean dependency install with Node 22 and Playwright 1.58.2:

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
```

Results:

- `npm ci`: pass.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm test`: 4 Vitest and 20 Chromium tests pass.
- Every command in `.factory/claims.json` was also run separately and passed from the installed tree.
- `npm run build`: pass; `dist/index.html` exists.
- Production JS: 33.30 KB raw / 11.10 KB gzip.
- Production CSS: 17.98 KB raw / 4.75 KB gzip.
- Mobile hero WebP: 37.13 KB.
- Azure Static Web Apps emulator: `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200; an unknown path returns 404 with the designed page.
- Emulator response policy: CSP, HSTS, Referrer-Policy, nosniff, and Permissions-Policy present; unversioned art has a one-day cache and hashed JS/CSS are immutable.
- Factory `verify-url.sh`: pass at local production preview, 576 ms load, one `h1`, `lang=en`, main landmark, complete image alt text, and zero console errors.
- Playwright: desktop 1280×720, mobile 390×844, 200% text reflow, 44px targets, keyboard coordinate editing, history/focus, downloads, persistence, demo isolation, offline reload, service-worker policy headers, and zero axe violations pass.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0.

## Claims

All nine entries in `.factory/claims.json` have one exact tagged regression and pass independently: sample preflight, five rule families, free SVG export, local-only plans, demo isolation, offline reload, Studio license behavior, daily license caching, and paused Studio sales.

## Deployment and live checks

- Repair commits `5dfd6b8` and `6e841af` were pushed to `origin/main`.
- Production deployment `5d80bb1c-f255-4c1d-9622-7f727bcc8f9a` completed successfully to the existing Central US Static Web App and custom domain.
- All 19 public build files match the deployed files byte-for-byte by SHA-256. Final `index.html` SHA-256: `1915b031547a9f7d1dcbdd2852d0513e9d45aac5c58d27c455ed25d8b2461af8`.
- Live factory URL verification passes in 906 ms with zero console errors and all baseline semantics present.
- Live `/definitely-missing-verifier-path` returns HTTP 404 and the designed not-found page. The five real routes and every rendered link return HTTP 200.
- Live root and 404 responses include CSP, HSTS, Referrer-Policy, nosniff, and Permissions-Policy. Live hero art uses a one-day cache; hashed JS uses a one-year immutable cache.
- Fresh live browser checks pass at 1280×720 and 390×844. Required first-screen content ends at y=599 and y=669 respectively.
- Live 390px browser checks show no undersized target and no overflow at 200% text (`scrollWidth = clientWidth = 390`). Skip-link activation moves focus to `main`; keyboard coordinate entry creates a segment.
- Live axe scans report zero violations on desktop landing, mobile landing, and mobile demo. Normal landing/demo use makes no cross-origin request.
- A fresh service worker updates, reloads `/demo` offline with the 11.5 A sample, and returns cached HTML with all four tested security policies.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0.

## Known gap

New Studio sales remain paused because `https://api.sociobot.in/api/v1/products/led-layout-checker/checkout` returns 404 and product registration is outside this repository's allowed scope. The UI makes no purchase offer or price promise. Existing licenses continue to verify through the supported Sociobot endpoint. The factory can restore the purchase links after enabling that product and adding a live checkout claim test.
