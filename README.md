# LED Layout Checker

Plan addressable LED paths, trace data direction, estimate current, and mark power injection before soldering.

It is for hobbyists planning large WS281x-style art. The checker is a pre-build reasoning aid, not electrical advice or firmware control.

Live site: <https://led-layout-checker.sociobot.in>
One-click demo: <https://led-layout-checker.sociobot.in/demo>

## What it does

- Draws multi-point LED segments in data order.
- Places controllers and power supplies on the plan.
- Estimates per-segment and total current from user-set assumptions.
- Flags missing power points, long single-ended runs, missing controllers, low supply headroom, and supply-voltage mismatches.
- Exports a labeled SVG for every plan.
- Works offline after the first visit.

Plans use local browser storage. Demo data uses a separate key and never overwrites a real plan.

## Demo

Open `/demo` to load a 480-pixel garden arch. It includes three segments, one controller, two supplies, and two power warnings. **Reset demo** restores the sample. **Start for real** removes the demo copy and opens a blank plan.

## Studio license

The free planner includes all checks and labeled SVG export. Studio adds multiple controllers and a text parts summary for a $12 one-time purchase. Checkout runs through Sociobot, with Dodo as merchant of record. Approved refunds revoke the license. Existing license holders can restore access through the Sociobot verification service.

## Develop

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open <http://localhost:5173>. The demo is at <http://localhost:5173/demo>.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs calculation tests, a production build, claim tests, an accessibility scan, an offline reload, and a 390px keyboard path. `npm run build` writes the static site to `dist/` with `index.html` at its root.

Deploy `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` provides the SPA fallback, cache rules, and security headers.

## Privacy and limits

Plan data and a pasted license stay in local storage. Stored licenses contact `api.sociobot.in` at most once per day. See `/privacy` and `/terms` in the product.

Current estimates depend on the values you enter. Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance.

## License

MIT. See [LICENSE](LICENSE).
