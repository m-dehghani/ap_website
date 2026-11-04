# Phase 4 quality gates

## Automated coverage in the existing CI

- `npm test` includes a focused axe-core scan of the Hero pagination controls.
- Playwright is configured for Chromium, Firefox, and WebKit. Install browsers with
  `npx playwright install chromium firefox webkit`, start the site, then run
  `npm run test:e2e -- --project=chromium --project=firefox --project=webkit`.
- `e2e/phase4-rtl.spec.ts` checks Persian document direction and measures the
  Hero pagination hit boxes at a 390px viewport. This is browser geometry
  coverage only; it is not a physical-device verification.

## Deferred CI integrations

- Visual-regression providers (for example Percy or Chromatic) need an approved
  provider and project credentials. No provider is configured, so CI does not
  call an external service or fail on missing secrets.
- Lighthouse CI budgets need a stable production-like URL and a defined
  representative route/data profile. The current workflow has no running app
  server or seeded database, so performance budgets are not yet enforced.
- The current workflow also does not provision an application server or the
  Firefox/WebKit browser binaries. Cross-browser tests are opt-in until a
  suitable E2E base URL and browser installation are configured.
