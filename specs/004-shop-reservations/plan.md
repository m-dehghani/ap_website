# Phase 4 implementation plan — Shop reservation consistency

## Objective

Make every shop-order reservation release atomic, guarded, and idempotent while
preserving the existing checkout and Zarinpal flows.

## Requirements and approach

1. Keep `releaseOrderReservation(tx, order)` as the single release primitive and
   use it in checkout-time stale-order cleanup, the scheduled expiry cleanup,
   gateway request failure, gateway cancellation/failure callbacks, and the
   late-success-after-expiry callback.
2. The helper uses a conditional `updateMany` (`reserved >= quantity`) for each
   order item and throws if any variant is absent or insufficiently reserved.
   The caller's transaction must roll back both the status transition and any
   earlier item releases when a mismatch occurs.
3. Keep release behind an atomic order-state transition or a fresh
   `PENDING_PAYMENT` read within the transaction. This ensures racing or
   duplicate callbacks cannot release the same reservation twice.
4. On verified payment after expiry, release only the remaining reservation
   and set `REFUND_REQUIRED`; do not decrement stock or record a sale. Repeated
   callbacks for terminal orders must not mutate inventory.
5. Add focused unit and API callback tests for cancellation, gateway failure,
   expiry, duplicate callback, late paid-after-expiry, and reservation mismatch.

## Files in scope

- `src/lib/shop.ts`
- `src/pages/api/shop/orders/index.ts`
- `src/pages/api/shop/orders/callback.ts`
- `src/__tests__/lib/shop.test.ts`
- New focused shop-order API test(s) under `src/__tests__/pages/api/shop/`
- `specs/004-shop-reservations/plan.md`
- `specs/004-shop-reservations/tasks.md`
- `specs/004-shop-reservations/converge.md`

No schema, UI, unrelated phase, or dependency changes are planned.

## Verification

Run the focused shop reservation tests during implementation, followed by the
phase-required gates: `npm test`, `npm run typecheck`, and `npm run lint`.
Record actual results and any limitations in `converge.md`.

## Completion criteria

- All relevant release paths call the shared helper.
- A missing variant or insufficient reservation raises an error and cannot
  partially commit.
- Terminal/duplicate callbacks do not release inventory again.
- Late successful payment after expiry becomes `REFUND_REQUIRED` without a
  stock decrement.
- Focused cases and all phase-required verification commands pass.
