# Polish round 2 — cumulative finding closure

- Repair commit: `18b07f2a1c76280fb7f9bfecdb73a220e87bf803`
- Deployment: `1639b661-75b7-4f21-887d-1356e18f5138`
- Live URL: <https://led-layout-checker.sociobot.in>
- Result: all 22 cumulative findings closed; none deferred

Every implementation from review round 1 was rechecked in a clean clone and on the deployed site. Round 2 changes the remaining README sentence and refreshes the catalog copy without changing the routed-light visual system or static artifact class.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo plans, returned or pasted licenses, and verdicts use `demo:` keys. Reset and exit clear demo keys without reading or changing real keys. | `@claim:demo-sandbox`; live storage sentinels passed in [live-check.json](evidence/polish-2/live-check.json); banner/reset shown in [mobile demo](evidence/polish-2/live-demo-mobile.png); live `/?demo=1`. |
| F-1-2 | The worker serves the app shell only for known routes and returns the designed page with status 404 for unknown routes. | `installed service worker returns the designed 404 with status 404`; cold and controlled 404 assertions in [live-check.json](evidence/polish-2/live-check.json); [live 404](evidence/polish-2/live-404.png). |
| F-1-3 | Select hit-tests paths, controllers, and supplies. The named plan-item selector provides the keyboard path and moves focus to the editor. | `Select chooses paths and sources by pointer and keyboard`; full browser suite passed; live `/demo`; [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-4 | Public copy says checkout runs through Sociobot and Dodo is merchant of record for payments and refunds. | `@claim:studio-checkout`; production endpoint returned 303 to `checkout.dodopayments.com`; pricing shown in [mobile landing](evidence/polish-2/live-landing-mobile.png). |
| F-1-5 | README says Start for real opens the saved plan, or a blank plan when none exists. | `@claim:demo-sandbox`; live demo exit is present in [mobile demo](evidence/polish-2/live-demo-mobile.png); README rechecked at repair commit. |
| F-1-6 | The declared sample covers 480 pixels, three segments, one controller, two supplies, 11.5 A, and two warnings. | `@claim:sample-preflight`; live values passed in [live-check.json](evidence/polish-2/live-check.json); [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-7 | Multi-point segment authoring works through pointer and keyboard controls and persists point order. | `@claim:segment-authoring`; live planner loads at `/planner`; authoring controls shown in [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-8 | Controllers, supplies, and power points can be placed, named, saved, and removed. | `@claim:source-placement`; full browser suite passed; live `/planner`; [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-9 | Current recalculates from pixel count, current per pixel, and brightness. | `@claim:current-estimates`; clean-clone claim command passed; live baseline 11.5 A in [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-10 | Rendered checks update immediately when the plan changes. | `@claim:live-checks`; clean-clone claim command passed; live checks shown in [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-1-11 | The unsupported refund-revocation promise was removed. Accurate payment and refund responsibility remains. | `@claim:studio-checkout`; repository search and copy audit; live pricing section in [mobile landing](evidence/polish-2/live-landing-mobile.png). |
| F-1-12 | Each SPA route updates title, description, canonical, Open Graph, and Twitter metadata. | `each route updates title, description, canonical, and social metadata`; five live route metadata assertions in [live-check.json](evidence/polish-2/live-check.json); [desktop landing](evidence/polish-2/live-landing-desktop.png). |
| F-1-13 | The cold 404 includes full metadata, icons, complete footer, build id, provenance, and a return path. | `static host config returns a real 404 and PWA metadata has install icons`; live HTTP 404 and zero Axe violations in [live-check.json](evidence/polish-2/live-check.json); [live 404](evidence/polish-2/live-404.png). |
| F-1-14 | “Preflight” was replaced with direct “check,” “layout preview,” and “live checks” wording. | `.factory/copy-audit.md`; live copy in [mobile landing](evidence/polish-2/live-landing-mobile.png); live `/`. |
| F-1-15 | Public copy consistently uses “power point.” | `.factory/copy-audit.md` terminology table; `@claim:source-placement`; live copy in [mobile landing](evidence/polish-2/live-landing-mobile.png). |
| F-1-16 | The preview heading says “See data, current, and power on one plan.” | `.factory/copy-audit.md`; first live section in [mobile landing](evidence/polish-2/live-landing-mobile.png); live `/`. |
| F-1-17 | The how-it-works heading says “Add power details.” | `.factory/copy-audit.md`; live step 2 in [mobile landing](evidence/polish-2/live-landing-mobile.png); live `/`. |
| F-1-18 | README uses addressable-strip, planning-tool, powered-at-one-end, spare-current, and wrong-voltage language. | `@claim:preflight-rules`; README at repair commit; the matching plain limits copy is visible in [mobile landing](evidence/polish-2/live-landing-mobile.png). |
| F-1-19 | README describes “a keyboard-only workflow at a 390 px phone width” in plain terms. | `planner works at 390px and has a keyboard placement path`; no overflow and 44 px targets in [live-check.json](evidence/polish-2/live-check.json); [200% mobile demo](evidence/polish-2/live-demo-mobile-200pct.png). |
| F-1-20 | README accurately describes explicit route rewrites and the designed 404 rather than a catch-all fallback. | `static host config returns a real 404 and PWA metadata has install icons`; live cold/controlled 404 checks in [live-check.json](evidence/polish-2/live-check.json); [live 404](evidence/polish-2/live-404.png). |
| F-1-21 | Version 1 plan JSON export/import validates the file, previews replacement, preserves fidelity, rejects malformed input, restores focus, and supports undo. | `@claim:plan-json-roundtrip` and `@claim:plan-json-rejection`; both exact clean-clone commands passed; live import control appears in [mobile demo](evidence/polish-2/live-demo-mobile.png). |
| F-2-1 | Split the 25-word README test description into three sentences of 9, 6, and 9 words. Updated the copy audit. | `.factory/copy-audit.md`; `npm run lint`, `npm run typecheck`, and `npm test` passed in the clean clone; deployed asset identity is recorded below. |

## Verification evidence

- Clean clone: `/tmp/led-layout-claims.cbFSPU` at `18b07f2a1c76280fb7f9bfecdb73a220e87bf803`, initially zero changed files.
- Claims: all 15 exact commands from `.factory/claims.json` passed independently after `npm ci`.
- Full clean-clone gates: lint and typecheck passed; 4 Vitest tests and 33 Playwright Chromium tests passed; audit reported zero vulnerabilities.
- Build: `dist/index.html`; JavaScript 42.38 KB raw / 13.61 KB gzip; CSS 19.01 KB raw / 4.95 KB gzip.
- Live verifier: HTTP 200, 871 ms load, correct title/lang, one h1/main, complete alt/button names, and zero console errors. See [report](evidence/polish-2/verify-url/verify.json).
- Live browser audit: 60 assertions passed across first-screen fit, demo isolation/reset, privacy traffic, targets, reflow, route metadata, focus, legal links, Axe, console, and both 404 paths. See [report](evidence/polish-2/live-check.json).
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, total blocking time 0 ms, CLS 0. See [report](evidence/polish-2/lighthouse.json).
- Production headers include CSP, HSTS, Referrer-Policy, Permissions-Policy, and `nosniff`.
- Production checkout returned HTTP 303 to hosted Dodo checkout.
- Deployed JavaScript SHA-256 matches local `dist`: `91a66ee0b1e61ce2074b3832e7698df9acca2d76575f0b5f5d7fdf66e85c0f9d`.
- Catalog description is verb-first and 94 characters excluding its newline.

Unresolved findings: **none**.
