# Independent product verification — FAIL

Verified 2026-08-28 for work order `led-layout-checker-verify-3`.

- Candidate: `320fc79d9f143e22f5bfc7edc914b7ac8cae38e2`
- Live URL: `https://led-layout-checker.sociobot.in`
- Artifact: static web/PWA
- Decision: **FAIL — do not release**

The previous deployment-only billing failure is fixed: the live Sociobot checkout now returns `303` to hosted Dodo checkout. The candidate otherwise meets the product contract in fresh local and deployed checks. It still fails the non-negotiable accessibility gate: a normal four-segment plan creates a keyboard-inaccessible scroll region in the live preflight results.

## Release-blocking defect

### S1 — Preflight results become inaccessible to keyboard users as a plan grows

On a fresh live desktop `/demo` at 1280×720, add one ordinary segment using the documented keyboard path:

1. Choose **Segment**.
2. Place points at `0,0` and `100,100`.
3. Choose **Finish segment**.

The preflight result `<ul class="check-list">` then has `clientHeight: 420`, `scrollHeight: 461`, `overflow-y: auto`, no `tabindex`, and no focusable child. The later results cannot be reached or scrolled with the keyboard. Fresh Axe 4.10.2 reports `scrollable-region-focusable` at **serious** impact for `.check-list` (WCAG 2.1.1 / 2.1.3). This violates the supplied requirement for zero serious/critical Axe findings and keyboard operation of every interactive outcome.

The clean three-segment sample does not overflow, which is why the existing Axe test passes; the failure appears in a routine core workflow. Add a regression that creates enough results to overflow, then make the region keyboard reachable (or remove the constrained scroll region) before re-verification.

## Mandatory first-read and demo gate — PASS

Cold live first read plainly answers all three questions:

- **What:** “Plan LED strips before you solder.”
- **For whom:** “For hobbyists building large LED art who need clear data paths and power assumptions.”
- **First action:** **Try it with sample data**, with “See a checked 480-pixel arch.”

At 1280×720, audience/action/third fact end at y=423/485/599; at 390×844 they end at y=473/535/669. One click opens `/demo` with the 480-pixel garden arch, 11.5 A, two warnings, and the persistent demo banner with Reset demo and Start for real.

## Claims gate — PASS

From the clean candidate after `npm ci`, every exact command in `.factory/claims.json` was run separately before broader QA and passed:

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `sample-preflight` | PASS | 11.5 A and two named warnings |
| `preflight-rules` | PASS | all five documented rule families |
| `svg-export` | PASS | labeled SVG includes plan, estimate, safety note |
| `local-only` | PASS | demo edit/export stays same-origin |
| `demo-sandbox` | PASS | reset and real-plan isolation |
| `offline-reload` | PASS | `/demo` reloads offline with sample |
| `studio-license` | PASS | recorded valid license enables controller/summary |
| `daily-license-check` | PASS | one verification across two reloads |
| `studio-checkout` | PASS | $12 one-time hosted checkout redirect |

## Clean-candidate quality gates — PASS

| Gate | Result |
| --- | --- |
| `npm ci` | PASS; 141 packages installed |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 4 Vitest + 23 Chromium tests |
| `npm run build` | PASS; `dist/` created |

Production output is 34.91 KB JavaScript raw / 11.51 KB gzip and 18.35 KB CSS raw / 4.80 KB gzip, within the static-product budgets. There are no remote fonts or runtime third-party scripts.

## Independent live-product evidence

Passed on fresh live browser contexts:

- Sample computes 11.5 A and shows the two stated power warnings; changing Supply A to 12 V flags the voltage mismatch; Reset demo restores the garden-arch sample.
- SVG export contains `Garden arch — 480 pixels`, `11.5 A estimate`, and `Not electrical advice`.
- Empty X/Y fields announce “Use coordinates from 0 to 100. Enter both X and Y.”, focus X, and set `aria-invalid`; boundary points `0,0` and `100,100` create a segment with those exact coordinates.
- 390×844 has no horizontal overflow and no visible target below 44×44 px. Skip link is first and moves focus to main.
- Reduced motion hides all three data-path `animateMotion` elements. Normal routes create no console or page errors.
- Clean-route Axe scans on `/`, `/demo`, `/privacy`, and `/terms` have no violations. The dynamic results-overflow scenario above is the release-blocking exception.
- Normal demo planning/export makes no cross-origin request. Plans remain local; no analytics was observed.
- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200; unknown routes return the designed 404 page with HTTP 404. All discovered product links work; checkout returns 303 to `checkout.dodopayments.com`.

No sign-in or AI feature exists or is needed for this deterministic local planner. This is not a library, CLI, or backend product.

## PWA, policies, deployment identity, and performance

- Live PWA service worker is active at `/sw.js`, cache `led-layout-checker-v7`, with no waiting/installing worker after `registration.update()`. `/demo` reloads offline with its sample and no errors.
- Root has CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. Hashed JS is `max-age=31536000, immutable`; `sw.js` is `no-cache`; unversioned art is one day.
- All 19 publicly served production files are byte-for-byte SHA-256 matches to this candidate build. `staticwebapp.config.json` is correctly host-only and returns the designed 404 if requested. `index.html` SHA-256 is `4ac191dafd756a78eb2d1de0cef742c0dac34527be18371042d44d61738a4058` locally and live.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0, total transfer 159 KiB.

## Billing API rate limit — PASS

A 60-request rapid burst to `GET /api/v1/products/led-layout-checker/verify?license=qa-rate-limit-invalid` yielded 30 HTTP 200 responses then 30 HTTP 429 responses. The rate-limited response includes `Retry-After: 1`. A post-window request with the production Origin header returned 200, CORS allowed the product origin, and the expected invalid-license JSON. Observed threshold: 30 requests/window from this verifier IP.

## Required next step

Fix the serious dynamic Axe violation in the preflight check list and add a regression that overflows it. Then rerun all claims and full deployed QA. No product code was modified during this verification.
