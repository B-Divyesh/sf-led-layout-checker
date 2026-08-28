# LED Layout Checker — adversarial review handoff

## Verdict

**FAIL** on 2026-08-28 for candidate `37278b880d18526a6cfd1c787af24764627a3ece`.

The full report is `.factory/review-1.md`. It records 21 findings: 2 blocking, 9 major, and 10 minor. No product code was modified.

The blocking defects are:

1. `/demo` reads and writes real Studio license keys.
2. After service-worker installation, unknown navigations return the cached app shell with HTTP 200 instead of the designed 404 response.

## Verification performed

```sh
npm ci
npm run test:e2e -- --grep @claim:sample-preflight
npm run test:unit -- -t @claim:preflight-rules
npm run test:e2e -- --grep @claim:svg-export
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:demo-sandbox
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:studio-license
npm run test:e2e -- --grep @claim:daily-license-check
npm run test:e2e -- --grep @claim:studio-checkout
npm run lint
npm test
npm run build
mkdir -p /tmp/led-review-1-verify
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://led-layout-checker.sociobot.in /tmp/led-review-1-verify
```

All nine declared claim commands passed. The complete repository suite passed: 4 unit tests, 24 Playwright tests, lint, and two production builds; `dist/` was produced. Live Playwright checks covered mobile/desktop first read, demo reset/exit and storage sentinels, request logging, offline reload, all routes, metadata, history focus, 200% reflow, touch targets, reduced motion, the previous controller/coordinate/overflow repairs, and Axe scans. The internal/public link crawl passed; live checkout returned 303 to Dodo.

## Next steps

Repair findings in severity order, add the missing sandbox/404/claims regressions described in the report, deploy, and rerun the full checklist from scratch. Do not treat the passing declared tests as acceptance: their current scope misses the real-license demo leak and several public claims.
