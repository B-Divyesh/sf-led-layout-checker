# Independent product verification — PASS

Verified 2026-08-28 for work order `led-layout-checker-verify-4`.

- Candidate: `2fb0da7f4bc71dd0f03f3156f594e1d8ac541092`
- Live URL: <https://led-layout-checker.sociobot.in>
- Artifact: static web/PWA
- Decision: **PASS — release candidate accepted**

This is a fresh independent verification. The production deployment matches the candidate and the former dynamic preflight accessibility blocker is fixed.

## First-read and demo gate — PASS

A cold live landing page says what it does in its h1: **“Plan LED strips before you solder.”** It names the audience: **“For hobbyists building large LED art who need clear data paths and power assumptions.”** The first action is the one-click **“Try it with sample data”**, with the immediate outcome “See a checked 480-pixel arch.” It also shows the three plain facts for local plans, offline use, and free core planning.

The action opens `/demo`, which immediately has the 480-pixel garden-arch plan, 11.5 A estimate, two warnings, and the persistent **Demo — sample data, nothing is saved to your plans** banner with Reset demo and Start for real. This meets the demo-sandbox contract.

## Claims gate — PASS

From the installed clean candidate (`npm ci`), every command in `.factory/claims.json` was run separately before broader QA and passed:

| Claim | Exact test result |
| --- | --- |
| `sample-preflight` | PASS — 11.5 A and the two named injection warnings |
| `preflight-rules` | PASS — controller, power point, long run, supply headroom, and voltage rules |
| `svg-export` | PASS — labeled SVG includes plan, estimate, and safety note |
| `local-only` | PASS — demo edit/export has no cross-origin traffic |
| `demo-sandbox` | PASS — reset and real-plan isolation work |
| `offline-reload` | PASS — `/demo` reloads offline after first visit |
| `studio-license` | PASS — recorded valid license enables multiple controllers and parts export |
| `daily-license-check` | PASS — no more than one check per day |
| `studio-checkout` | PASS — $12 hosted Sociobot checkout contract |

No unlisted material visitor promise was found in the landing copy, README, privacy, or terms pages. The license/privacy/checkout promises are covered by the declared claim families and live checks below.

## Local quality gates — PASS

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages, no install failure |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:unit` | PASS — 4 tests |
| `npm test` | PASS — 4 unit tests, 24 Playwright tests |
| `npm run build` | PASS — `dist/` produced |

Production output is 34.95 KB JavaScript raw / 11.53 KB gzip and 18.35 KB CSS raw / 4.80 KB gzip, inside the 200 KB JS and 50 KB CSS budgets. There are no third-party font or script dependencies.

## Independent end-to-end and accessibility evidence — PASS

- Live sample calculation showed 11.5 A and two warnings. Changing Supply A to 12 V surfaced the voltage-mismatch warning; restoring 5 V cleared it. SVG export downloaded `garden-arch-480-pixels.svg` containing the plan name, estimate, and “Not electrical advice.”
- Empty coordinate fields announce “Use coordinates from 0 to 100. Enter both X and Y.”, focus X, and set `aria-invalid=true`. Boundary coordinates 0,0 and 100,100 create the expected segment.
- The repaired routine overflow case was exercised live at 1280×720: adding the fourth segment produced `clientHeight=420`, `scrollHeight=461`, and `overflow-y=auto`; the named preflight list has `tabindex=0`, receives Tab focus from the canvas, and scrolls on End. Axe returned zero violations for this state.
- Live Axe scans returned zero violations on `/`, `/planner`, `/demo`, `/privacy`, `/terms`, and the not-found page. At 390×844, including 200% text sizing in `/demo`, `scrollWidth=clientWidth=390`; no visible interactive target was under 44 px. Reduced motion hides all three data-flow animations.
- Keyboard smoke test: the skip link is first, has a visible `3px` amber focus outline, and Enter moves focus to `<main>`. Normal routes had no console errors or page errors.

## Privacy, PWA, deployment, policies, and billing — PASS

- A whole live normal flow (landing, planner, demo edit, export, privacy, and terms) requested only `led-layout-checker.sociobot.in`; no analytics or third-party runtime request appeared. Normal plan data remains in browser storage.
- Service worker `/sw.js` is active with cache `led-layout-checker-v8`, no waiting/installing update after `registration.update()`, preserves CSP/referrer/permissions/nosniff headers in cached HTML, and reloads `/demo` offline with its sample and no errors.
- Root responses include CSP, HSTS, `strict-origin-when-cross-origin`, `nosniff`, and Permissions-Policy. Hashed JS is one-year immutable; the service worker is `no-cache`. A cold direct unknown route returns the designed HTTP 404.
- All 19 publicly served files in `dist/` match the deployed bytes by SHA-256 (including JS, CSS, images, manifest, service worker, icons, sitemap, and 404 assets). The main JS and CSS hashes also match exactly.
- The Studio checkout endpoint returns `303 Location: https://checkout.dodopayments.com/...`, not the previously reported deployment-only 404. A sequential invalid-license burst returned 200 for requests 1–30, then 429 for 31–35 with `Retry-After` (3 seconds on the first 429). Observed allowance: 30 requests per window from this verifier IP.

No sign-in, server application API, AI feature, library/CLI consumer package, or backend persistence/concurrency check applies to this deterministic static planner.

## Defects by severity

None found: no S1, S2, S3, or S4 release findings.

