# LED Layout Checker — polish round 2 handoff

## Outcome

All 22 cumulative findings from `.factory/review-1.md` and `.factory/review-2.md` are fixed. No severity was deferred.

- Repair commit: `18b07f2a1c76280fb7f9bfecdb73a220e87bf803`
- Deployment id: `1639b661-75b7-4f21-887d-1356e18f5138`
- Live site: <https://led-layout-checker.sociobot.in>
- Artifact: static Vite/TypeScript site in `dist/`
- Finding-by-finding evidence: `.factory/polish-2.md`

Round 2 closes F-2-1 by replacing one 25-word README test sentence with three sentences of 9, 6, and 9 words. The verb-first catalog description is 94 characters. All round-1 product fixes remain active: isolated demo licenses and plans, service-worker-safe 404s, pointer and keyboard selection, portable plan JSON, route metadata and focus, legal/payment copy, mobile reflow, and the routed-light visual identity.

## Exact verification

From clean clone `/tmp/led-layout-claims.cbFSPU` at repair commit `18b07f2a1c76280fb7f9bfecdb73a220e87bf803` after `npm ci`:

- Every one of the 15 exact `.factory/claims.json` commands passed independently.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed: 4 Vitest tests and 33 Playwright Chromium tests.
- `npm audit --audit-level=high` passed with zero vulnerabilities.
- `npm run build` produced `dist/index.html`.

Build output:

- JavaScript: 42.38 KB raw / 13.61 KB gzip.
- CSS: 19.01 KB raw / 4.95 KB gzip.
- No external font or runtime script.

After deployment:

- Factory URL verifier: HTTP 200, 871 ms load, expected title and language, one h1, a main landmark, complete image/button names, and zero console errors.
- Fresh Playwright contexts: 60 checks passed for the landing page, demo, `/planner`, `/privacy`, `/terms`, and the designed 404.
- Axe: zero violations on every real route, the demo, and the 404.
- Mobile 390 px: required first-screen content fits; all visible targets are at least 44 px; 200% text causes no horizontal overflow.
- Demo: one-click `/?demo=1`, persistent banner, reset/exit actions, 480 pixels, 11.5 A, and two warnings. Editing left real plan/license sentinels byte-identical.
- Privacy: the normal sample/edit/reset flow made no cross-origin requests.
- Offline/routing: valid routes use the cached shell offline; unknown routes return HTTP 404 before and after service-worker installation.
- Metadata/focus: every route has its expected title, description, canonical and social metadata; SPA navigation and browser back focus the destination h1.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, TBT 0 ms, CLS 0.
- Security: production serves CSP, HSTS, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options: nosniff`.
- Billing: the production checkout endpoint returned HTTP 303 to hosted Dodo checkout.
- Deployment identity: live JavaScript SHA-256 equals local `dist` at `91a66ee0b1e61ce2074b3832e7698df9acca2d76575f0b5f5d7fdf66e85c0f9d`.

Evidence is under `.factory/evidence/polish-2/`.

## Run locally

```sh
npm ci
npm test
npm run build
npm run dev
```

Open <http://localhost:5173>. The isolated sample is <http://localhost:5173/?demo=1>.

## Known gaps and next steps

None. The cumulative review now has zero unresolved findings.
