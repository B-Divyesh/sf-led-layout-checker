# Polish round 1 — finding closure

Candidate repair: `74261d1`

Deployed: <https://led-layout-checker.sociobot.in>

Deployment id: `e5640888-db15-4851-b71a-074a9a0207d5`

Every finding in `.factory/review-1.md` is closed. Screenshots are cold captures from the deployed site after the repair.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added demo-only plan, license, and verdict keys. `/?demo=1`, pasted licenses, checkout returns, reset, and exit never touch real keys. Exit removes every `demo:` key. | `@claim:demo-sandbox` seeds byte-exact real sentinels and exercises the whole flow. Live flow passed. [Mobile demo](evidence/polish-1/live-demo-mobile.png). |
| F-1-2 | Service worker v9 allows only real app paths. Unknown navigations return cached `404.html` with status 404; valid routes keep the offline shell. | `installed service worker returns the designed 404 with status 404`; cold and controlled live URLs both returned 404. [Live 404](evidence/polish-1/live-404.png). |
| F-1-3 | Select now hit-tests paths, controllers, and supplies. A named plan-item select provides the keyboard equivalent and moves focus to its fields. | `Select chooses paths and sources by pointer and keyboard`; repeated successfully on live `/demo`. [Import/editor view](evidence/polish-1/live-import-preview.png). |
| F-1-4 | Replaced every merchant statement with: “Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.” | `@claim:studio-checkout` asserts the exact disclosure and redirect. Live checkout returned 303 to `checkout.dodopayments.com`. |
| F-1-5 | README now says Start for real opens the saved plan, or a blank plan when none exists. | `@claim:demo-sandbox` exits to a saved sentinel plan; README and `.factory/demo.md` contain the corrected wording. |
| F-1-6 | Expanded the sample claim to cover 480 pixels, 3 segments, 1 controller, 2 supplies, 11.5 A, and 2 warnings. | `@claim:sample-preflight`; live `/?demo=1` repeated all six assertions. [Mobile demo](evidence/polish-1/live-demo-mobile.png). |
| F-1-7 | Declared and tested saved multi-point authoring through both pointer and keyboard controls. | `@claim:segment-authoring` creates two three-point paths, reloads, and checks exact coordinate order. |
| F-1-8 | Declared and tested controller, supply, and power-point placement, naming, persistence, and removal. | `@claim:source-placement` passes from a blank plan. |
| F-1-9 | Declared the estimator formula behavior and tested each user input. | `@claim:current-estimates` checks 11.5 → 12.0 → 10.0 → 12.5 A after pixel, current, and brightness changes. |
| F-1-10 | Declared live checks and verified that resolving a power point changes the rendered warning count without reload. | `@claim:live-checks` changes 2 warnings to 1 and shows the new pass result. |
| F-1-11 | Removed the unsupported refund-revocation statement. Kept the accurate, tested payment/refund responsibility disclosure. | `@claim:studio-checkout`; copy audit and repository search contain no revocation claim. |
| F-1-12 | Added a route metadata map that updates description, canonical, Open Graph, and Twitter title/description with each route. | `each route updates title, description, canonical, and social metadata`; live titles verified on `/`, `/planner`, `/?demo=1`, `/privacy`, and `/terms`. |
| F-1-13 | Completed cold 404 description, canonical, Open Graph/Twitter data, apple-touch icon, factory credit, build id, and image provenance. | `static host config returns a real 404 and PWA metadata has install icons`; live 404 Axe scan has zero violations. [Live 404](evidence/polish-1/live-404.png). |
| F-1-14 | Replaced “preflight” with “layout preview,” “live checks,” and direct check wording in public copy. | `.factory/copy-audit.md`; [desktop landing](evidence/polish-1/live-landing-desktop.png). |
| F-1-15 | Standardized the public concept to “power point” in landing, planner, checks, summary export, README, manifest, and metadata. | `.factory/copy-audit.md` terminology table; `@claim:source-placement` and `@claim:preflight-rules`. |
| F-1-16 | Rewrote the preview heading to “See data, current, and power on one plan.” | Cold live desktop and mobile captures: [desktop](evidence/polish-1/live-landing-desktop.png), [mobile](evidence/polish-1/live-landing-mobile.png). |
| F-1-17 | Rewrote “State the power” to “Add power details.” | `.factory/copy-audit.md`; cold live landing screenshots. |
| F-1-18 | Replaced README hardware and planning jargon with addressable strips, planning tool, powered-at-one-end, spare-current, and wrong-voltage wording. | README copy audit by repository search; `@claim:preflight-rules` proves the described checks. |
| F-1-19 | Rewrote the test description to “a keyboard-only workflow at a 390 px phone width.” | README; `planner works at 390px and has a keyboard placement path`. |
| F-1-20 | README now describes route rewrites and the designed 404, not an SPA fallback. | `static host config returns a real 404 and PWA metadata has install icons`; live route status checks. |
| F-1-21 | Added editable version 1 plan JSON export/import, strict schema and value validation, a replacement dialog, announced errors, focus recovery, undo, and demo-key isolation. | `@claim:plan-json-roundtrip`, `@claim:plan-json-rejection`, and `@claim:demo-sandbox`; live round trip passed. [Replacement preview](evidence/polish-1/live-import-preview.png). |

## Cumulative earlier findings

The earlier verification repairs remain covered: first-screen fit, checkout availability, self-building claim commands, controller reconnection, token-bound daily cache, 390 px/200% reflow, 44 px targets, textual canvas geometry, security headers offline, install icons, coordinate and license errors, Studio fragment focus, and keyboard-scrollable overflowing checks. `npm test` includes each regression.

## Final evidence

- Clean clone: all 15 exact `.factory/claims.json` commands passed independently after `npm ci`.
- Clean clone: `npm run lint`, `npm run typecheck`, `npm test`, and `npm audit --audit-level=high` passed; 4 unit and 33 Chromium tests.
- Live route statuses: 200 for `/`, `/planner`, `/demo`, `/?demo=1`, `/privacy`, `/terms`; 404 for unknown paths before and after service-worker control.
- Live Axe: zero violations on the five real routes plus the designed 404.
- Live mobile: no horizontal overflow at 390 px with 200% text; no visible target below 44 px; normal demo flow made zero cross-origin requests.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, TBT 0 ms, CLS 0. [JSON](evidence/polish-1/lighthouse.json).
- Factory URL verifier: title/lang/h1/main/alt/buttons pass with zero console errors. [Report](evidence/polish-1/verify-url/verify.json).
- Deployed JS SHA-256 equals local `dist`: `91a66ee0b1e61ce2074b3832e7698df9acca2d76575f0b5f5d7fdf66e85c0f9d`.

Unresolved findings: **none**.
