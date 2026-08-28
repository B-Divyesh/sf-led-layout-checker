# Adversarial first-read review 3 — LED Layout Checker

Reviewed 2026-08-28 for work order `led-layout-checker-review-3`.

- Candidate: `3d051ccb548f55b72d30a8ae8cfd0688edf14946`
- Live URL: <https://led-layout-checker.sociobot.in>
- Browser: fresh Chromium contexts at 390×844 and 1440×900
- Verdict: **PASS**
- Findings: **0**
- Untested claims: **0**

The product is clear on first read, opens a realistic isolated sample in one click, and passes every declared claim test. No prior finding regressed, no live or README claim is missing from the claim manifest, and no structure, routing, accessibility, privacy, or copy finding remains.

## Cold first read — PASS

Before scrolling, in my own words:

| Question | 390 px phone | 1440 px desktop |
| --- | --- | --- |
| What does this do? | It plans LED-strip paths and checks current and power points before soldering. | It plans LED-strip paths and checks current and power points before soldering. |
| For whom? | Hobbyists building large LED art. | Hobbyists building large LED art. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

Exact first-screen evidence:

- Headline: “Plan LED strips before you solder”
- Audience: “For hobbyists building large LED art who need clear data paths and marked power points.”
- Primary action: “Try it with sample data,” followed by “Open a checked 480-pixel arch.”
- Facts: “Plans stay in this browser.”, “Works offline after your first visit.”, and “Core planning and SVG export are free.”
- At 390×844, the third fact ended at y=683. At 1440×900, it ended at y=632.
- Both loads returned HTTP 200 with no console error. No scrolling was used for this assessment.

## Copy audit — PASS

Counting method: contractions, hyphenated compounds, prices, URLs, and inline-code spans count as one word. The tables include every prose sentence plus headings and visible actions. Code blocks are commands, not sentences. No item exceeds 22 words. No jargon, banned marketing adjective, inconsistent core term, metaphor-only heading, empty slogan, or non-result-naming action was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| LED Layout Checker | 3 | product name |
| Planner | 1 | route name |
| Demo | 1 | route name |
| Privacy | 1 | route name |
| Check addressable LED art before building | 6 | plain context |
| Plan LED strips before you solder | 6 | job-first h1 |
| For hobbyists building large LED art who need clear data paths and marked power points. | 15 | audience and outcome |
| Try it with sample data | 5 | result-naming action |
| Open a checked 480-pixel arch. | 5 | `sample-preflight` |
| Plans stay in this browser. | 5 | `local-only` |
| Works offline after your first visit. | 6 | `offline-reload` |
| Core planning and SVG export are free. | 7 | `svg-export`, `studio-license` |
| Trace data from the controller to the last pixel. | 9 | `segment-authoring`, `source-placement` |
| Layout preview | 2 | section name |
| See data, current, and power on one plan | 8 | section heading |
| Draw the shape. | 3 | `segment-authoring` |
| Set pixel counts. | 3 | `current-estimates` |
| Mark power points. | 3 | `source-placement` |
| The checks update as you work. | 6 | `live-checks` |
| Start a blank plan | 4 | result-naming action |
| 480 pixels | 2 | `sample-preflight` |
| 11.5 A estimate | 3 | `sample-preflight` |
| 2 checks | 2 | `sample-preflight` |
| How it works | 3 | section name |
| From sketch to labeled plan | 5 | section heading |
| Draw the paths | 3 | step heading |
| Click along each strip in its real data order. | 9 | `segment-authoring` |
| Add power details | 3 | step heading |
| Add pixel counts, supplies, and power points. | 7 | `current-estimates`, `source-placement` |
| Check and export | 3 | step heading |
| Resolve warnings, then download a labeled SVG. | 7 | `svg-export` |
| Clear limits | 2 | section name |
| A planning check, not electrical approval | 6 | concrete limit heading |
| Current figures use your pixel count, brightness, and supply details. | 10 | `current-estimates` |
| Confirm wire size, fusing, voltage drop, and mains work with qualified guidance. | 12 | safety instruction |
| Studio license | 2 | section name |
| Plan larger builds for $12 once | 6 | `studio-checkout` |
| Studio adds multiple controllers and a parts summary. | 8 | `studio-license` |
| Checks and labeled SVG export stay free. | 7 | `preflight-rules`, `svg-export` |
| Checkout runs through Sociobot. | 4 | `studio-checkout` |
| Dodo is the merchant of record and handles payment and refunds. | 11 | `studio-checkout` |
| $12 | 1 | `studio-checkout` |
| one-time purchase | 2 | `studio-checkout` |
| Buy Studio | 2 | result-naming action |
| Restore a license | 3 | result-naming action |
| Plan LED paths before soldering. | 5 | footer summary |
| Terms | 1 | route name |
| Built by Param Factory | 4 | attribution link |
| Hero imagery was generated for this product. | 7 | provenance |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| LED Layout Checker | 3 | heading |
| Plan addressable LED paths, trace data direction, estimate current, and mark power points before soldering. | 14 | plain summary |
| It is for hobbyists planning large art made with addressable LED strips. | 12 | audience |
| The checker is a planning tool, not electrical advice or firmware control. | 11 | limit |
| Live site: https://led-layout-checker.sociobot.in | 3 | link label |
| One-click demo: https://led-layout-checker.sociobot.in/?demo=1 | 3 | demo entry |
| What it does | 3 | heading |
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
| Demo | 1 | heading |
| Open `/?demo=1` to load a 480-pixel garden arch. | 8 | `sample-preflight` |
| It has three segments, one controller, two supplies, an 11.5 A estimate, and two warnings. | 16 | `sample-preflight` |
| Reset demo restores the sample and clears demo licenses. | 8 | `demo-sandbox` |
| Start for real clears every demo key and opens your saved plan, or a blank plan if you have none. | 20 | `demo-sandbox` |
| Studio license | 2 | heading |
| The free planner includes layout checks and labeled SVG export. | 10 | `preflight-rules`, `svg-export` |
| Studio adds multiple controllers and a text parts summary for a $12 one-time purchase. | 15 | `studio-license`, `studio-checkout` |
| Checkout runs through Sociobot. | 4 | `studio-checkout` |
| Dodo is the merchant of record and handles payment and refunds. | 11 | `studio-checkout` |
| Existing license holders can restore access through the Sociobot verification service. | 11 | `studio-license` |
| Develop | 1 | heading |
| Requires Node.js 22 or newer. | 5 | requirement |
| Open http://localhost:5173. | 2 | instruction |
| The demo is at http://localhost:5173/?demo=1. | 5 | instruction |
| Test and build | 3 | heading |
| `npm test` runs calculation, claim, accessibility, offline-reload, and keyboard tests. | 9 | test scope |
| It also makes a production build. | 6 | test scope |
| The keyboard test uses a 390 px phone width. | 9 | test scope |
| `npm run build` writes the static site to `dist/` with `index.html` at its root. | 14 | build output |
| Deploy `dist/` to Azure Static Web Apps. | 7 | deployment instruction |
| `public/staticwebapp.config.json` provides route rewrites, the designed 404 response, cache rules, and security headers. | 13 | deployment detail |
| Privacy and limits | 3 | heading |
| Plan data and a pasted license stay in local storage. | 11 | `local-only`, `daily-license-check` |
| Stored real licenses contact `api.sociobot.in` at most once per day. | 11 | `daily-license-check` |
| See `/privacy` and `/terms` in the product. | 7 | legal links |
| Current estimates depend on the values you enter. | 9 | `current-estimates` |
| Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance. | 12 | safety instruction |
| License | 1 | heading |
| MIT. | 1 | license statement |
| See LICENSE. | 2 | license link |

Terminology is consistent: **segment**, **power point**, **check**, **plan JSON**, **labeled SVG**, **Studio**, and **demo**. There are no copy flags and therefore no rewrites to propose.

## Demo and sandbox — PASS

From a fresh phone context, the first landing action opened `/?demo=1` in one click. The first resulting screen already showed “Garden arch — 480 pixels,” 480 pixels, 11.5 A, and two warnings. The persistent banner read “Demo — sample data, nothing is saved to your plans.” and exposed **Reset demo** and **Start for real**.

I seeded a real plan and real license/cache sentinels before entering the demo. Editing the demo created only `demo:led-layout-checker:layout:v1`. SVG export worked. **Reset demo** restored the garden arch. **Start for real** restored the seeded real plan, left all real keys byte-identical, and removed all `demo:` keys.

The Playwright request log for landing, demo edit, export, reset, and exit contained only `https://led-layout-checker.sociobot.in`. A fresh service-worker-controlled demo then reloaded offline with the sample and 11.5 A result present. No analytics, CDN font, external script, or plan-data request was observed. The optional license call remains a documented explicit exception.

## Claims — PASS

I cloned the repository locally without hard links into `/tmp/led-layout-review3.T1kh8R`, checked out the supplied base commit, ran `npm ci`, and ran every exact command from `.factory/claims.json` separately. All 15 passed.

| Claim | Exact command | Result and observed evidence |
| --- | --- | --- |
| `sample-preflight` | `npm run test:e2e -- --grep @claim:sample-preflight` | PASS — sample totals, segment/source counts, and two named warnings |
| `preflight-rules` | `npm run test:unit -- -t @claim:preflight-rules` | PASS — all five documented warning families |
| `segment-authoring` | `npm run test:e2e -- --grep @claim:segment-authoring` | PASS — pointer and keyboard paths persist in data order |
| `source-placement` | `npm run test:e2e -- --grep @claim:source-placement` | PASS — controllers, supplies, and power points save and remove |
| `current-estimates` | `npm run test:e2e -- --grep @claim:current-estimates` | PASS — pixels, per-pixel current, and brightness recalculate totals |
| `live-checks` | `npm run test:e2e -- --grep @claim:live-checks` | PASS — warning state updates without reload |
| `svg-export` | `npm run test:e2e -- --grep @claim:svg-export` | PASS — labeled SVG contains the sample and estimate |
| `plan-json-roundtrip` | `npm run test:e2e -- --grep @claim:plan-json-roundtrip` | PASS — versioned plan restores and can be undone |
| `plan-json-rejection` | `npm run test:e2e -- --grep @claim:plan-json-rejection` | PASS — malformed input preserves the current plan |
| `local-only` | `npm run test:e2e -- --grep @claim:local-only` | PASS — normal planning/export traffic stays same-origin |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS — seeded real plan/license values remain unchanged |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — seeded demo reloads offline |
| `studio-license` | `npm run test:e2e -- --grep @claim:studio-license` | PASS — fixture license enables a second controller and parts export |
| `daily-license-check` | `npm run test:e2e -- --grep @claim:daily-license-check` | PASS — one stored-license check per day |
| `studio-checkout` | `npm run test:e2e -- --grep @claim:studio-checkout` | PASS — $12 redirect and exact merchant disclosure |

Cross-checking the live landing page and README against the manifest found no unlisted claim. The live checkout link returned HTTP 303 to `checkout.dodopayments.com`, consistent with the tested disclosure.

## Earlier findings — all fixed

I read both earlier reviews, both polish reports, and the previous handoff. Each earlier finding was checked against the current live site and code, not its reported status.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 — demo license storage | Live seeded sentinels remained byte-identical; `licenseKeys()` selects demo-prefixed keys and `clearDemoStorage()` removes them. |
| F-1-2 — service-worker 404 | An unknown live path returned HTTP 404 after service-worker activation and showed the designed 404. |
| F-1-3 — dead Select control | Live Select hit-testing and the keyboard selector work; the code binds both paths. |
| F-1-4 — inaccurate merchant statement | Landing, planner, Terms, README, and checkout test identify only Dodo as merchant of record. |
| F-1-5 — inaccurate Start for real README copy | README now says it opens the saved plan or a blank plan; live exit restored the seeded saved plan. |
| F-1-6 — unlisted sample claim | `sample-preflight` lists and verifies every displayed sample count. |
| F-1-7 — unlisted segment-authoring claim | `segment-authoring` lists and verifies pointer and keyboard multi-point authoring. |
| F-1-8 — unlisted source-placement claim | `source-placement` lists and verifies placing, naming, saving, and removal. |
| F-1-9 — unlisted current-estimation claim | `current-estimates` lists and verifies all stated inputs. |
| F-1-10 — unlisted live-update claim | `live-checks` lists and verifies an update without reload. |
| F-1-11 — unsupported refund-revocation claim | That promise is absent; the remaining merchant/refund wording is covered by `studio-checkout`. |
| F-1-12 — stale route social metadata | All five live routes update title, description, canonical, OG, and Twitter metadata. |
| F-1-13 — incomplete cold 404 | The 404 has its own metadata, one h1/main, icon links, footer, attribution, version, and return link. |
| F-1-14 — “Preflight” jargon | Public copy consistently uses “check”; repository copy audit and live text contain no “Preflight.” |
| F-1-15 — inconsistent power-location terms | Landing, planner, claims, and README consistently use “power point.” |
| F-1-16 — vague preview heading | The live heading is “See data, current, and power on one plan.” |
| F-1-17 — ambiguous power heading | The live step heading is “Add power details.” |
| F-1-18 — README hardware jargon | README uses concrete addressable-strip, controller, supply, and wrong-voltage wording. |
| F-1-19 — compressed keyboard-test jargon | README now uses three short test sentences; the mobile keyboard test passes. |
| F-1-20 — inaccurate fallback documentation | README accurately names route rewrites and the designed 404; no catch-all fallback is claimed. |
| F-1-21 — missing portable project format | Live planner exposes versioned JSON import/export; both round-trip and rejection claims pass. |
| F-2-1 — 25-word README sentence | It is split into 9-, 6-, and 9-word sentences, all re-counted above. |

The polish-1 and polish-2 reports contain no separate deferred finding outside this list. The previous handoff’s “Known gaps and next steps: None” is consistent with the live and clean-clone evidence.

## Structure, accessibility, and visual identity — PASS

- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return HTTP 200 with the expected route-specific title, one h1, one main landmark, description, canonical, OG/Twitter title, favicon, consistent header/footer, and Privacy/Terms links.
- SPA navigation moves focus to the planner h1. Browser Back restores `/` and focuses its h1.
- A missing path returns HTTP 404 before and after service-worker control. Its h1 is “This path does not connect,” it has a return link, and Axe reports no violation.
- Every discovered unique link was crawled. Internal routes and `sociobot.in` returned 200; the Studio link returned the intended 303 hosted-checkout redirect. No link was dead.
- `robots.txt`, `sitemap.xml`, and the 1200×630 social image return 200. The apple-touch icon is 180×180.
- Live Axe scans report zero violations on all five real routes and the 404. Normal routes log no console or page errors.
- The clean-clone `npm test` run passed 4 unit tests, the build, and 33 Playwright tests. `npm run lint` and `npm audit --audit-level=high` also passed.
- The build produced `dist/`; JavaScript is 42.38 KB raw and 13.61 KB gzip. CSS is 19.01 KB raw and 4.95 KB gzip.
- The visual identity is specific to this product: dark cutting-mat green, plotting-paper surfaces, mint routed paths, coral power branches, amber nodes, clipped labels, and locally served generated routing art. It does not use a generic centered gradient hero or three-card SaaS layout and matches `.factory/design.md`.
- Motion has a visible pause control and a reduced-motion rule; visible controls meet the tested 44 px target and the 390 px layout passes at 200% text.

## Missed leverage — none found

The brief calls for deterministic layout planning. The product already provides the obvious high-value additions: editable JSON import/export and labeled SVG export. Sync would conflict with the stated local-first model. An AI step would add key handling, disclosure, cost, and nondeterminism without improving the core electrical-planning checks. No decorative AI or embedded provider key exists.

## What would make this perfect

Nothing remains under this review’s stated acceptance standard. The product has zero findings, zero untested claims, and no concrete missing feature implied by the brief.
