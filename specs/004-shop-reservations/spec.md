# Phase 4 — Shop reservation consistency

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a shop customer, a cancelled, failed, or expired order releases its stock
  reservation exactly once.
- As the academy, a late payment after expiry is queued for refund without
  corrupting stock.

## Functional requirements

- Use one shared reservation-release helper for cancellation, gateway failure,
  and expiry paths.
- Guard reservation decrements with a sufficient-reserved quantity condition.
- Treat stock/reservation mismatches as errors rather than silently corrupting
  counts.
- Do not decrement stock again for a late-paid-after-expiry order or duplicate
  callback.

## Success criteria

- Tests cover cancellation, gateway failure, expiry, duplicate callback, and
  late payment after expiry.
- Reserved stock never becomes negative; each reservation is released no more
  than once.
- All relevant release paths use the shared helper.

## Scope and verification from the parent plan

Follow Phase 4 in [`plans/plan.md`](../../plans/plan.md). Run the program's
test, typecheck, and lint gates.
