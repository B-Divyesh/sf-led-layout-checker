# LED Layout Checker — repair handoff

Repaired 2026-08-28 for work order `led-layout-checker-repair-2` from verifier report commit `59c3668d48859d3d449786b72132a3b336def7b6` and candidate `cb1648ed78490a69ff0c03347a94930582b6b2d8`.

## What changed

- Registered and enabled the production **LED Layout Checker Studio** product in the Sociobot billing engine at **$12 USD once**. The public catalog now lists the product, and checkout redirects to the hosted Dodo checkout.
- Restored the Studio purchase actions, exact price, one-time language, free-tier boundary, merchant-of-record terms, refund behavior, privacy link, terms link, and existing-license restore path.
- Replaced the paused-sales claim with a tested hosted-checkout claim. The locked second-controller action now moves focus to the Studio section and its working purchase action.
- Rejects empty X or Y coordinate fields before numeric conversion. The first invalid field receives focus and `aria-invalid`, while an announced message explains the valid range. No point is added.
- Marks the license token as required and describes the expected value. Empty submission makes no request, announces a recovery instruction, marks the field invalid, and returns focus to it.
- Preserves query strings and fragments during SPA navigation. The restore link retains `/planner#studio-title`, scrolls to the Studio section, and focuses its heading.
- Advanced the service-worker shell to `led-layout-checker-v7`, so existing clients receive the repaired UI instead of retaining the prior shell.
- Added exact Playwright regressions for all verifier findings and retained every previously passing behavior.

## Billing evidence

- Production provider product: `pdt_0NmNnueOK0wMSO1IfUvYZ`, non-recurring, USD 1200.
- Sociobot product identity: slug `led-layout-checker`, name `LED Layout Checker Studio`, price `1200 USD`, return URL `https://led-layout-checker.sociobot.in/planner`, enabled in live mode.
- `GET https://api.sociobot.in/api/v1/products` includes the product and its checkout URL.
- `GET https://api.sociobot.in/api/v1/products/led-layout-checker/checkout` returns HTTP 303 to `checkout.dodopayments.com`; the resulting hosted checkout returns HTTP 200.
- Invalid-license verification still returns HTTP 200 with `{ "valid": false, "reason": "invalid" }`.
- A live paid transaction was not created because that would make a real production charge. Checkout-return token handling is covered by the recorded-response browser tests.

## Local verification

Run with Node 22 and Playwright 1.58.2:

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm test
npm run build
```

Results:

- `npm ci`: 141 packages installed; audit reports 0 vulnerabilities.
- ESLint and TypeScript: pass.
- `npm test`: 4 Vitest tests and 23 Chromium tests pass.
- All nine commands in `.factory/claims.json` pass independently from the installed tree.
- Production build: `dist/index.html` exists; JavaScript is 34.91 KB raw / 11.51 KB gzip; CSS is 18.35 KB raw / 4.80 KB gzip.
- Factory URL verifier against the local production preview: pass in 540 ms with one h1, `lang=en`, a main landmark, complete alt text, and no console errors.
- Local Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.91 s, LCP 1.66 s, TBT 17 ms, CLS 0.
- Browser coverage includes desktop 1280×720, mobile 390×844, keyboard operation, 200% text reflow, 44 px targets, all route titles/landmarks, axe, privacy traffic, offline reload, service-worker update, reduced motion, downloads, persistence, demo isolation, and license flows.

## Deployment and live verification

- Repair commit `ec0b414` was pushed to `origin/main` before deployment.
- Azure Static Web Apps deployment `9a942e26-b7f9-4776-abcb-368fa9821822` succeeded on the existing Central US app and custom domain.
- All 19 public build files match live byte-for-byte by SHA-256. Live `index.html` SHA-256: `4ac191dafd756a78eb2d1de0cef742c0dac34527be18371042d44d61738a4058`.
- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return HTTP 200. An unknown path returns the designed HTTP 404 page.
- Root responses include CSP, HSTS, Referrer-Policy, nosniff, and Permissions-Policy. Hashed JS/CSS use one-year immutable caching, unversioned art uses one day, and `sw.js` uses no-cache.
- Factory live URL verification passes in 842 ms with no console errors.
- At 1280×720 and 390×844, all required first-screen content remains above the fold at y=599 and y=669. There is no horizontal overflow.
- At 390 px, every visible interactive target is at least 44×44 CSS px. At simulated 200% text, `scrollWidth = clientWidth = 390`.
- Live regressions pass for empty coordinates, empty licenses, restore fragments, locked-controller focus, keyboard operation, and the working checkout link.
- Live axe scans on `/`, `/demo`, `/privacy`, and `/terms` report zero violations. Planning and SVG export make zero cross-origin requests.
- Reduced motion stops the spark and smooth scrolling. Service worker `led-layout-checker-v7` activates with no waiting worker, reloads `/demo` offline, and preserves CSP, referrer, permissions, and nosniff headers.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.90 s, LCP 1.65 s, TBT 4 ms, CLS 0, total transfer 151,850 bytes.

## Known gaps

None. The artifact remains a static Vite + TypeScript PWA deployed from `dist/`.
