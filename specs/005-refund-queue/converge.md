# Phase 5 convergence — Admin money validation and refund queue

## Requirement-to-diff mapping

| Requirement | Implementation evidence |
|---|---|
| Validate admin registration money and status updates with Zod. | `src/pages/api/admin/students/[id].ts` parses only supported fields, accepts non-negative integer amounts (including numeric input strings), rejects overpayment with HTTP 400, applies the documented registration transition graph, and requires a reason for non-standard transitions. A conditional `updateMany` compares status and existing amounts to prevent stale concurrent writes. |
| Give admins a reason path for exceptional status changes. | `src/pages/admin/students/[id].tsx` provides an optional Persian reason field, sends non-empty reasons, and displays the server's validation/conflict message. |
| Validate admin session POST and PUT bodies with Zod. | `src/pages/api/admin/sessions/index.ts` and `src/pages/api/admin/sessions/[id].ts` validate text, ISO date, supported status, identifiers, and bounded positive integer duration/capacity before writes. |
| Admin-authorized queue for tuition payments and shop orders. | `src/pages/api/admin/refunds.ts` calls `authorizeAdmin` for GET/PATCH; GET selects only `REFUND_REQUIRED` entries from `Payment` and `ShopOrder` and returns display-safe fields. |
| Safe external refund completion; no gateway call. | PATCH accepts only `payment`/`shopOrder` and conditionally updates `REFUND_REQUIRED` to `REFUNDED`; stale or ineligible records return 409. No refund gateway is called. Both Prisma status columns are `String`, so no migration is needed; supported values are documented in `prisma/schema.prisma`. |
| Persian staff interface and dashboard discovery. | `src/pages/admin/refunds.tsx` provides RTL queue, toman display, accessible responsive table, loading/error/empty states, refresh and completion feedback. `src/pages/admin/index.tsx` links the queue; `src/pages/admin/shop/index.tsx` labels the new `REFUNDED` status in Persian. |
| Focused regression tests. | `src/__tests__/pages/api/admin/students/[id].test.ts`, `src/__tests__/pages/api/admin/sessions/{index,[id]}.test.ts`, `src/__tests__/pages/api/admin/refunds.test.ts`, and `src/__tests__/pages/admin/refunds.test.tsx` cover validation boundaries, authorization, eligible transitions, stale writes, and queue UI behavior. `e2e/admin-refunds.spec.ts` adds a browser scenario with stubbed auth/API responses. |

## Validation performed

- `npm test` — passed: 28 files, 162 tests.
- `npm run typecheck` — passed (`next typegen` and `tsc --noEmit`).
- `npm run lint` — passed with 0 errors; ESLint reported 379 warnings.
- `git diff --check` — passed.
- `npm run test:e2e -- --list` — discovered the new Playwright scenario.
- Browser execution was unavailable: the local app could not bind port 3000
  or 3001 (`listen EACCES`), including loopback, and no server was running. The
  E2E scenario is therefore present but not claimed as executed.

## Scope and worktree

The implementation stops at Phase 5. No gateway refund integration or schema
migration was added. Changes remain uncommitted on branch `dev`; the worktree
is ready for review, with live browser verification as the outstanding
environment limitation.
