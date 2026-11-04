# Phase 6 — Contact inbox convergence

## Requirement-to-change mapping

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Public contact submissions are validated and persisted | `src/pages/api/contact.ts` validates names, email, optional phone, and message with Zod; creates a `ContactMessage` in `NEW` state. | `src/__tests__/pages/api/contact.test.ts` covers invalid payload rejection and successful creation. |
| Reject likely spam and do not log message bodies | The API rejects a filled `company` honeypot without writing; persistence errors log only a sanitized error type, never request content. | Contact API tests cover honeypot rejection and persistence failure logging without submitted content. |
| Admin-only inbox list and state changes | `src/pages/api/admin/messages.ts` protects GET/PATCH with `authorizeAdmin`, selects inbox fields, validates `NEW`/`READ`/`ANSWERED`, and conditionally updates against the expected current state. | `src/__tests__/pages/api/admin/messages.test.ts` covers authorization, list, status validation, accepted statuses, and stale-update conflict. |
| Persian contact page submits to the API; mailto is failure-only | `src/pages/contact.tsx` posts to `/api/contact`, renders a mailto fallback only after network/server failure, and keeps Persian copy. | `src/__tests__/pages/contact.test.tsx` covers labelled controls, successful submission, validation announcements, and failure fallback. |
| Admin can use the inbox and update message state | `src/pages/admin/messages.tsx` lists messages and provides state controls; `src/components/AdminLayout.tsx` adds the Persian inbox link. | `src/__tests__/pages/admin/messages.test.tsx` covers list/update/error UI; `e2e/contact-inbox.spec.ts` defines browser flows. |

No Prisma migration was needed: `ContactMessage` and its `NEW`/`READ`/`ANSWERED`
status field already exist in `prisma/schema.prisma`.

## Validation

- Focused API/UI Vitest tests: passed during implementation.
- `npm test`: passed, 32 test files and 180 tests.
- `npm run typecheck`: passed (`next typegen` and `tsc --noEmit`).
- `npm run lint`: passed with 0 errors and 379 existing repository warnings.
- `git diff --check`: passed.
- `npm run build`: not run; not a requested Phase 6 gate.
- Browser attempt: `npm run test:e2e -- e2e/contact-inbox.spec.ts` ran 2 tests;
  0 passed and 2 failed because the app server was unavailable. Starting
  `npm run dev` failed with `listen EACCES` on `0.0.0.0:3000`; retrying with
  `--hostname 127.0.0.1 --port 3100` also failed with `listen EACCES`.
  Playwright consequently reported `net::ERR_CONNECTION_REFUSED` for
  `http://localhost:3000`. Browser verification remains blocked by the
  environment, not by an observed application assertion.

## Scope and deviations

Changes are limited to Phase 6 inbox APIs, Persian contact/inbox UI, focused
tests, browser scenarios, and the required phase artifacts. No commit was made.
