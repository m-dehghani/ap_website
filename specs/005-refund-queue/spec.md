# Phase 5 — Admin money validation and refund queue

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As an admin, I cannot enter payment amounts or status transitions that
  violate financial invariants.
- As staff, I can find shop orders and tuition payments requiring refunds.
- As staff, I can record that an externally handled refund is complete.

## Functional requirements

- Validate admin student payment updates and admin session mutations with Zod.
- Reject paid amounts above total amounts and illegal status transitions unless
  an explicit reason is provided.
- Add an admin-authorized refund queue for tuition payments and shop orders in
  `REFUND_REQUIRED`.
- Support marking a queued item `REFUNDED` after handling it outside the app;
  never call a gateway refund API.
- Link the queue from the admin landing page.

## Success criteria

- Invalid money updates return 400.
- Staff can view the queue and transition eligible items to `REFUNDED`.
- Browser verification confirms the queue is usable end-to-end.
- Tests cover validation and queue transitions.

## Scope and verification from the parent plan

Follow Phase 5 in [`plans/plan.md`](../../plans/plan.md), including resolving
whether shop order status needs an additional value. Run the program's test,
typecheck, and lint gates and browser-verify the UI.
