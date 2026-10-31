# Phase 4 convergence — Shop reservation consistency

## Requirement mapping

| Requirement | Implementation | Validation |
|---|---|---|
| Share reservation release across cancellation, gateway failure, and expiry | The existing `releaseOrderReservation` helper is used in checkout stale-order cleanup, scheduled expiry cleanup, gateway request failure, cancellation and gateway-failure callbacks, and late-success expiry handling. | Focused callback tests cover cancellation, gateway failure, and late success; `shop.test.ts` covers expiry cleanup. |
| Never decrement reserved below zero; mismatches are errors | `src/lib/shop.ts` conditionally decrements only when `reserved >= quantity` and throws for an absent variant or insufficient reservation. | Unit tests assert the conditional update and mismatch behavior. |
| Release at most once under duplicate/racing transitions | Each path releases only after a pending-state check/conditional transition in its transaction. The expiry cleanup race test confirms a failed pending-state transition skips the release. | Unit test covers a lost expiry transition; callback tests cover repeated cancellation and repeated late-payment callbacks. |
| Late verified payment after expiry becomes `REFUND_REQUIRED` without stock decrement | `src/pages/api/shop/orders/callback.ts` queues both still-pending expired orders and already-cancelled expired orders for refund. Already-released expired orders do not release again; neither path decrements stock or increments sold count. | Callback tests cover late payment with a pending order and after expiry cleanup, and a repeated late-payment callback. |

## Validation results

- Focused reservation tests: passed — 2 files, 16 tests.
- `npm test`: passed — 23 files, 126 tests.
- `npm run typecheck`: passed — Next route types generated and TypeScript completed.
- `npm run lint`: passed — exit code 0.
- `git diff --check`: passed.

## Deviations and limitations

- The shared helper and most release-path integrations already existed. Phase 4
  changes were limited to failing closed for missing variant IDs and handling a
  verified late payment when expiry cleanup had already changed the order to
  `CANCELLED`.
- No schema, UI, unrelated phase, or dependency changes were made. No database
  integration test was run; transaction behavior is covered with focused
  mocked tests.
