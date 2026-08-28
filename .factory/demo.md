# Demo sandbox

- URL: `https://led-layout-checker.sociobot.in/demo` (locally, `http://localhost:5173/demo`).
- Sample: a 5 V garden arch with 480 pixels, three segments, one controller, and two supplies.
- Expected result: 11.5 A estimated current and two visible power-injection warnings.
- Reset: use **Reset demo** in the persistent amber banner.
- Leave: use **Start for real**. This deletes the demo copy and opens the real plan.
- Storage: demo data uses `localStorage` key `demo:led-layout-checker:layout:v1`; real data uses `led-layout-checker:layout:v1`.
- Network: the demo itself needs no API. License verification only runs after a visitor enters a license.
