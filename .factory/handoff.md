# LED Layout Checker — polish round 1 handoff

## Outcome

All 21 findings from `.factory/review-1.md` are fixed and deployed at <https://led-layout-checker.sociobot.in>. The full finding-to-change-to-evidence map is in `.factory/polish-1.md`.

Repair commit: `74261d1`

Deployment id: `e5640888-db15-4851-b71a-074a9a0207d5`

Artifact: static Vite/TypeScript site in `dist/`

The routed-light visual identity is unchanged. The repair adds real demo license isolation, a direct `/?demo=1` entry, service-worker-safe 404 behavior, working pointer/keyboard selection, portable editable plan JSON, full route metadata, exact payment language, and plain public copy.

## Verification

From a fresh clone of `74261d1` after `npm ci`:

- Every one of the 15 exact commands in `.factory/claims.json` passed independently.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed: 4 Vitest tests and 33 Playwright Chromium tests.
- `npm audit --audit-level=high` passed with 0 vulnerabilities.
- `npm run build` produced `dist/index.html`.

Build output:

- JavaScript: 42.38 KB raw / 13.61 KB gzip.
- CSS: 19.01 KB raw / 4.95 KB gzip.
- No external font or runtime script.

Live verification after deployment:

- Factory `verify-url.sh`: 200 response, 1,940 ms load, correct title/lang, one h1, main landmark, complete alt/button names, zero console errors.
- Live Playwright + Axe: zero violations on `/`, `/planner`, `/?demo=1`, `/privacy`, `/terms`, and the 404.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, TBT 0 ms, CLS 0.
- Mobile 390 px at 200% text: no horizontal overflow and no visible target below 44 px.
- Demo flow: 480 pixels, 3 segments, 1 controller, 2 supplies, 11.5 A, and 2 warnings. Real plan/license sentinels stayed byte-identical through return-token verification, editing, reset, JSON import, and exit.
- Offline: service-worker-controlled `/demo` reloaded with the sample. Unknown paths returned the designed 404 with status 404 after worker installation.
- Privacy: normal demo editing made no cross-origin request. License calls remain explicit and go only to `api.sociobot.in`.
- Checkout: production returned 303 to hosted Dodo checkout.
- Deployment identity: live JavaScript SHA-256 matches `dist` at `91a66ee0b1e61ce2074b3832e7698df9acca2d76575f0b5f5d7fdf66e85c0f9d`.

Evidence is under `.factory/evidence/polish-1/`.

## Run locally

```sh
npm ci
npm test
npm run build
npm run dev
```

Open <http://localhost:5173>. The isolated sample is <http://localhost:5173/?demo=1>.

## Known gaps and next steps

None. No finding of any severity remains open.
