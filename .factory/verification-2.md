# Independent product verification — FAIL

Verified 2026-08-28 for work order `led-layout-checker-verify-2`.

- Candidate: `cb1648ed78490a69ff0c03347a94930582b6b2d8`
- Live URL: `https://led-layout-checker.sociobot.in`
- Artifact: static web/PWA
- Decision: **FAIL — do not release**

The candidate is deployed and the free planner is strong. All nine declared claim tests, the cold first-read/demo gate, the full repository suite, deployment identity, accessibility, privacy, offline, and performance checks pass. The release still fails the original freemium acceptance contract because a new customer cannot buy the required one-time Studio tier: the production checkout remains unregistered and returns 404. Two invalid-input paths also need correction.

## Release-blocking finding

### S1 — The specified one-time Studio purchase is unavailable

The researched brief specifies “freemium — free simple layouts, one-time advanced export and multiple-controller planning.” The paid-unlock contract requires a buy link, exact price, one-time-purchase language, merchant/refund terms, and a working Sociobot checkout.

Fresh production evidence:

```text
GET https://api.sociobot.in/api/v1/products/led-layout-checker/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The candidate removes the dead link and honestly says “New Studio sales are paused,” but that is a documented deviation, not fulfillment of the paid product contract. There is no buy link, price, purchase disclosure, or way for a new visitor to obtain the license needed for multiple controllers and the parts summary. Clicking the free-tier **Add controller · Studio** control also says “Enter a license below or buy Studio,” even though buying is unavailable.

Existing-license restore and mocked valid-license behavior work. The verification endpoint is live. This finding is specifically the missing product registration/checkout path.

## Other defects

### S2 — Empty coordinate fields silently add a point at 0,0

Live reproduction on a fresh `/planner`:

1. Choose **Segment**.
2. Clear both **X** and **Y**.
3. Choose **Place at coordinates**.

No error appears. The planner creates the first drawing point at 0,0 because empty strings are converted to zero, then re-renders both fields as 50. The visible state says “1 points in new segment,” so a user can unknowingly add incorrect geometry. Out-of-range values correctly produce the announced “Use coordinates from 0 to 100” error; empty fields need the same explicit validation and recovery.

### S2 — Empty license submission gives no error or focus guidance

The **License token** input is not marked required and has no described requirement. Choosing **Verify license** with it empty leaves the message region blank and focus on the button. Invalid non-empty tokens and network failures do produce clear, announced recovery messages. The empty path violates the form/error requirements and can leave an existing customer stuck.

### S3 — The restore link discards its fragment

The landing link has `href="/planner#studio-title"`, but the SPA handler pushes only the pathname. After activation the address bar is `/planner`, not `/planner#studio-title`, and focus moves to the planner h1. Current scroll retention happens to leave the Studio area visible at the tested sizes, but the address-bar/deep-link state promised by the link is lost.

## Mandatory first-read and demo gate — PASS

Cold live load at 1280×720:

- What: **Plan LED strips before you solder**.
- For whom: **For hobbyists building large LED art who need clear data paths and power assumptions.**
- First click: **Try it with sample data**, alongside “See a checked 480-pixel arch.”
- The three facts end at y=599, within the 720 px viewport.

At 390×844 the same required content ends at y=669. One click opens `/demo`, immediately showing the named 480-pixel garden arch, 11.5 A, two warnings, and the persistent **Demo — sample data, nothing is saved to your plans** banner with reset and exit actions.

## Claims gate — PASS

`.factory/claims.json` exists. After the clean-clone `npm ci`, every listed command was run separately before repository QA. All nine passed from the declared demo sandbox.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `sample-preflight` | PASS | 11.5 A and the two named power warnings |
| `preflight-rules` | PASS | Missing controller/power, long run, headroom, and voltage mismatch rules |
| `svg-export` | PASS | Downloaded labeled SVG contains plan name, estimate, and safety note |
| `local-only` | PASS | Edit/export generated no cross-origin request |
| `demo-sandbox` | PASS | Reset restored sample; real plan remained separate |
| `offline-reload` | PASS | `/demo` reloaded offline with the 11.5 A sample |
| `studio-license` | PASS | Recorded valid verification enabled controller assignment and parts export |
| `daily-license-check` | PASS | Two reloads made one verification request within a day |
| `studio-sales-paused` | PASS | No checkout link; paused-sales copy and restore path present |

No additional user-visible functional/privacy promise was found without coverage by these claim families. The paused-sales claim itself passes but exposes the acceptance-contract deviation above.

## Clean-clone quality gates

Run at the exact candidate with Node 22 and Playwright 1.58.2:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS; 141 packages installed |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 4 Vitest tests and 20 Chromium tests |
| `npm run build` | PASS; `dist/` produced |

Production output:

- JavaScript: 33.30 KB raw / 11.10 KB gzip, under 200 KB.
- CSS: 17.98 KB raw / 4.74 KB gzip, under 50 KB.
- No web-font requests.
- Mobile-selected hero variants remain under the 300 KB image budget.
- Lighthouse transferred 148 KiB for the live mobile first load.

## Independent end-to-end evidence

Passed on fresh live browser contexts:

- Created a segment using boundary coordinates 0,0 and 100,100.
- Out-of-range coordinates -1,101 produced an announced recovery message.
- Pixel count clamped at 1 and 5000, then recovered to 150.
- Added a supply, marked both power entries, and reached **Ready to review**.
- Exported a labeled SVG; special characters were escaped and the output contained 150 pixels and the safety note.
- Removed a supply, undid removal, reloaded, and confirmed persistence.
- Demo changes/reset did not affect a named real plan; leaving demo removed the demo key.
- Invalid non-empty license and simulated network failure showed actionable messages.
- Normal planning/demo traffic stayed same-origin. No analytics, third-party font, or third-party script request occurred.

No sign-in exists, so the Entra tenant check is not applicable. No AI feature is warranted for this deterministic planner. It is not a library, CLI, or backend product, so consumer-package, persistence-concurrency, and backend health checks are not applicable.

## Accessibility, responsive behavior, and browser quality

- Live axe scans on `/`, `/demo`, `/privacy`, and `/terms`: zero violations, including zero serious/critical findings.
- Desktop 1280×720 and mobile 390×844: required first screen fits; no horizontal overflow.
- 390 px planner at simulated 200% text: `scrollWidth = clientWidth = 390`.
- All visible links, buttons, inputs, selects, and summaries measured at least 44×44 CSS px.
- Keyboard: skip link is first, Enter moves focus to main, planner placement works, and route history focuses the new h1.
- Visible focus: 3 px amber outline; measured skip-link position top=12 px when focused.
- Reduced motion: media query matched, SMIL path motion hidden, scrolling becomes automatic, and transitions reduce to 0.01 ms.
- Normal routes produced no console/page error. The expected direct 404 navigation produces Chromium’s normal failed-resource console line for its 404 document.
- `<html lang>`, route titles, one h1, main landmarks, alt text, 404 structure, privacy/terms pages, manifest icons, and metadata are present.
- Factory `verify-url.sh`: PASS; title/lang/h1/main/alt/button checks pass and no normal-load console error was reported.

## PWA and offline

- Service worker `led-layout-checker-v6` installed and activated with no waiting/installing worker after `registration.update()`.
- Cache contains the shell, hashed JS/CSS, manifest, favicon, 192 px icon, and 600 px WebP; it does not precache the full-size PNG.
- `/demo` reloaded offline with its sample data.
- Cached HTML retains CSP, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options`.

## Deployment identity, response policy, and links

- All 19 public production files match the candidate build byte-for-byte by SHA-256. `staticwebapp.config.json` is host configuration and is correctly not served as a public file.
- Candidate/live `index.html` SHA-256: `1915b031547a9f7d1dcbdd2852d0513e9d45aac5c58d27c455ed25d8b2461af8`.
- `/`, `/planner`, `/demo`, `/privacy`, and `/terms` return 200.
- A cold unknown path returns HTTP 404 with the designed page.
- Root HTML: `max-age=30`; hashed JS/CSS: one-year immutable; unversioned art: one day; service worker: no-cache.
- CSP, HSTS, Referrer-Policy, nosniff, and Permissions-Policy are present.

## Performance

Live Lighthouse 12.8.2 mobile:

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

These pass the supplied LCP, blocking-time/interaction proxy, layout-shift, and category budgets.

## API rate limiting

A rapid sequential burst against the invalid-license verification endpoint returned 200 for requests 1–30. Request 31 was the first 429 and included `Retry-After: 3`; requests 31–40 remained 429 with `Retry-After`. The required API rate limiting passes at an observed threshold of 30 requests per window from this verifier IP.

## Required next steps

1. Register/enable the production Sociobot product, restore the checkout link, and add the exact price, one-time purchase, merchant/refund, return-token, and live checkout evidence required by the paid-unlock contract.
2. Remove the stale “buy Studio” toast until checkout exists, or make it lead to the working checkout after registration.
3. Reject empty coordinate fields with the same announced guidance as other invalid coordinates.
4. Mark the license token requirement and announce an actionable empty-field error.
5. Preserve and honor `#studio-title` in SPA navigation.
