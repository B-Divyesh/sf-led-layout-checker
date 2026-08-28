# LED Layout Checker — repair handoff

## Release verdict: ready

Repaired 2026-08-28 for work order `led-layout-checker-repair-3`, from verifier report commit `5c3fcc92367888751fd4234abb824ccea2263f71` and candidate `320fc79d9f143e22f5bfc7edc914b7ac8cae38e2`.

The only release blocker in `.factory/verification-3.md` is fixed. A normal fourth segment made the 420 px preflight list overflow without a keyboard focus target. The list now has an accessible name and participates in the normal Tab order. Its existing high-contrast `:focus-visible` treatment applies when reached. The PWA build id is `v1.0.3`, and the shell cache is `led-layout-checker-v8` so installed clients receive the repair.

## Exact regression coverage

`tests/claims.spec.ts` now reproduces the verifier's workflow at 1280×720:

1. Open the clean `/demo` sample.
2. Choose Segment and place `0,0` and `100,100` through the keyboard coordinate controls.
3. Finish the fourth segment.
4. Assert the preflight result list really overflows and retains `overflow-y: auto`.
5. Focus the preceding canvas, press Tab, and assert the named preflight list receives focus.
6. Press End and assert the list scroll position increases.
7. Run Axe on that dynamic state and require zero violations.

The regression passes locally. The repaired live state measured `clientHeight: 420`, `scrollHeight: 461`, `overflowY: auto`, `tabIndex: 0`, and `scrollTop: 41` after End. Live Axe returned no violations. Before the repair, the same reproduction measured `tabIndex: -1`, zero focusable descendants, and Axe reported serious `scrollable-region-focusable`.

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

Final clean results:

- `npm ci`: 141 packages installed; audit found 0 vulnerabilities.
- ESLint and TypeScript: pass.
- `npm test`: 4 Vitest tests and 24 Chromium tests pass.
- All nine exact commands in `.factory/claims.json` pass independently.
- Production build: `dist/index.html` exists; JavaScript is 34.95 KB raw / 11.53 KB gzip; CSS is 18.35 KB raw / 4.80 KB gzip.
- Factory URL verification against the production preview: pass in 537 ms; one h1, `lang=en`, main landmark, complete alt text, labeled buttons, and no console errors.
- Local Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.0 s, TBT 0 ms, CLS 0, total transfer 159 KiB.
- Azure Static Web Apps emulator: `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route and `/staticwebapp.config.json` return the designed 404 with HTTP 404. CSP, HSTS, Referrer-Policy, `nosniff`, Permissions-Policy, immutable hashed-asset caching, and `sw.js` no-cache policy are present.
- No package/consumer test applies because this remains a Vite static web/PWA, not a published package.

The existing test suite continues to cover desktop, 390×844 mobile, keyboard-only placement, 200% text reflow, 44 px targets, route semantics and titles, input errors, saved-state recovery, SVG and parts downloads, license flows, demo isolation, same-origin privacy, reduced motion, offline reload, and service-worker policy preservation. The audited landing copy and researched brief were not changed.

## Deployment and live evidence

- Repair commit `8691dd5` was pushed to `origin/main` before deployment.
- Azure Static Web Apps deployment `ec72fac3-6f9e-420a-8002-8af34b3bc2d2` succeeded on the existing Central US app. The artifact remained `static-web`, deployed from `dist/`.
- Custom URL: <https://led-layout-checker.sociobot.in>. The factory live verifier passed in 781 ms with no console errors.
- All 19 publicly served production files match the local build byte-for-byte. `index.html` SHA-256 is `df45f930e5715b0eab59d3e208477069a79186b044cca6c95ff7bd62f8c80def`; app JavaScript is `f1efc5479a1b3899dbee90dd4988af1f9bae5cbc1858c427f4719e8e609123e3`; `sw.js` is `95db31b49d61de281c5d44f98f5acc017e468b518a7cd52738b22e236e68494b`.
- Live `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route and the host-only config path return the designed HTTP 404.
- Live root responses include CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. Hashed assets use one-year immutable caching; `sw.js` uses no-cache.
- The live dynamic overflow regression is keyboard reachable and scrollable, with zero Axe violations, zero console errors, and zero cross-origin requests during planning.
- At 390×844 there is no horizontal overflow and no visible target below 44×44 px. At simulated 200% text, `scrollWidth = clientWidth = 390`. Reduced motion hides every data-path animation.
- Service worker `led-layout-checker-v8` is activated with no waiting or installing worker. It is the only product cache and reloads the edited demo offline.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0, total transfer 159 KiB.
- The live Studio checkout still returns HTTP 303 to hosted Dodo checkout. Billing code and policy were unchanged.

## Known gaps

None.
