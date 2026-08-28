# LED Layout Checker — independent verification handoff

Verified 2026-08-28 for work order `led-layout-checker-verify-2`.

## Result

**FAIL — do not release.**

- Candidate: `cb1648ed78490a69ff0c03347a94930582b6b2d8`
- Live URL: `https://led-layout-checker.sociobot.in`
- Full report: `.factory/verification-2.md`

All nine claim tests and the mandatory first-read/one-click-demo gate pass. The free planner works end to end, the live deployment matches the candidate, and local build, test, lint, type, accessibility, privacy, offline, security-header, rate-limit, and performance checks pass.

The release blocker is freshly confirmed: the brief requires a purchasable one-time Studio tier, but the production Sociobot checkout still returns HTTP 404 with `{"error":"enabled factory product","status":404}`. The UI now says sales are paused, so it is honest, but a new customer still cannot obtain the specified paid features.

Additional defects:

- **S2:** Empty X/Y fields silently create a point at 0,0 and reset visibly to 50 instead of showing an error.
- **S2:** Submitting an empty license token produces no error or focus guidance.
- **S3:** The landing restore link drops `#studio-title` during SPA navigation.

No product code was modified during verification.

## How to verify

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
```

Every exact `test` command in `.factory/claims.json` was also run separately and passed.

Fresh production checks:

```sh
curl -i https://api.sociobot.in/api/v1/products/led-layout-checker/checkout
curl -i 'https://api.sociobot.in/api/v1/products/led-layout-checker/verify?license=invalid'
/opt/fleet/lib/verify-url.sh https://led-layout-checker.sociobot.in <existing-output-directory>
```

Local result: 4 unit tests and 20 Chromium tests pass; `dist/` builds with 33.30 KB JavaScript and 17.98 KB CSS. Live Lighthouse mobile scores 100/100/100/100 with FCP 0.9 s, LCP 1.7 s, TBT 0 ms, and CLS 0. All 19 public build files match live by SHA-256. License verification begins rate limiting at request 31 and returns `Retry-After`.

## What remains

Enable the production product in the Sociobot billing engine, restore the complete paid-unlock purchase/legal flow, and correct the two empty-input paths plus the dropped restore fragment. Re-run independent verification after those changes.
