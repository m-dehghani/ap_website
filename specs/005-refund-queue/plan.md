# Phase 5 implementation plan — Admin money validation and refund queue

## Scope and decisions

Implement only Phase 5 of `plans/plan.md`, following `specs/constitution.md`
and `specs/005-refund-queue/spec.md`.

- Student registration amounts are non-negative integer values, and
  `paidAmount` may not exceed `totalAmount`.
- Registration statuses are `PENDING`, `APPROVED`, `CANCELLED`, and
  `COMPLETED`. Normal transitions are `PENDING` to `APPROVED`/`CANCELLED`
  and `APPROVED` to `COMPLETED`/`CANCELLED`. Any other change to a known
  status requires a non-empty reason in the request.
- Admin session create/update payloads use Zod schemas for required text,
  dates, positive integer duration/capacity, and the known session statuses
  (`SCHEDULED`, `ONGOING`, `COMPLETED`, `CANCELLED`).
- `ShopOrder.status` and `Payment.status` are Prisma `String` columns, not
  enums. `REFUND_REQUIRED` and `REFUNDED` therefore need no schema migration.
- Refund queue reads and transitions require `authorizeAdmin`. A transition
  is conditional on the current status still being `REFUND_REQUIRED`; races
  or already-completed transitions return a conflict. The app records the
  `REFUNDED` state only; staff handle the actual refund externally.
- Tuition `Payment.amount` remains rial in storage and is rendered in toman
  per the constitution. Shop amounts remain toman.
- The Persian admin page uses the existing AdminLayout, design tokens, and
  RTL conventions.

## Implementation sequence

1. Add targeted API tests for student amount/status validation, session
   POST/PUT validation, refund queue authorization/read behavior, and guarded
   refund transitions. Run them red before implementation.
2. Add Zod parsing and invariant checks to the admin student and session APIs.
   Preserve existing response shapes and only persist the approved fields.
3. Add `/api/admin/refunds` with admin-only queue reads and conditional
   `REFUND_REQUIRED` → `REFUNDED` updates for tuition payments and shop orders.
4. Add a Persian `/admin/refunds` staff page with loading, error, empty, queue,
   and per-row completion states; link it from the admin landing page.
5. Run focused tests, then `npm test`, `npm run typecheck`, `npm run lint`,
   and browser/e2e verification when the required runtime is available.
6. Write `converge.md` mapping each requirement to implementation evidence and
   actual validation results. Stop at Phase 5; do not commit.

## Acceptance evidence

- Invalid amounts, malformed student/session bodies, and overpayments return
  HTTP 400 without writes.
- A known but non-standard registration status transition is rejected unless
  the request includes a non-blank reason.
- Only admin-authorized requests can read or mutate the refund queue.
- The queue includes both tuition payments and shop orders currently in
  `REFUND_REQUIRED`; conditional updates prevent marking other statuses as
  refunded.
- No payment gateway refund API is invoked.
- The Persian queue is reachable from the admin dashboard and communicates
  empty, error, loading, and successful transition states.
