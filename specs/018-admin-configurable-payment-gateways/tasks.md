# Phase 18 tasks — Admin-configurable payment gateways

**Status:** Clarified and implemented for Zarinpal and Zibal. Pasargad is
deferred; only its disabled informational UI state is in scope.

## Implementation tasks

- [x] Implement AES-256-GCM credential encryption with strict
  `PAYMENT_CONFIG_ENCRYPTION_KEY` validation; add tests for round-trip,
  tampering, malformed keys, and missing-key fail-closed behavior.
- [x] Add persisted gateway configuration for Zarinpal/Zibal; implement
  admin-only GET/PUT with Zod, replacement/clear semantics, secret-free
  responses, and a single enabled default invariant. Reject Pasargad mutations.
- [x] Build the Persian admin UI with credential replacement/clear, enablement,
  default selection, loading/error/success states, and a Pasargad deferred
  row that has no enable or credential control. Cover these states in tests.
- [x] Add provider identity to tuition payments and shop orders. Migrate
  existing transactions to Zarinpal without changing references, pending
  statuses, or expiry fields.
- [x] Define typed provider adapters. Preserve the existing Zarinpal contract;
  implement Zibal using the official IPG contract: `/v1/request` takes JSON
  merchant, integer rial amount, callback URL; `/v1/verify` takes merchant and
  trackId; verify result, paid status and exact rial amount; redirect browser
  to `/start/{trackId}`.
- [x] Dispatch both checkout routes and callbacks through persisted provider
  identity. Callback query data is untrusted; keep Phase 3–5 expiry,
  reservation, refund-required, and idempotency transitions unchanged.
- [x] Add adapter-boundary HTTP mocks and Zarinpal/Zibal tuition/shop lifecycle
  tests. Assert no refund API is invoked and Pasargad cannot be enabled or
  selected.
- [x] Update `docs/application.md` with verified Zibal details, encryption-key
  provisioning, units, Pasargad deferral, and operations.
- [x] Run full suite, lint, and browser verification; record final outcomes in
  `converge.md`. Full Vitest suite, typecheck, lint, Prisma validation/client
  generation, whitespace checks, and the Chromium admin UI check passed.
