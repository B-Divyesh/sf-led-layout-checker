# Demo sandbox

- URL: `https://led-layout-checker.sociobot.in/?demo=1` (alias: `/demo`; local: `http://localhost:5173/?demo=1`).
- Sample: a 5 V garden arch with 480 pixels, three segments, one controller, and two supplies.
- Expected result: 11.5 A estimated current and two visible power-point warnings.
- Reset: use **Reset demo**. It replaces the demo plan with the sample and removes the demo license keys.
- Leave: use **Start for real**. It removes every demo key and opens the saved real plan, or a blank plan when none exists.
- Plan storage: `demo:led-layout-checker:layout:v1`; real plan: `led-layout-checker:layout:v1`.
- License storage: `demo:sb_license:led-layout-checker` and `demo:sb_license_check:led-layout-checker`. Demo mode never reads or writes the real `sb_license:*` keys.
- Network: planning needs no API. License verification runs only after a visitor enters or returns with a license.
