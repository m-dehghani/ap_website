# Phase 21 specification — Test completeness and suite-value audit

## Status

Clarified for implementation after Phases 17–20. Existing tests are retained
unless evidence shows that a test has no meaningful assertion, duplicates
another test without a distinct invariant, or protects retired behavior.
No tests will be removed merely to reduce runtime or hide failures.

## Problem and outcome

The feature phases added authentication, registration activation, payment
gateways, public content, and media behavior. This phase checks whether the
most important requirements have deterministic, meaningful automated
coverage and reports any remaining gaps without claiming unavailable checks.

## User stories

- As a maintainer, I can trace every critical user-facing invariant to a
  focused unit, API/integration, or browser test.
- As a maintainer, I can run unit and integration suites without contacting
  production services or depending on credentials.
- As an operator, I can distinguish verified local behavior from checks that
  require a live deployment, database, provider account, or browser runtime.

## Functional requirements

- **FR-21.1 — Coverage inventory:** Map critical behaviors from Phases 17–20
  to concrete tests, including auth and role checks, registration/CAPTCHA/
  activation/proof, student/shop checkout, gateway adapters and callbacks,
  refunds and reservations, uploads/storage authorization, Aparat URL
  validation, video playback, news/product navigation, and admin layout.
- **FR-21.2 — Meaningful assertions:** Retained tests must assert observable
  behavior, a required invariant, or a regression. Record representative
  assertions and identify any behavior with no meaningful test.
- **FR-21.3 — Safe test retention:** Remove a test only with a documented
  reason and only when its unique behavior remains covered. Do not remove
  tests to reduce runtime or bypass failures.
- **FR-21.4 — Deterministic boundaries:** Unit and API suites must mock
  external provider, delivery, and storage boundaries. Production/sandbox
  smoke tests remain opt-in and credential-gated.
- **FR-21.5 — Quality gates:** Run focused tests, the complete Vitest suite,
  coverage, typecheck, lint, build, and relevant Playwright tests. Record
  exact results; mark environment-dependent or unavailable checks explicitly.

## Acceptance criteria

- Every critical in-scope behavior is linked to at least one meaningful test
  at an appropriate level, or listed as a residual gap with its reason.
- Each configured payment provider has isolated mocked request/verify
  coverage and callback/post-payment behavior.
- No test is removed without individually justified evidence.
- The final report records suite counts, coverage output, quality-gate results,
  browser results, and environment limitations without implying unrun checks
  passed.
