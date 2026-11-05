# Phase 18 convergence — Admin-configurable payment gateways

## Result

Implemented the clarified Phase 18 scope:

| Provider | Admin configuration | New checkout | Callback verification | Final status |
|---|---|---|---|---|
| Zarinpal | Encrypted stored credential; existing server environment fallback | Enabled only when configured and selected as the sole default | Uses the persisted provider and credential, including for disabled gateways with pending transactions | Live |
| Zibal IPG | Encrypted merchant credential | Enabled only when configured and selected as the sole default | Verifies `trackId` server-side and requires paid status and exact expected rial amount | Live |
| Pasargad | No credentials or mutation support; informational UI only | Never selected | No adapter or callback path | Deferred; official PEP page returned HTTP 403 |

The admin API is admin-authorized and Zod-validated. It returns only
configuration metadata, encrypts credentials with AES-256-GCM using
`PAYMENT_CONFIG_ENCRYPTION_KEY`, and fails closed if the key is missing or
invalid. Credential replacement/removal is blocked while unresolved
transactions may still require provider verification. The UI never returns or
prefills secrets and offers no Pasargad enablement control.

Both checkout flows now snapshot provider identity. Callbacks ignore provider
success claims and verify against that stored provider. Existing lifecycle
rules remain: shop reservations release conditionally, repeated callbacks do
not apply payment twice, expired/late verified payments enter
`REFUND_REQUIRED`, and refunds remain staff-handled. No refund API is called.
Shop totals remain toman in storage; adapter requests use rial. Tuition
`Payment.amount` remains rial.

## Changed scope

- Added the admin configuration API/page, sidebar link, provider contract and
  Zarinpal/Zibal adapters, authenticated credential encryption, and provider
  dispatch in student/shop checkout and callbacks.
- Added provider identity/configuration schema fields and migration. Existing
  shop order references are retained through a column/index rename.
- Added provider/configuration/lifecycle/UI tests, the Phase 18 convergence
  and task artifacts, and payment operations documentation.
- No Phase 17/19/20/21 product code was changed as part of this phase. Changes
  are included in the requested combined Phases 17–21 commit.

## Evidence and validation

- Lifecycle prerequisite audit before gateway implementation: 5 focused
  Phase 3–5 test files, 30 tests passed.
- Focused Phase 18 mocked suites: 7 files, 37 tests passed.
- Full suite: `npm test -- --run` — 82 files, 390 tests passed.
- TypeScript: `npm run typecheck` passed.
- Lint: `npm run lint` passed with 0 errors; repository-wide lint reported
  372 warnings.
- Prisma: `npx prisma generate` and `npx prisma validate` passed.
- Whitespace: `git diff --check` passed.
- Browser: Chromium Playwright test `e2e/payment-gateways-admin.spec.ts`
  passed (1 test), verifying the admin settings page and that Pasargad has no
  input or action controls.
- Phase 21's requirements audit found no direct Zarinpal request/verification
  contract test. Added `src/__tests__/lib/zarinpal-adapter.test.ts`, which
  mocks outbound HTTP and verifies checkout request fields, payment
  verification, cancellation, and provider failures.
- Final cross-phase Vitest validation after that audit passed 89 files /
  426 tests; current coverage and quality-gate totals are recorded in
  `specs/021-test-suite-audit/converge.md`.

The migration file was created and schema-validated but not applied to a live
database. No live gateway credentials or provider sandbox were used.

## Remaining rollout decisions

- Provision the deployment-managed base64-encoded 32-byte
  `PAYMENT_CONFIG_ENCRYPTION_KEY` before saving database credentials or
  enabling checkout. Key rotation requires a planned credential re-encryption.
- Confirm production Zarinpal/Zibal merchant account readiness and test using
  provider-approved sandbox/account credentials before production launch.
- Keep Pasargad deferred until PEP supplies verifiable official product,
  endpoint, credential, callback, and account-readiness details.
