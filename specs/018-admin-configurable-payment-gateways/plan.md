# Phase 18 implementation plan — Admin-configurable payment gateways

**Status:** Implemented. Zarinpal and the
documentation-verified Zibal IPG. Show Pasargad as deferred in the admin UI;
do not add Pasargad configuration controls, credentials, or checkout.

## Gate

The Phase 3–5 lifecycle prerequisites were revalidated by 30 passing focused
tests on 2026-11-05; see `spec.md`. Zibal's official OpenAPI contract is
verified and recorded in `spec.md`. Pasargad remains intentionally deferred
because the official PEP page returned 403 and its API/product contract is
unverified; this does not block the scoped Zarinpal/Zibal implementation.

## Proposed design after gate approval

1. Translate Zibal's official OpenAPI and current Zarinpal behavior into typed
   adapter request/response contracts. Zibal uses
   `https://gateway.zibal.ir`, `POST /v1/request` with `merchant`, rial
   `amount`, and `callbackUrl`; callbacks provide `success`, `trackId`,
   optional `orderId`, and `status`; always call `POST /v1/verify` and check
   its result, paid status, and exact rial amount. Direct the browser to
   `/start/{trackId}` so the registered-domain Referer is sent.
2. Add server-only payment configuration storage. Encrypt credential
   material with authenticated encryption keyed by the validated
   `PAYMENT_CONFIG_ENCRYPTION_KEY`; reject credential writes and encrypted
   credential use when that key is missing or invalid. Return only non-secret
   configured/enabled/default metadata. Validate every admin mutation with Zod
   and authorize before data access. Expose Pasargad only as a fixed deferred
   state and reject Pasargad mutation attempts.
3. Add a stable provider field to tuition payments and shop orders through a
   migration. Backfill existing rows to Zarinpal while preserving all current
   references, pending state, and expiration values. Keep an order's existing
   Zarinpal authority intact; use explicit provider-scoped lookup for new
   callbacks.
4. Route student checkout, shop checkout, and both callbacks through the
   selected persisted provider. Snapshot provider identity on each transaction;
   never infer it from a mutable default. Continue using the Phase 3–5
   conditional lifecycle transitions and existing manual-refund queue. The
   runtime registry includes only Zarinpal and Zibal.
5. Add mocked adapter and route tests, update payment operations documentation,
   then run focused tests, the prescribed repository test/typecheck/lint gates,
   and relevant browser tests. Do not add refund API calls.

## Candidate files

- Adapters/contract: `src/lib/zarinpal.ts`, `src/lib/payments.ts`, and new
  `src/lib/payment-providers/` modules for Zarinpal and Zibal only.
- Configuration: new server-only payment config/encryption module;
  `src/pages/api/admin/payment-gateways.ts` and
  `src/pages/admin/payment-gateways.tsx`.
- Checkout/callback dispatch:
  `src/pages/api/student/payments/index.ts`,
  `src/pages/api/student/payments/callback.ts`,
  `src/pages/api/shop/orders/index.ts`, and
  `src/pages/api/shop/orders/callback.ts`.
- Persistence: `prisma/schema.prisma` and one migration that backfills legacy
  provider identity as Zarinpal without rewriting references or lifecycle
  fields.
- Tests: existing student-payment, tuition callback, shop checkout/callback,
  and refund regression suites under `src/__tests__/`; new adapter,
  encryption/configuration, and UI tests under `src/__tests__/lib/` and
  `src/__tests__/pages/`.
- Operations: `docs/application.md` and the phase convergence matrix.

Pasargad's exact product, API, credentials, and account status remain
unresolved; do not infer them or enable Pasargad. The installed Next.js Pages
Router pages/layouts, API Routes, and forms documentation was inspected before
UI route edits.

## Validation plan

- Focused mocked tests for Zarinpal and Zibal request/response, failures,
  amount units, and credential non-disclosure.
- Tuition and shop callback lifecycle matrix across both active providers:
  success once, cancellation/failure, duplicate callback, expiry/late success,
  and refund-required with no refund API invocation.
- Admin config authorization, Zod rejection, encrypted persistence,
  missing/invalid-key fail-closed behavior, secret replacement/clear, and
  secret-free response/log assertions; API rejection and UI state for deferred
  Pasargad with no enable switch.
- Migration review plus `npx prisma validate` and generated client check.
- `npm test`, `npm run typecheck`, `npm run lint`, `git diff --check`, and
  browser verification for the admin configuration UI if implemented.
