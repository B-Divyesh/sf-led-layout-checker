# LED Layout Checker

Plan addressable LED paths, trace data direction, estimate current, and mark power points before soldering.

It is for hobbyists planning large art made with addressable LED strips. The checker is a planning tool, not electrical advice or firmware control.

Live site: <https://led-layout-checker.sociobot.in>

One-click demo: <https://led-layout-checker.sociobot.in/?demo=1>

## What it does

- Draws and saves multi-point LED segments in data order with pointer or keyboard controls.
- Places, names, saves, and removes controllers, supplies, and power points.
- Recalculates segment and total current from pixel count, current per pixel, and brightness.
- Flags missing controllers, missing power points, long strips powered only at one end, low supply headroom, and supplies with the wrong voltage.
- Updates layout checks as the plan changes.
- Exports a labeled SVG and an editable version 1 plan JSON.
- Imports valid plan JSON after a replacement preview and rejects malformed files without changing the plan.
- Works offline after the first visit.

Plans use local browser storage. Demo plans and licenses use separate `demo:` keys and never read or change real data.

## Demo

Open `/?demo=1` to load a 480-pixel garden arch. It has three segments, one controller, two supplies, an 11.5 A estimate, and two warnings.

**Reset demo** restores the sample and clears demo licenses. **Start for real** clears every demo key and opens your saved plan, or a blank plan if you have none.

## Studio license

The free planner includes layout checks and labeled SVG export. Studio adds multiple controllers and a text parts summary for a $12 one-time purchase.

Checkout runs through Sociobot. Dodo is the merchant of record and handles payment and refunds. Existing license holders can restore access through the Sociobot verification service.

## Develop

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open <http://localhost:5173>. The demo is at <http://localhost:5173/?demo=1>.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs calculation, claim, accessibility, offline-reload, and keyboard tests. It also makes a production build. The keyboard test uses a 390 px phone width.

`npm run build` writes the static site to `dist/` with `index.html` at its root.

Deploy `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` provides route rewrites, the designed 404 response, cache rules, and security headers.

## Privacy and limits

Plan data and a pasted license stay in local storage. Stored real licenses contact `api.sociobot.in` at most once per day. See `/privacy` and `/terms` in the product.

Current estimates depend on the values you enter. Confirm wire size, voltage drop, fusing, connectors, and mains work with qualified guidance.

## License

MIT. See [LICENSE](LICENSE).
