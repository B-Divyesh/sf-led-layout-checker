# Adversarial first-read review 2 — LED Layout Checker

Reviewed 2026-08-28 for work order `led-layout-checker-review-2`.

- Candidate: `f8c6b02d242d922b18ac6649a8c0907c6d84597b`
- Live URL: <https://led-layout-checker.sociobot.in>
- Browser: fresh Chromium contexts at 390×844 and 1280×720
- Verdict: **FAIL**
- Findings: **1 minor**; no blocking finding

This review was run from scratch, including the demo, every declared claim command from a fresh local clone, the installed service worker path, routes, links, metadata, copy, and prior-review regressions. The product clears the cold first-read and demo gates. It does not meet the required zero-finding standard because one README sentence exceeds the plain-words 22-word hard cap.

## Cold first read — PASS

Before scrolling, in my own words:

| Question | 390 px phone | 1280 px desktop |
| --- | --- | --- |
| What does this do? | It lets someone plan LED-strip paths and check current and power before soldering. | It lets someone plan LED-strip paths and check current and power before soldering. |
| For whom? | Hobbyists making large LED art. | Hobbyists making large LED art. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

Exact above-the-fold evidence was the h1 “Plan LED strips before you solder,” the audience sentence “For hobbyists building large LED art who need clear data paths and marked power points.”, and **Try it with sample data** beside “Open a checked 480-pixel arch.” The three facts ended at y=683 of 844 on phone and y=599 of 720 on desktop. There was no horizontal overflow or load console error.

## Finding

### Minor

### F-2-1 — README test description exceeds the copy hard cap

- Location/quote: `README.md`, **Test and build**: “`npm test` runs calculation tests, a production build, claim tests, accessibility checks, an offline reload, and a keyboard-only workflow at a 390 px phone width.”
- Evidence: 25 words under the repository’s stated counting method. The plain-words contract has a hard 22-word sentence limit.
- Why this fails: this is developer-facing copy, but it still asks the reader to hold six test categories and a viewport qualification in one sentence. The stated cap exists to make the documentation scannable on a first pass.
- Concrete fix: replace it with “`npm test` runs calculation, claim, accessibility, offline-reload, and keyboard tests. It also makes a production build. The keyboard test uses a 390 px phone width.”

## Demo and sandbox — PASS

The first landing action enters `/?demo=1` in one click. Its first screen already contains the usable Garden arch plan with 480 pixels, 11.5 A, and two warnings. The persistent banner reads “Demo — sample data, nothing is saved to your plans.” and exposes **Reset demo** and **Start for real**.

In a fresh context, editing the demo created only `demo:led-layout-checker:layout:v1`; no real layout key appeared. **Reset demo** restored “Garden arch — 480 pixels.” Code confirms layout and license key selection branches on `demoMode`, and `clearDemoStorage()` removes every `demo:` layout/license key. The `@claim:demo-sandbox` test also seeds real plan and license sentinels, exercises a return token, reset, edit, and exit, and asserts the real keys remain byte-identical.

Normal demo edit/export request logging observed only `https://led-layout-checker.sociobot.in`. No analytics, font CDN, or other third-party runtime request was observed. The optional license action is the documented exception and is explicitly routed only to `api.sociobot.in` when a visitor supplies a token.

## Claims — PASS

I made a fresh local clone, ran `npm ci`, and then ran every exact command listed in `.factory/claims.json` separately. All 15 commands passed.

| Claim | Result |
| --- | --- |
| `sample-preflight` | PASS — sample totals, sources, segments, and warnings |
| `preflight-rules` | PASS — all five documented warning families |
| `segment-authoring` | PASS — pointer and keyboard multi-point paths persist in order |
| `source-placement` | PASS — controller, supply, and power-point placement/removal |
| `current-estimates` | PASS — pixels, per-pixel current, and brightness recalculate totals |
| `live-checks` | PASS — resolving a power-point warning updates without reload |
| `svg-export` | PASS — labeled SVG download contains the plan and estimate |
| `plan-json-roundtrip` | PASS — versioned editable project restores and undoes |
| `plan-json-rejection` | PASS — malformed project does not replace the plan |
| `local-only` | PASS — planning/export traffic remains same-origin |
| `demo-sandbox` | PASS — real plan/license sentinels are isolated |
| `offline-reload` | PASS — seeded demo reloads offline after first visit |
| `studio-license` | PASS — fixture license enables a second controller and parts summary |
| `daily-license-check` | PASS — one stored-license verification per day |
| `studio-checkout` | PASS — $12 fixture checkout redirect and merchant disclosure |

The live checkout endpoint independently returned HTTP 303 to `checkout.dodopayments.com`. The visible price, merchant/refund disclosure, current estimates, storage, offline behavior, sample numbers, Studio behavior, SVG and JSON actions are covered by the declared claim families. Apart from F-2-1, no unlisted material landing or README claim was found.

## Copy audit

Counting method: contractions, hyphenated compounds, prices, URLs, and inline-code spans each count as one word. Headings and actions are included because a screen-reader user encounters them as copy. `F-2-1` is the only >22-word item; no banned marketing adjective, inconsistent core term, metaphor-only heading, or non-result-naming button was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Check addressable LED art before building | 6 | pass |
| Plan LED strips before you solder | 6 | pass |
| For hobbyists building large LED art who need clear data paths and marked power points. | 15 | pass |
| Try it with sample data | 5 | pass |
| Open a checked 480-pixel arch. | 5 | pass |
| Plans stay in this browser. | 5 | `local-only` |
| Works offline after your first visit. | 6 | `offline-reload` |
| Core planning and SVG export are free. | 7 | `svg-export`, `studio-license` |
| Trace data from the controller to the last pixel. | 9 | `segment-authoring`, `source-placement` |
| Layout preview | 2 | pass |
| See data, current, and power on one plan | 8 | pass |
| Draw the shape. | 3 | `segment-authoring` |
| Set pixel counts. | 3 | `current-estimates` |
| Mark power points. | 3 | `source-placement` |
| The checks update as you work. | 6 | `live-checks` |
| Start a blank plan | 4 | pass |
| 480 pixels | 2 | `sample-preflight` |
| 11.5 A estimate | 3 | `sample-preflight` |
| 2 checks | 2 | `sample-preflight` |
| How it works | 3 | pass |
| From sketch to labeled plan | 5 | pass |
| Draw the paths | 3 | pass |
| Click along each strip in its real data order. | 9 | `segment-authoring` |
| Add power details | 3 | pass |
| Add pixel counts, supplies, and power points. | 7 | `current-estimates`, `source-placement` |
| Check and export | 3 | pass |
| Resolve warnings, then download a labeled SVG. | 7 | `svg-export` |
| Clear limits | 2 | pass |
| A planning check, not electrical approval | 6 | pass |
| Current figures use your pixel count, brightness, and supply details. | 10 | `current-estimates` |
| Confirm wire size, fusing, voltage drop, and mains work with qualified guidance. | 12 | pass |
| Studio license | 2 | pass |
| Plan larger builds for $12 once | 6 | `studio-checkout` |
| Studio adds multiple controllers and a parts summary. | 8 | `studio-license` |
| Checks and labeled SVG export stay free. | 7 | `preflight-rules`, `svg-export` |
| Checkout runs through Sociobot. | 4 | `studio-checkout` |
| Dodo is the merchant of record and handles payment and refunds. | 11 | `studio-checkout` |
| $12 | 1 | `studio-checkout` |
| one-time purchase | 2 | `studio-checkout` |
| Buy Studio | 2 | pass |
| Restore a license | 3 | pass |
| Plan LED paths before soldering. | 5 | pass |
| Hero imagery was generated for this product. | 7 | provenance |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| LED Layout Checker | 3 | pass |
| Plan addressable LED paths, trace data direction, estimate current, and mark power points before soldering. | 14 | pass |
| It is for hobbyists planning large art made with addressable LED strips. | 12 | pass |
| The checker is a planning tool, not electrical advice or firmware control. | 11 | pass |
| Live site: https://led-layout-checker.sociobot.in | 3 | pass |
| One-click demo: https://led-layout-checker.sociobot.in/?demo=1 | 3 | pass |
| What it does | 3 | pass |
| Draws and saves multi-point LED segments in data order with pointer or keyboard controls. | 14 | `segment-authoring` |
| Places, names, saves, and removes controllers, supplies, and power points. | 10 | `source-placement` |
| Recalculates segment and total current from pixel count, current per pixel, and brightness. | 12 | `current-estimates` |
| Flags missing controllers, missing power points, long strips powered only at one end, low supply headroom, and supplies with the wrong voltage. | 21 | `preflight-rules` |
| Updates layout checks as the plan changes. | 7 | `live-checks` |
| Exports a labeled SVG and an editable version 1 plan JSON. | 11 | `svg-export`, `plan-json-roundtrip` |
| Imports valid plan JSON after a replacement preview and rejects malformed files without changing the plan. | 16 | `plan-json-roundtrip`, `plan-json-rejection` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Plans use local browser storage. | 5 | `local-only` |
| Demo plans and licenses use separate `demo:` keys and never read or change real data. | 14 | `demo-sandbox` |
| Demo | 1 | pass |
| Open `/?demo=1` to load a 480-pixel garden arch. | 8 | `sample-preflight` |
| It has three segments, one controller, two supplies, an 11.5 A estimate, and two warnings. | 16 | `sample-preflight` |
| **Reset demo** restores the sample and clears demo licenses. | 8 | `demo-sandbox` |
| **Start for real** clears every demo key and opens your saved plan, or a blank plan if you have none. | 20 | `demo-sandbox` |
| Studio license | 2 | pass |
| The free planner includes layout checks and labeled SVG export. | 10 | `preflight-rules`, `svg-export` |
| Studio adds multiple controllers and a text parts summary for a $12 one-time purchase. | 15 | `studio-license`, `studio-checkout` |
| Checkout runs through Sociobot. | 4 | `studio-checkout` |
| Dodo is the merchant of record and handles payment and refunds. | 11 | `studio-checkout` |
| Existing license holders can restore access through the Sociobot verification service. | 11 | `studio-license` |
| Develop | 1 | pass |
| Requires Node.js 22 or newer. | 5 | pass |
| Open http://localhost:5173. | 2 | pass |
| The demo is at http://localhost:5173/?demo=1. | 5 | pass |
| Test and build | 3 | pass |
| `npm test` runs calculation tests, a production build, claim tests, accessibility checks, an offline reload, and a keyboard-only workflow at a 390 px phone width. | 25 | **F-2-1** |
| `npm run build` writes the static site to `dist/` with `index.html` at its root. | 14 | pass |
| Deploy `dist/` to Azure Static Web Apps. | 7 | pass |
| `public/staticwebapp.config.json` provides route rewrites, the designed 404 response, cache rules, and security headers. | 13 | pass |
| Privacy and limits | 3 | pass |
| Plan data and a pasted license stay in local storage. | 11 | `local-only`, `daily-license-check` |
| Stored real licenses contact `api.sociobot.in` at most once per day. | 11 | `daily-license-check` |
| See `/privacy` and `/terms` in the product. | 7 | pass |
| Current estimates depend on the values you enter. | 9 | `current-estimates` |
| Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance. | 12 | pass |
| License | 1 | pass |
| MIT. | 1 | pass |
| See LICENSE. | 2 | pass |

Terminology remains consistent: **segment**, **power point**, **check**, **plan JSON**, **labeled SVG**, **Studio**, and **demo**.

## Prior findings — all fixed

Every finding in `.factory/review-1.md`, `.factory/polish-1.md`, `.factory/verification.md`, `.factory/verification-2.md`, `.factory/verification-3.md`, and `.factory/verification-4.md` was rechecked on the live site and against the candidate code. No prior id is repeated as a regression.

| Earlier id or issue | Confirmation |
| --- | --- |
| F-1-1 demo license isolation | Demo-specific plan and license keys are selected in `licenseKeys()`; reset/exit clear demo keys; claim test seeds real sentinels. |
| F-1-2 / verification routing 404 | Cold unknown URL and unknown URL after service-worker activation both returned HTTP 404 with “This path does not connect.” |
| F-1-3 Select control | Select now hit-tests SVG items and the keyboard selector focuses the matching editor field. |
| F-1-4 merchant wording | Landing, Studio panel, Terms, and README consistently name Dodo as merchant of record. |
| F-1-5 Start-for-real copy | README and privacy text correctly say saved plan, or blank plan when none exists. |
| F-1-6 through F-1-11 claims gaps | The sample, authoring, source placement, recalculation, live checks, checkout and licensing behaviors now have tagged manifest entries and tests. |
| F-1-12 through F-1-13 metadata/404 | Route metadata changes with navigation; the designed cold 404 carries canonical, social metadata, icon, and complete footer. |
| F-1-14 through F-1-20 wording and configuration | “Preflight” was replaced with “check”; power-point terms are consistent; headings are concrete; README routing language matches individual rewrites. |
| F-1-21 portable project | Versioned plan JSON export/import, preview, recovery message, and round-trip/rejection claims are present. |
| Verification controller recovery and new-token check | Replacing the sole controller reconnects missing assignments; returned token verification cache is token-bound. |
| Verification accessibility/reflow/targets/canvas | Current live Axe scan produced zero violations; 390 px content did not overflow, targets meet 44 px, and plan geometry has a text alternative. |
| Verification PWA headers/assets | Cache v9 preserves browser policy headers, caches only the compact hero variant, provides install icons, and reloads demo offline. |
| Verification-3 scrollable checks | The overflowing results list is tabbable and scrolls with End; the dynamic Axe regression test passes. |

## Structure, routing, and visual identity — PASS

- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` expose the expected route titles, one h1, main landmark, description, canonical, OG/Twitter metadata, favicon, header, footer, skip link, and Privacy/Terms links. SPA navigation moves focus to the destination h1 and uses browser history.
- The direct unknown route returned a designed HTTP 404 with a return link. The service worker preserves that status after it has been installed.
- Live links were checked: internal links resolve to the relevant application routes, the checkout endpoint returns HTTP 303 to Dodo, and the Param Factory link resolves externally. No dead in-scope link was found.
- The visual system is distinct: the phone page uses cutting-mat green, bone plotting paper, routed mint/coral geometry, deliberately clipped panels, and a non-generic editor preview rather than a generic SaaS hero/card layout. It matches `.factory/design.md` and the hero is locally served original generated art with disclosed provenance.
- No normal-route console or page error occurred. The only observed console 404 corresponded to the intentional unknown-route HTTP 404.

## Missed leverage — none found

The brief calls for a deterministic local planning tool. It already supplies the obvious portable-plan import/export and labeled SVG output. AI assistance would not improve the stated calculation/check workflow enough to justify a key, data-sharing explanation, or an optional provider surface. Sync would conflict with the documented local-first privacy model and is not implied by the brief.

## What would make this perfect

Make the F-2-1 README sentence three short sentences, then repeat this full review. With that single copy correction verified, the current product would have no remaining finding from this checklist.
