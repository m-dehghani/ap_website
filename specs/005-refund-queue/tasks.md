# Phase 5 tasks — Admin money validation and refund queue

## 1. Student money and status validation

- [x] Add focused API tests for negative/non-integer amounts, overpayment,
  allowed status transitions, rejected status transitions, and reason-based
  override; assert rejected requests do not write.
- [x] Validate the admin student PUT body with Zod and compare partial amount
  edits against the persisted registration values.
- [x] Validate registration status values and require a non-blank reason for
  non-standard transitions.

## 2. Admin session validation

- [x] Add focused POST and PUT API tests for malformed dates, empty required
  text, invalid status, and non-positive/non-integer duration or capacity.
- [x] Add Zod schemas for admin session POST/PUT; reject invalid bodies with
  HTTP 400 before Prisma calls while preserving valid session behavior.

## 3. Refund queue API

- [x] Add tests proving non-admin requests are denied and GET includes only
  tuition payments and shop orders in `REFUND_REQUIRED`.
- [x] Add tests proving PATCH marks each supported item `REFUNDED` only when
  its current status is still `REFUND_REQUIRED`; reject unknown types and
  stale/non-eligible items without a write.
- [x] Implement `/api/admin/refunds` using `authorizeAdmin`, narrow `select`
  results, and conditional updates. Do not call a gateway refund service.

## 4. Persian staff queue UI

- [x] Build `/admin/refunds` with RTL Persian labels, loading/error/empty states,
  a semantically labelled responsive table, and a per-item completion action.
- [x] Link the queue from `/admin`.
- [x] Add focused component tests for visible queue entries, empty/error states,
  and successful completion feedback.

## 5. Verify and converge

- [x] Run focused tests and the complete `npm test`, `npm run typecheck`, and
  `npm run lint` gates.
- [x] Check browser/e2e availability; report the blocked runtime without
  overstating browser verification.
- [x] Write `converge.md` mapping requirements to diffs and actual validation.
- [x] Confirm the worktree remains uncommitted and contains only Phase 5 work.
