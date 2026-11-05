# Phase 21 implementation plan — Test completeness and suite-value audit

## Approach

Inventory the existing test tree and scripts, map the Phase 17–20 critical
requirements to existing assertions, and run the prescribed quality gates.
Add or adjust tests only for a documented uncovered behavior. Retain all
existing tests unless a concrete duplication or lack-of-assertion case is
proved. Do not change product behavior during this audit except for a test
gap that is necessary to meet the agreed requirements.

## Files and changes

- `vitest.config.ts`, `playwright.config.ts`, and `package.json`: record the
  available test runners, coverage provider, and browser projects.
- `src/__tests__/`: inventory unit, page, API, and integration-level tests;
  add only focused regressions for documented gaps.
- `e2e/`: map browser journeys to public and admin flows; run relevant tests
  where the environment permits.
- `specs/021-test-suite-audit/converge.md`: publish the requirements-to-tests
  matrix, exact test and coverage results, any removals, and residual gaps.

## Validation

1. Rebaseline test and E2E file counts and inspect test scripts/configuration.
2. Run focused Phase 17–20 tests, including the Phase 20 news playback
   integration.
3. Run `npm test`, `npm run test:coverage`, `npm run typecheck`,
   `npm run lint`, and `npm run build`.
4. Run relevant Playwright projects/specs; report browser startup or execution
   failures as unavailable/failed rather than passed.
5. Run `git diff --check` and compare the final matrix against the phase
   requirements.

## Risks and constraints

- Coverage percentages do not prove behavior; use requirement-to-test mapping
  and assertion review alongside aggregate reports.
- Live migrations, durable storage across redeploys, and real provider calls
  require deployment credentials and remain out of scope for local tests.
- Browser binaries or local server networking may be unavailable in the
  execution environment; preserve the exact diagnostic in the convergence
  report.
