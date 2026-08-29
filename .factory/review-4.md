# Adversarial first-read review 4 — LED Layout Checker

Reviewed 2026-08-29 for work order led-layout-checker-review-4.

- Candidate: 1b33d6e5309e248fe3409a52fa987876b4906655
- Live URL: https://led-layout-checker.sociobot.in
- Fresh contexts: Chromium at 390×844 and 1280×720
- Verdict: **PASS**
- Findings: **0** (blocking: 0; minor: 0)

This was a full re-review, not a diff review. There are no untested claims and no finding to assign an F-4-k id.

## Cold first read

Before scrolling, in both fresh contexts: this plans and checks addressable LED-strip layouts before soldering; it is for hobbyists building large LED art; click **Try it with sample data** first.

Exact first-screen evidence:

- “Plan LED strips before you solder”
- “For hobbyists building large LED art who need clear data paths and marked power points.”
- “Try it with sample data” and “Open a checked 480-pixel arch.”
- “Plans stay in this browser.”, “Works offline after your first visit.”, and “Core planning and SVG export are free.”

At 390 px, action and all three facts were above the fold; scrollWidth equalled clientWidth (390). The desktop showed the same information without scrolling. Neither context logged a console or page error. The routed-light artwork and cutting-mat visual system follow .factory/design.md and are visibly product-specific rather than a generic SaaS template.

## Copy audit

Word counts treat a hyphenated term, price, URL, and inline-code token as one word. Headings and actions are included because assistive technology exposes them. No item is over 22 words. No banned marketing adjective, unexplained jargon, inconsistent core term, metaphor-only heading, or non-result-naming button was found.

### Landing page

| Copy | Words |
| --- | ---: |
| Check addressable LED art before building | 6 |
| Plan LED strips before you solder | 6 |
| For hobbyists building large LED art who need clear data paths and marked power points. | 15 |
| Try it with sample data | 5 |
| Open a checked 480-pixel arch. | 5 |
| Plans stay in this browser. | 5 |
| Works offline after your first visit. | 6 |
| Core planning and SVG export are free. | 7 |
| Trace data from the controller to the last pixel. | 9 |
| Layout preview | 2 |
| See data, current, and power on one plan | 8 |
| Draw the shape. | 3 |
| Set pixel counts. | 3 |
| Mark power points. | 3 |
| The checks update as you work. | 6 |
| Start a blank plan | 4 |
| How it works | 3 |
| From sketch to labeled plan | 5 |
| Draw the paths | 3 |
| Click along each strip in its real data order. | 9 |
| Add power details | 3 |
| Add pixel counts, supplies, and power points. | 7 |
| Check and export | 3 |
| Resolve warnings, then download a labeled SVG. | 7 |
| Clear limits | 2 |
| A planning check, not electrical approval | 6 |
| Current figures use your pixel count, brightness, and supply details. | 10 |
| Confirm wire size, fusing, voltage drop, and mains work with qualified guidance. | 12 |
| Studio license | 2 |
| Plan larger builds for $12 once | 6 |
| Studio adds multiple controllers and a parts summary. | 8 |
| Checks and labeled SVG export stay free. | 7 |
| Checkout runs through Sociobot. | 4 |
| Dodo is the merchant of record and handles payment and refunds. | 11 |
| Buy Studio | 2 |
| Restore a license | 3 |
| Plan LED paths before soldering. | 5 |
| Hero imagery was generated for this product. | 7 |

### README

| Sentence | Words |
| --- | ---: |
| Plan addressable LED paths, trace data direction, estimate current, and mark power points before soldering. | 14 |
| It is for hobbyists planning large art made with addressable LED strips. | 12 |
| The checker is a planning tool, not electrical advice or firmware control. | 12 |
| Draws and saves multi-point LED segments in data order with pointer or keyboard controls. | 12 |
| Places, names, saves, and removes controllers, supplies, and power points. | 10 |
| Recalculates segment and total current from pixel count, current per pixel, and brightness. | 12 |
| Flags missing controllers, missing power points, long strips powered only at one end, low supply headroom, and voltage mismatches. | 19 |
| Updates layout checks as the plan changes. | 7 |
| Exports a labeled SVG and an editable version 1 plan JSON. | 11 |
| Imports valid plan JSON after a replacement preview and rejects malformed files without changing the plan. | 15 |
| Works offline after the first visit. | 5 |
| Plans use local browser storage. | 5 |
| Demo plans and licenses use separate demo: keys and never read or change real data. | 14 |
| Open /?demo=1 to load a 480-pixel garden arch. | 7 |
| It has three segments, one controller, two supplies, an 11.5 A estimate, and two warnings. | 15 |
| Reset demo restores the sample and clears demo licenses. | 9 |
| Start for real clears every demo key and opens your saved plan, or a blank plan if you have none. | 20 |
| The free planner includes layout checks and labeled SVG export. | 10 |
| Studio adds multiple controllers and a text parts summary for a $12 one-time purchase. | 14 |
| Checkout runs through Sociobot. | 4 |
| Dodo is the merchant of record and handles payment and refunds. | 11 |
| Existing license holders can restore access through the Sociobot verification service. | 10 |
| Requires Node.js 22 or newer. | 5 |
| Open http://localhost:5173. | 1 |
| The demo is at http://localhost:5173/?demo=1. | 5 |
| npm test runs calculation, claim, accessibility, offline-reload, and keyboard tests. | 9 |
| It also makes a production build. | 6 |
| The keyboard test uses a 390 px phone width. | 9 |
| npm run build writes the static site to dist/ with index.html at its root. | 14 |
| Deploy dist/ to Azure Static Web Apps. | 7 |
| public/staticwebapp.config.json provides route rewrites, the designed 404 response, cache rules, and security headers. | 12 |
| Plan data and a pasted license stay in local storage. | 10 |
| Stored real licenses contact api.sociobot.in at most once per day. | 10 |
| See /privacy and /terms in the product. | 7 |
| Current estimates depend on the values you enter. | 8 |
| Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance. | 12 |

## Demo and sandbox

One click entered /?demo=1 and immediately showed a named garden-arch plan with 480 pixels, three segments, one controller, two supplies, an 11.5 A estimate, and two named warnings. The persistent “Demo — sample data, nothing is saved to your plans.” banner included Reset demo and Start for real.

The demo-sandbox test seeded real plan/license sentinels, exercised direct demo entry, returned and pasted licenses, edits, reset, and exit. Real values remained byte-identical; demo keys were removed on exit. The demo request log for editing/export was same-origin only. Offline reload after the first visit passed.

## Claims and quality gates

After npm ci, npm test, npm run lint, npm run typecheck, and npm run build all passed and dist/ was produced. Every exact command in .factory/claims.json then passed separately:

| Claim id | Result |
| --- | --- |
| sample-preflight | PASS |
| preflight-rules | PASS |
| segment-authoring | PASS |
| source-placement | PASS |
| current-estimates | PASS |
| live-checks | PASS |
| svg-export | PASS |
| plan-json-roundtrip | PASS |
| plan-json-rejection | PASS |
| local-only | PASS |
| demo-sandbox | PASS |
| offline-reload | PASS |
| studio-license | PASS |
| daily-license-check | PASS |
| studio-checkout | PASS |

Live landing and README claims map to the manifest; no unlisted material claim was found. The checkout link followed through the Sociobot endpoint to a 200 Dodo hosted checkout page. No AI feature is warranted for this deterministic local planner. Editable JSON import/export supplies the implied portable-plan workflow.

## Structure, accessibility, and links

Live checks confirmed unique route titles, one h1 per route, descriptions, canonicals, OG/Twitter metadata, lang, favicon, manifest, sitemap, robots, and a designed HTTP 404. /, /planner, /demo, /privacy, and /terms returned 200. A cold unknown route and an unknown route after service-worker control returned the designed page with HTTP 404.

Back navigation focused the new h1 and updated the polite route announcement. Header/footer, skip link, Privacy, and Terms were present on every route. All discovered internal links, checkout redirect, and Param Factory link resolved successfully. Fresh Axe scans at 390 px on landing, demo, planner, privacy, terms, and 404 reported zero violations.

## Earlier-history confirmation

Every earlier review, polish record, verification record, and handoff was read. Each earlier finding was verified in code and on the live site:

| Earlier finding | Current evidence |
| --- | --- |
| F-1-1 demo license isolation | Demo-prefixed plan/license/cache keys; sentinel test, reset, and exit pass. |
| F-1-2 controlled 404 | Service worker allows known routes only; controlled unknown navigation is 404. |
| F-1-3 Select | SVG hit testing and keyboard selector both select an item. |
| F-1-4 merchant wording | Public wording consistently names Dodo as merchant of record. |
| F-1-5 Start for real | Docs/live exit restore saved plan or blank plan. |
| F-1-6 sample claim | Manifest/test assert all displayed sample facts. |
| F-1-7 segment authoring | Tagged pointer/keyboard order and persistence test passes. |
| F-1-8 source placement | Tagged placement/naming/persistence/removal test passes. |
| F-1-9 current calculation | Tagged input/formula test passes. |
| F-1-10 live checks | Tagged no-reload warning-update test passes. |
| F-1-11 refund revocation | Unsupported promise is absent; payment wording is tested. |
| F-1-12 route metadata | Route metadata map updates all required values. |
| F-1-13 cold 404 | 404 has metadata, icons, complete footer, version, and return route. |
| F-1-14 preflight jargon | Public copy uses check/layout preview, not preflight. |
| F-1-15 power terminology | Public copy uses power point consistently. |
| F-1-16 preview heading | It now names data, current, and power. |
| F-1-17 power heading | It now says Add power details. |
| F-1-18 README jargon | README uses concrete strip/controller/supply language. |
| F-1-19 keyboard wording | README uses short plain test sentences; mobile path passes. |
| F-1-20 fallback docs | README describes explicit rewrites and a designed 404. |
| F-1-21 portable project | Versioned JSON import/export, preview, recovery, undo, and tests exist. |
| F-2-1 copy cap | Former 25-word sentence is split; all current text is at or below 22 words. |
| Verification-3 S1 overflow | Results list is keyboard-focusable/scrollable and Axe passes. |

## What would make this perfect

No corrective product work is identified. Preserve the demo isolation, claim tests, copy discipline, and controlled-404 regression when changing storage, service worker, billing, copy, or routing.

