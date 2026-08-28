# Independent product verification — FAIL

Verified 2026-08-28 for work order `led-layout-checker-verify-1`.

- Candidate: `04c69d7b5fe9cc77f61427b131bcc49f1086263b`
- Live URL: `https://led-layout-checker.sociobot.in`
- Artifact: static web/PWA
- Decision: **FAIL — do not release**

The deployed files match the candidate, but the candidate fails explicit acceptance gates. The cold first screen does not show the audience, sample action, or three facts at a common desktop viewport. Studio checkout is dead. The exact E2E claim commands do not start from an installed clean clone until an undeclared build is run. Additional paid-flow, controller-recovery, accessibility, and routing defects are listed below.

## Release-blocking findings

### S1 — Cold first screen fails the mandatory plain-words/demo gate

At a fresh 1280×720 load, the headline fills the viewport from y=218 to y=719. The audience sentence begins at y=747, **Try it with sample data** begins at y=842, and all three facts begin at y=918. A cold visitor can see what the product does, but cannot see whom it is for or what to click first. The only visible demo affordance is the less explicit header link **Demo**.

At 390×844, the audience and sample action are visible, but the facts extend past the viewport. The supplied contract states that absence of all required first-screen content is an automatic failure.

### S1 — Advertised Studio checkout returns 404

Both **Buy Studio** links point to:

`https://api.sociobot.in/api/v1/products/led-layout-checker/checkout`

Fresh evidence on 2026-08-28:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The prior deployment-only concern is therefore still present. The $12 paid tier cannot be purchased.

### S1 — Exact claim E2E commands fail from the installed clean clone

`.factory/claims.json` exists and contains seven entries. Before any other repository inspection, every listed command was invoked. The initial raw clone had no dependencies, so the commands could not load Playwright/Vitest. After `npm ci`, the unit claim passed, but the exact E2E command still failed after 60 seconds:

```text
npm run test:e2e -- --grep @claim:sample-preflight
Error: Timed out waiting 60000ms from config.webServer.
```

`playwright.config.ts` starts `npm run preview`, while `vite preview` requires an existing `dist/`. No listed E2E claim command builds first. After manually running `npm run build`, all six E2E claim assertions pass. This does not cure the claims contract: its exact commands are not self-contained from the required clean state, and any failing claim command is release-blocking.

### S1 — A replaced controller cannot be assigned in the free planner

Live reproduction on `/demo`:

1. Remove **ESP32**.
2. Add and place a replacement controller.
3. All three segments still report “has no controller.”
4. The free UI has no controller-assignment control (`#segment-controller` count is 0).
5. Reload. The warnings persist and Undo is disabled.

The user must delete and redraw every segment or reset the plan. This breaks a normal correction/recovery path in the core job.

### S1 — A checkout-return license can be ignored for 24 hours

The license verdict cache is not tied to its token, and a return token does not bypass a recent cache. With a recent cached invalid verdict, opening `/planner?license=new-valid-license` strips and stores the new token but performs zero verification requests, shows “This license is no longer active,” and remains locked. This violates the paid-unlock requirement to verify the returned token on first unlock.

### S1 — User-visible claims are absent from the claims manifest

The live page/README make additional promises without corresponding `.factory/claims.json` entries and tagged tests, including the working **$12 one-time purchase/checkout** and “License checks contact `api.sociobot.in` at most once per day.” The checkout promise is observably false. Under the supplied claims contract, unlisted claim-like statements fail review.

## Other defects

### S2 — Accessibility and responsive defects

- At 200% text sizing on a 390 px viewport, document width becomes 497 px, causing horizontal loss/scroll.
- Eleven visible mobile interactive targets are below 44 px in at least one dimension. These include the three header links (15 px high), coordinate inputs (32 px high), plan-name input (32 px high), license disclosure (18 px high), and footer links (16 px high).
- Much planner support text is set from `.65rem` to `.88rem`, below the supplied 16 px web body-text baseline and visibly difficult to read on the mobile planner.
- Live axe scans find no serious/critical violations, but report `landmark-complementary-is-top-level` on two nested asides on `/demo` (moderate).
- The canvas uses `role="application"` but exposes no application keyboard commands or textual equivalent for its routed geometry. Coordinate inputs provide placement, but not an equivalent way to inspect the plan.

Keyboard positives: the skip link is first, Enter moves to `#main`, its 3 px focus outline is visible, planner tools and coordinate placement work by keyboard, and SPA navigation/back/forward focus the route `<h1>`.

### S2 — Missing routes return HTTP 200

`/definitely-missing-verifier-path` renders the designed not-found screen but responds `HTTP/2 200`. The supplied routing contract requires a real 404 response. There is no `404.html`/`responseOverrides` mapping.

### S2 — Offline cached HTML loses browser security policies

Online HTML has CSP, Referrer-Policy, Permissions-Policy, HSTS, and nosniff. The service worker's `cleanResponse()` retains only Content-Type and Cache-Control. Fetching cached `/` through the installed worker returns `content-security-policy: null`, `referrer-policy: null`, and `permissions-policy: null`. Offline navigations therefore lose the page's browser policies.

### S3 — PWA and cache quality gaps

- The manifest supplies only a 180×180 icon. It lacks standard 192×192 and 512×512 install icons.
- `/assets/*` receives a one-year immutable policy even for unversioned hero filenames, so a future asset replacement at the same path can remain stale.
- Service-worker installation precaches all four responsive hero variants (655,565 bytes total), including a 394,624-byte PNG that a modern mobile browser would not otherwise request. This is background first-visit cost; the selected mobile WebP itself is 37,134 bytes.

## Claims results

All observable assertions pass after explicitly creating `dist/`, but the exact E2E commands fail before that undeclared step as described above.

| Claim | Assertion after build | Evidence |
| --- | --- | --- |
| `sample-preflight` | PASS | 11.5 A; two named warnings |
| `preflight-rules` | PASS | five documented rule families asserted |
| `svg-export` | PASS | downloaded SVG includes plan name, estimate, and safety text |
| `local-only` | PASS | demo edit/export observed only the product origin |
| `demo-sandbox` | PASS | demo reset and real-plan isolation work |
| `offline-reload` | PASS | `/demo` reloads offline with 11.5 A sample |
| `studio-license` | PASS with mocked verify response | multiple controllers and parts export enabled |

## Local gates

Run from candidate `04c69d7` with Node 22:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS; 60 packages, 0 vulnerabilities reported |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm test` | PASS; 4 Vitest + 11 Playwright tests |
| `npm run build` | PASS; TypeScript no-emit check + Vite production build |
| Lint | Not available in repository |

Production output:

- JS: 32.12 KB raw / 10.80 KB gzip — within 200 KB budget.
- CSS: 17.27 KB raw / 4.68 KB gzip — within 50 KB budget.
- Fonts: no network fonts.
- Selected mobile hero: 37.13 KB WebP — within 300 KB budget.

## Live functional evidence

Passed on the deployed `/demo`:

- One click from the landing action opens a realistic 480-pixel garden arch.
- Sample displays 11.5 A and the two expected warnings.
- Plan-name edits persist locally; **Reset demo** restores the sample.
- Invalid coordinates `-1, 101` produce “Use coordinates from 0 to 100.”
- Boundary coordinates `0, 0` and `100, 100` produce a segment.
- Pixel counts clamp from 5001 to 5000, and from 0/empty to 1.
- SVG download contains start labels and “Not electrical advice.”
- Default 390 px layout has no horizontal overflow.
- Reduced motion matches the media query, stops SMIL movement, disables smooth scrolling, and reduces transitions.
- No console/page errors occurred across `/`, `/planner`, `/demo`, `/privacy`, `/terms`, and the missing route.
- Normal landing/demo use contacted only `https://led-layout-checker.sociobot.in`.

## Deployment identity, headers, and links

The live `index.html`, JS, CSS, source map, images, manifest, robots, sitemap, icons, and `sw.js` are byte-for-byte SHA-256 matches to the candidate build. The candidate is what is deployed.

Online response checks:

- Root: 200, HTML cache `max-age=30`, CSP, HSTS, Referrer-Policy, nosniff, Permissions-Policy.
- Hashed JS: 200, `Cache-Control: public, max-age=31536000, immutable`.
- Service worker: 200, `Cache-Control: no-cache`.
- Every internal/footer link returns 200 except Studio checkout, which returns 404.
- Social preview is the required 1200×630; hero dimensions and alt text are present.

## Performance and PWA

Live mobile Lighthouse 12.8.2:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.7 s |
| TBT | 0 ms |
| CLS | 0 |
| Max potential FID | 160 ms |

The service worker installs as `activated`, uses cache `led-layout-checker-v5`, completes `registration.update()` without a waiting/installing worker for the identical deployment, and reloads `/demo` offline successfully.

## Billing endpoint rate limit

A rapid sequential burst to the invalid-license verification endpoint returned 200 for requests 1–30. Request 31 was the first 429; requests 31–33 returned `Retry-After: 4`. The required 429 and Retry-After behavior therefore passes at an observed threshold of 30 requests per window from this verifier IP.

## Verification tools and commands

```sh
npm ci
npm run test:unit -- -t @claim:preflight-rules
npm run build
npm run test:e2e -- --grep @claim:<id>
npm test
npm audit --audit-level=high
/opt/fleet/lib/verify-url.sh https://led-layout-checker.sociobot.in /tmp/led-verification-evidence
CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell npx --yes lighthouse@12.8.2 https://led-layout-checker.sociobot.in ...
```

`verify-url.sh` passed with a 695 ms load, title/lang/one h1/main/alt/button checks, and zero console errors. Independent Playwright + axe runs supplied the deeper evidence above.

## Required next steps

1. Rework the hero so audience, sample action/outcome, and three facts are visible without scrolling at 1280×720 and 390×844.
2. Register/enable the production Sociobot product and verify the real checkout/return flow.
3. Make every exact claim command self-contained from `npm ci`, and add manifest claims/tests for checkout price and daily license caching.
4. Bind license cache records to tokens and always verify a newly returned token.
5. Reassign existing free segments when their sole controller is replaced, or expose free single-controller assignment.
6. Fix 200% text reflow, target sizes, text sizing, canvas semantics, and complementary landmarks.
7. Return an actual 404, preserve security policies in cached HTML, and correct PWA icons/cache versioning.
