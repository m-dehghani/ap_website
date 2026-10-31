# Phase 3 implementation plan — Tuition payment expiry

## Decisions

- Persist an optional `Payment.expiresAt` timestamp and set it to the shared
  15-minute checkout TTL for every payment created in a tuition checkout.
- Backfill existing pending Zarinpal payments from `createdAt` so deployment
  does not extend an abandoned checkout's lifetime.
- In the checkout transaction, fail expired pending Zarinpal payments before
  checking for another active pending payment.
- In the verified callback transaction, check expiry again against the current
  database payment state. An expired successful payment becomes
  `REFUND_REQUIRED`; only an unexpired payment for an eligible registration
  within its remaining balance can credit tuition.
- Keep shop and tuition checkout windows in sync through
  `src/lib/payments.ts`.

## Files and changes

- `prisma/schema.prisma`
  - Add nullable `Payment.expiresAt` and an index for method/status/expiry.
- `prisma/migrations/<timestamp>_tuition_payment_expiry/migration.sql`
  - Add the nullable column, backfill pending Zarinpal payment expirations,
    and add the index.
- `src/lib/payments.ts`
  - Export the shared `CHECKOUT_TTL_MS` constant.
- `src/pages/api/student/payments/index.ts`
  - Expire stale pending checkouts transactionally and set expiry on newly
    created checkout payments.
- `src/pages/api/student/payments/callback.ts`
  - Select expiry metadata and route verified late success to
    `REFUND_REQUIRED` without updating registration balances.
- `src/pages/api/shop/orders/index.ts`
  - Use the shared checkout TTL for new shop orders.
- `src/__tests__/pages/api/student/payments.test.ts`
  - Cover stale-checkout release, new checkout creation, and persisted expiry.
- `src/__tests__/pages/api/student/payment-callback.test.ts`
  - Cover late success refund handling and ordinary timely success.
- `specs/003-tuition-expiry/tasks.md`
  - Track implementation and verification.
- `specs/003-tuition-expiry/converge.md`
  - Record requirement coverage, validation, and any deviations.

## Verification

1. Run targeted tuition payment initialization and callback tests.
2. Verify an expired pending checkout no longer blocks a retry and that a
   verified late success is queued without crediting its registration.
3. Run `npm test`, `npm run typecheck`, and `npm run lint`.
4. Review the diff against the spec and record convergence evidence.

This phase does not change tuition currency, gateway behavior, or introduce a
Zarinpal refund call.
