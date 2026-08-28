# Adversarial first-read review 1 — LED Layout Checker

Reviewed 2026-08-28 for work order `led-layout-checker-review-1`.

- Candidate: `37278b880d18526a6cfd1c787af24764627a3ece`
- Live URL: <https://led-layout-checker.sociobot.in>
- Viewports: 390×844 and 1280×720, fresh Chromium contexts
- Verdict: **FAIL**
- Findings: **21** — 2 blocking, 9 major, 10 minor

The landing page clears the cold first-read gate and the sample is immediately useful. The product still fails because demo mode reads and writes real license storage, and an installed service worker converts missing routes from real 404 responses to 200 responses. There are also a dead editor control, unsupported claims, inaccurate payment wording, incomplete route metadata, copy problems, and a missing portable project format.

## Cold first read — PASS

Before scrolling, in my own words:

| Question | Mobile 390×844 | Desktop 1280×720 |
| --- | --- | --- |
| What does this do? | It checks an LED-strip layout before soldering. | It checks an LED-strip layout before soldering. |
| For whom? | Hobbyists making large LED art. | Hobbyists making large LED art. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

Exact first-screen evidence:

- Headline: “Plan LED strips before you solder”
- Audience: “For hobbyists building large LED art who need clear data paths and power assumptions.”
- Action: “Try it with sample data” beside “See a checked 480-pixel arch.”
- Facts: “Plans stay in this browser.”, “Works offline after your first visit.”, and “Core planning and SVG export are free.”
- Mobile: the last fact ends at y=669 in an 844 px viewport.
- Desktop: the last fact ends at y=599 in a 720 px viewport.
- No horizontal overflow or console error occurred.

## Findings

### Blocking

### F-1-1 — Demo mode reads and writes real license storage

- Location/quote: `/demo`, persistent banner: “Demo — sample data, nothing is saved to your plans.”
- Live evidence: a direct `/demo` with real keys `sb_license:led-layout-checker` and `sb_license_check:led-layout-checker` displayed “Studio active.” Opening `/demo?license=DEMO-RETURN-TOKEN` wrote that token to `sb_license:led-layout-checker` and wrote its verdict to `sb_license_check:led-layout-checker` while the demo banner remained visible.
- Code evidence: `checkStoredLicense()` and `restoreLicense()` always use `LICENSE_KEY` and `LICENSE_CACHE_KEY`; neither branches on `demoMode`. `Start for real` removes only `DEMO_KEY`.
- Why this fails: the demo sandbox must never read or write real storage while its banner is shown. Plan isolation alone is insufficient.
- Concrete fix: use demo-prefixed or in-memory license state on `/demo`; ignore real license/cache keys; prevent checkout-return tokens from entering real keys in demo; delete all demo keys on exit. Extend `@claim:demo-sandbox` to seed real plan and license sentinels, exercise direct `/demo`, license entry, checkout return, reset, and exit, then assert every real key is byte-identical.

### F-1-2 — The prior real-404 defect is only half-fixed after service-worker installation

- Prior finding: verification-1 S2, “Missing routes return HTTP 200.”
- Location: an unknown navigation after first visiting any controlled route.
- Live evidence: a fresh direct request to `/definitely-missing-review-1` returns the designed page with HTTP 404. After `/`, `/planner`, or `/demo` installs the service worker, the same navigation is served from the cached `/` shell with HTTP 200; the SPA then paints its not-found screen.
- Code evidence: `public/sw.js` returns `caches.match('/')` for every navigation without checking the pathname or network response.
- Why this fails: the fix covers only a cold server request. An ordinary returning visitor receives a false success status for a missing route, so the earlier routing defect remains half-fixed and is blocking under the history rule.
- Concrete fix: list the valid SPA paths in the worker. Serve the shell only for those paths. Cache the designed 404 and return it with status 404 for unknown offline paths; when online, preserve the host’s 404 response. Add a Playwright regression that first installs the worker, then navigates to an unknown URL and asserts `response.status() === 404` and the designed h1.

### Major

### F-1-3 — “Select” is a visible editor control with no behavior

- Location/quote: `/planner` and `/demo`, tool rail button “Select.”
- Live evidence: with “Arch left” active, choose **Select** and tap the visible right arch. The active dropdown and `.selected` segment remain `seg-arch-left`; there is no message. The handler returns immediately whenever `activeTool === 'select'`.
- Why this fails: a first-time visitor reasonably expects this tool to select a drawn segment or source. A dead primary editor control makes correction discoverability unreliable.
- Concrete fix: implement hit testing so tapping/clicking a segment, controller, or supply selects it and exposes its fields, with an equivalent keyboard list; otherwise remove the Select tool and state that selection happens in the “Segment” dropdown. Add pointer and keyboard tests.

### F-1-4 — The landing page gives an inaccurate merchant statement

- Location/quote: landing pricing, planner Studio panel, and Terms: “Sociobot and Dodo are the merchant of record.”
- Contradiction: README correctly says, “Checkout runs through Sociobot, with Dodo as merchant of record.” The live checkout redirects to `checkout.dodopayments.com`.
- Why this fails: two organizations cannot both be described as “the merchant of record” when the documentation identifies Dodo as that party. Payment responsibility is material purchasing information.
- Concrete fix: use “Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds.” everywhere. Update the checkout claim test to assert this exact disclosure.

### F-1-5 — README promises a blank plan when Start for real can open saved data

- Location/quote: README Demo section: “Start for real removes the demo copy and opens a blank plan.”
- Live evidence: with a real plan named `REAL PLAN SENTINEL`, **Start for real** removed the demo key and opened that saved real plan. The declared demo claim test expects this behavior.
- Why this fails: the sentence is false for returning users and contradicts the product’s correct preservation of real data.
- Concrete fix: rewrite it as “Start for real removes the demo copy and opens your saved plan, or a blank plan if you have none.”

### F-1-6 — The realistic sample composition is an unlisted claim

- Locations/quotes: landing “See a checked 480-pixel arch.” README: “Open `/demo` to load a 480-pixel garden arch.” and “It includes three segments, one controller, two supplies, and two power warnings.”
- Gap: `sample-preflight` asserts 11.5 A and two named warnings, but its manifest claim does not list or test the 480-pixel total or the 3/1/2 composition.
- Why this fails: these concrete numbers are promises a visitor can rely on, but they have no claims entry covering all of them.
- Concrete fix: expand `sample-preflight` in `.factory/claims.json` and its tagged test to assert 480 pixels, three segments, one controller, two supplies, 11.5 A, and two warnings.

### F-1-7 — Drawing multi-point LED segments is an unlisted claim

- Locations/quotes: landing “Draw the shape.” and README “Draws multi-point LED segments in data order.”
- Gap: no `.factory/claims.json` entry covers creating, finishing, and preserving an arbitrary multi-point segment.
- Why this fails: this is the core job, yet the claims gate cannot prove that a visitor can create and recover a real path.
- Concrete fix: add a `segment-authoring` claim and tagged test that creates a three-point segment through pointer and keyboard paths, then reloads and confirms its order and coordinates.

### F-1-8 — Placing controllers, supplies, and power points is an unlisted claim

- Locations/quotes: landing “Mark power entry points.” and “Add pixel counts, supplies, and injection points.” README: “Places controllers and power supplies on the plan.”
- Gap: no manifest entry covers placing and preserving both source types and a power point. Existing untagged regression coverage is not a claims entry.
- Why this fails: a visitor cannot tell from the claims gate whether these essential planner actions work beyond the seeded sample.
- Concrete fix: add a `source-placement` claim with a tagged test that places, names, reloads, and removes one controller, one supply, and one power point.

### F-1-9 — General current-estimation behavior is an unlisted claim

- Locations/quotes: README “Estimates per-segment and total current from user-set assumptions.” Landing: “Current figures use your pixel, brightness, and supply assumptions.”
- Gap: `sample-preflight` proves only one fixed 11.5 A sample, while `preflight-rules` covers warnings. Neither manifest claim promises and tests recalculation for changed pixel current, brightness, and segment count.
- Why this fails: the sample result does not prove the general estimator that a visitor will use for a different build.
- Concrete fix: add a `current-estimates` claim and tagged test that changes each stated input and asserts segment and total outputs against the documented formula.

### F-1-10 — “The checks update as you work” is an unlisted claim

- Location/quote: landing preview: “The checks update as you work.”
- Gap: no manifest claim or tagged browser test verifies live UI updates. The unit rule test does not prove rendered results update after an edit.
- Why this fails: the sentence promises interactive behavior, but the claim suite proves only calculation functions.
- Concrete fix: add a `live-preflight` entry and tagged Playwright test that changes one assumption and observes the corresponding warning and total without reload; otherwise remove the sentence.

### F-1-11 — Refund revocation is an unlisted and untested payment claim

- Locations/quote: landing, planner, Terms, and README: “Approved refunds revoke the license.”
- Gap: `studio-checkout` covers price, redirect, and visible merchant wording. It does not list or prove revocation after a refund.
- Why this fails: this is a material purchase term, not incidental copy.
- Concrete fix: add a recorded refunded-license fixture and a tagged claim test that changes a formerly valid license to revoked, or remove the sentence until the billing API contract can prove it.

### Minor

### F-1-12 — Route social metadata stays on the landing-page message

- Location: `/planner`, `/demo`, `/privacy`, `/terms`, and the SPA not-found state.
- Evidence: titles and canonicals update, but every route retains `og:title` “LED Layout Checker — plan strips before soldering,” the landing OG description, and the same Twitter title/description.
- Why this fails: shared links do not identify the actual page being shared.
- Concrete fix: update description, Open Graph, and Twitter title/description alongside `document.title` and canonical in `renderRoute()`. Add a route metadata test.

### F-1-13 — The cold 404 omits required metadata and the standard footer content

- Location: `public/404.html` served for an unknown cold URL.
- Evidence: HTTP 404 and the designed h1 pass, but meta description, canonical, Open Graph/Twitter tags, and apple-touch icon are absent. The footer omits “Built by Param Factory,” build id, and image provenance.
- Why this fails: the error route is a real page in the public crawl but does not meet the site’s metadata and provenance skeleton.
- Concrete fix: add the missing metadata and make the footer content match the application skeleton while retaining the broken-path visual treatment.

### F-1-14 — “Preflight” is unexplained jargon

- Locations/quotes: “Preflight for addressable LED art,” “The preflight,” and “Live preflight.”
- Why this fails: the product is for hobbyists, not aviation or release engineers; the metaphor adds a term for “check” without adding meaning.
- Concrete rewrite: “Check addressable LED art before building,” “Layout preview,” and “Live checks.”

### F-1-15 — The product uses four terms for the same power-location concept

- Locations/quotes: “power assumptions,” “power entry points,” “injection points,” and “power points/power injection.”
- Why this fails: the design’s terminology table specifies “power point,” but the landing and README keep switching terms.
- Concrete rewrite: use “power point” everywhere: “map data direction and power points,” “Mark power points,” “Add pixel counts, supplies, and power points,” and “mark power points before soldering.”

### F-1-16 — “See each assumption on one plan” is vague out of context

- Location: landing h2.
- Why this fails: “assumption” does not tell a scanning visitor which information the preview contains.
- Concrete rewrite: “See data, current, and power on one plan.”

### F-1-17 — “State the power” is an unnatural, ambiguous heading

- Location: landing How it works, step 2 h3.
- Why this fails: the heading does not name the concrete action described below it.
- Concrete rewrite: “Add power details.”

### F-1-18 — README introduces hardware and planning jargon without plain alternatives

- Locations/quotes: “large WS281x-style art,” “pre-build reasoning aid,” and “long single-ended runs, ... low supply headroom, and supply-voltage mismatches.”
- Why this fails: each phrase makes a first-time reader translate terminology before understanding the benefit.
- Concrete rewrites: “large art made with addressable LED strips,” “planning tool,” and “long strips powered only at one end, supplies without enough spare current, and supplies with the wrong voltage.”

### F-1-19 — “390px keyboard path” is compressed test jargon

- Location/quote: README Test and build: “a 390px keyboard path.”
- Why this fails: spacing and the phrase “keyboard path” are harder to parse than the behavior being tested.
- Concrete rewrite: “a keyboard-only workflow at a 390 px phone width.”

### F-1-20 — README says the host config provides an SPA fallback when it deliberately has none

- Location/quote: README: “`public/staticwebapp.config.json` provides the SPA fallback, cache rules, and security headers.”
- Code evidence: `navigationFallback` is absent, and a test explicitly requires it to be undefined; known SPA routes use individual rewrites.
- Why this fails: a maintainer following the README gets the wrong routing model and can reintroduce the earlier catch-all 200 defect.
- Concrete rewrite: “`public/staticwebapp.config.json` provides route rewrites, the designed 404 response, cache rules, and security headers.”

### F-1-21 — Local-only plans have no portable project import/export

- Location: planner capabilities and the brief’s saved-plan job.
- Why this matters: SVG is a final diagram, not an editable backup. Clearing browser storage or changing devices loses the only editable plan, and there is no way to resume from the exported SVG.
- Concrete feature: add **Export plan JSON** and **Import plan JSON** with schema/version validation, a clear replacement preview, keyboard-accessible errors, and strict demo-key isolation. Add claims for round-trip fidelity and malformed-file rejection. AI and sync are not justified for this deterministic local planner.

## Copy audit

Counting method: contractions, hyphenated compounds, URLs, and inline-code spans each count as one word; symbols do not count. Headings and actions are included because the brief requires them to work out of context. No item exceeds 22 words. No banned marketing adjective appears. All landing actions use result-naming verbs. Flagged items point to findings above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Preflight for addressable LED art | 5 | F-1-14 |
| Plan LED strips before you solder | 6 | F-1-7, F-1-8 |
| For hobbyists building large LED art who need clear data paths and power assumptions. | 14 | F-1-15 |
| Try it with sample data | 5 | pass |
| See a checked 480-pixel arch. | 5 | F-1-6 |
| Plans stay in this browser. | 5 | pass — `local-only` |
| Works offline after your first visit. | 6 | pass — `offline-reload` |
| Core planning and SVG export are free. | 7 | pass — `svg-export`, `studio-license` |
| Trace data from controller to the last pixel. | 8 | F-1-7, F-1-8 |
| The preflight | 2 | F-1-14 |
| See each assumption on one plan | 6 | F-1-16 |
| Draw the shape. | 3 | F-1-7 |
| Set pixel counts. | 3 | F-1-7, F-1-9 |
| Mark power entry points. | 4 | F-1-8, F-1-15 |
| The checks update as you work. | 6 | F-1-10 |
| Start a blank plan | 4 | pass |
| How it works | 3 | pass |
| From sketch to labeled plan | 5 | pass |
| Draw the paths | 3 | F-1-7 |
| Click along each strip in its real data order. | 9 | F-1-7 |
| State the power | 3 | F-1-17 |
| Add pixel counts, supplies, and injection points. | 7 | F-1-8, F-1-9, F-1-15 |
| Check and export | 3 | pass |
| Resolve warnings, then download a labeled SVG. | 7 | pass — `svg-export` |
| Clear limits | 2 | pass |
| A planning check, not electrical approval | 6 | pass |
| Current figures use your pixel, brightness, and supply assumptions. | 9 | F-1-9, F-1-15 |
| Confirm wire size, fusing, voltage drop, and mains work with qualified guidance. | 12 | pass |
| Studio license | 2 | pass |
| Plan larger builds for $12 once | 6 | pass — `studio-checkout` |
| Studio adds multiple controllers and a parts summary. | 8 | pass — `studio-license` |
| Checks and labeled SVG export stay free. | 7 | pass — `svg-export` |
| Sociobot and Dodo are the merchant of record. | 8 | F-1-4 |
| Refunds are handled there and revoke the license. | 8 | F-1-4, F-1-11 |
| Privacy | 1 | pass |
| Terms | 1 | pass |
| $12 | 1 | pass |
| one-time purchase | 2 | pass |
| Buy Studio | 2 | pass |
| Restore a license | 3 | pass |
| Plan LED paths before soldering. | 5 | pass |
| Hero imagery was generated for this product. | 7 | pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| LED Layout Checker | 3 | pass |
| Plan addressable LED paths, trace data direction, estimate current, and mark power injection before soldering. | 15 | F-1-15 |
| It is for hobbyists planning large WS281x-style art. | 8 | F-1-18 |
| The checker is a pre-build reasoning aid, not electrical advice or firmware control. | 13 | F-1-18 |
| Live site: https://led-layout-checker.sociobot.in | 3 | pass |
| One-click demo: https://led-layout-checker.sociobot.in/demo | 3 | pass |
| What it does | 3 | pass |
| Draws multi-point LED segments in data order. | 7 | F-1-7 |
| Places controllers and power supplies on the plan. | 8 | F-1-8 |
| Estimates per-segment and total current from user-set assumptions. | 8 | F-1-9 |
| Flags missing power points, long single-ended runs, missing controllers, low supply headroom, and supply-voltage mismatches. | 15 | F-1-18; claim covered by `preflight-rules` |
| Exports a labeled SVG for every plan. | 7 | pass — `svg-export` |
| Works offline after the first visit. | 6 | pass — `offline-reload` |
| Plans use local browser storage. | 5 | pass — `local-only` |
| Demo data uses a separate key and never overwrites a real plan. | 12 | pass for plan data; F-1-1 for the wider sandbox |
| Demo | 1 | pass |
| Open `/demo` to load a 480-pixel garden arch. | 8 | F-1-6 |
| It includes three segments, one controller, two supplies, and two power warnings. | 12 | F-1-6 |
| Reset demo restores the sample. | 5 | pass — `demo-sandbox` |
| Start for real removes the demo copy and opens a blank plan. | 12 | F-1-5 |
| Studio license | 2 | pass |
| The free planner includes all checks and labeled SVG export. | 10 | pass — `preflight-rules`, `svg-export` |
| Studio adds multiple controllers and a text parts summary for a $12 one-time purchase. | 14 | pass — `studio-license`, `studio-checkout` |
| Checkout runs through Sociobot, with Dodo as merchant of record. | 10 | pass; live copy contradicts it in F-1-4 |
| Approved refunds revoke the license. | 5 | F-1-11 |
| Existing license holders can restore access through the Sociobot verification service. | 11 | pass — `studio-license` |
| Develop | 1 | pass |
| Requires Node.js 22 or newer. | 5 | pass |
| Open http://localhost:5173. | 2 | pass |
| The demo is at http://localhost:5173/demo. | 5 | pass |
| Test and build | 3 | pass |
| `npm test` runs calculation tests, a production build, claim tests, an accessibility scan, an offline reload, and a 390px keyboard path. | 20 | F-1-19 |
| `npm run build` writes the static site to `dist/` with `index.html` at its root. | 12 | pass |
| Deploy `dist/` to Azure Static Web Apps. | 7 | pass |
| `public/staticwebapp.config.json` provides the SPA fallback, cache rules, and security headers. | 10 | F-1-20 |
| Privacy and limits | 3 | pass |
| Plan data and a pasted license stay in local storage. | 10 | pass — `local-only` and `studio-license` |
| Stored licenses contact `api.sociobot.in` at most once per day. | 9 | pass — `daily-license-check` |
| See `/privacy` and `/terms` in the product. | 7 | pass |
| Current estimates depend on the values you enter. | 8 | F-1-9 |
| Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance. | 13 | pass |
| License | 1 | pass |
| MIT. | 1 | pass |
| See LICENSE. | 2 | pass |

## Demo and sandbox evidence

- One click from the cold landing action opens `/demo`.
- The first demo screen already shows `Garden arch — 480 pixels`, 11.5 A, two warnings, three segments, one controller, and two supplies.
- The banner remains visible and includes **Reset demo** and **Start for real**.
- Reset restores the sample.
- A real-plan sentinel remained byte-identical through demo edit/reset; Start for real removed the demo plan key and reopened the sentinel.
- Normal demo editing/export requested only `led-layout-checker.sociobot.in`; no analytics, remote script, remote font, or plan-data request appeared.
- Offline reload preserved the demo and its 11.5 A result.
- License storage violates the sandbox as described in F-1-1.

## Declared claims

Every exact command in `.factory/claims.json` was run after `npm ci` from the clean candidate. All declared tests pass; this does not cure the unlisted claims above.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `sample-preflight` | PASS | 11.5 A and two named warnings |
| `preflight-rules` | PASS | all five documented rule families |
| `svg-export` | PASS | downloaded SVG contains plan name, current estimate, and warning text |
| `local-only` | PASS | tagged demo edit/export produced no cross-origin request |
| `demo-sandbox` | PASS, insufficient scope | plan key isolation passes; real license keys are not covered |
| `offline-reload` | PASS | service-worker-controlled `/demo` reloads offline |
| `studio-license` | PASS | recorded valid response enables a second controller and parts export |
| `daily-license-check` | PASS | one verification across two reloads |
| `studio-checkout` | PASS | recorded 303 redirect and $12 disclosure |

Live checkout independently returned HTTP 303 to `checkout.dodopayments.com`.

## History recheck

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the existing handoff and, additionally, all four verification reports. Each earlier defect was checked live and in code:

| Earlier finding | Status now |
| --- | --- |
| Verification-1: first screen hid audience/action/facts | fixed; all end above both folds |
| Verification-1/2: Studio checkout unavailable | fixed; live endpoint returns 303 to Dodo |
| Verification-1: exact claim commands required an undeclared build | fixed; each exact command passes because Playwright builds first |
| Verification-1: replacement controller could not reconnect segments | fixed; 3 warnings become 0 and stay 0 after reload |
| Verification-1: checkout-return token could be hidden by stale cache | fixed; new token makes one verification request and replaces the cache |
| Verification-1: checkout/daily-check claims unlisted | fixed for those two claims |
| Verification-1: mobile reflow, small targets, canvas semantics | fixed; 390 px at 200% has no overflow, no visible target below 44 px, and textual geometry is present |
| Verification-1 S2: missing routes returned 200 | **half-fixed; blocking again as F-1-2** |
| Verification-1: offline cached HTML lost security headers | fixed; CSP, referrer, permissions, and nosniff persist |
| Verification-1: PWA icons/cache policy | fixed; 192/512 icons exist and full hero art is not precached |
| Verification-2: empty coordinates created 0,0 | fixed; announced error, focus, and `aria-invalid` verified |
| Verification-2: empty license had no recovery | fixed in code and existing test |
| Verification-2: Studio fragment was discarded | fixed; hash is retained and focused |
| Verification-3: overflowing preflight list was inaccessible | fixed; focusable scroll region, keyboard scroll, and zero Axe violations |
| Verification-4/handoff: no defects recorded | superseded by F-1-1 through F-1-21 from this fresh review |

## Structure, accessibility, and visual identity

Confirmed:

- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200; a cold unknown URL returns 404.
- Route titles follow the required pattern and stay under 60 characters.
- Each route has one h1, one main landmark, `lang="en"`, a skip link, favicon, canonical, and consistent main header/footer.
- SPA clicks, deep links, back, and forward move focus to the route h1; the Studio fragment is honored.
- Internal links return 200, Sociobot returns 200, and checkout returns 303. No dead link was found.
- Live Axe scans on all main routes, the dynamic overflowing-check state, and the cold 404 returned zero violations.
- Mobile controls meet 44×44 px; 200% text reflows at 390 px; reduced motion hides data sparks.
- The generated routed-light art, cutting-mat palette, clipped controls, plotted canvas, and broken-circuit 404 form a distinct product-specific identity rather than a generic SaaS template.
- No runtime AI feature exists, no provider key is embedded, and AI would not improve these deterministic checks.

Exceptions are F-1-2, F-1-12, and F-1-13.

## What would make this perfect

Resolve every finding, then rerun this review from a fresh browser and clean clone. The release-quality target is:

1. Demo mode cannot observe or mutate any real plan or license key.
2. Unknown URLs return the designed 404 with status 404 before and after service-worker control.
3. Every visible editor tool performs its named action.
4. Every factual promise has one manifest entry and one observable tagged test.
5. Payment wording is exact, route metadata is complete, and all copy uses one plain term per concept.
6. Editable plans can be exported and imported without weakening local privacy or demo isolation.

Until all six are true and the finding count is zero, the verdict remains **FAIL**.
