# Phase 7 — Attendance convergence

| Requirement | Implementation | Evidence |
|---|---|---|
| Admin and coach can record PRESENT, ABSENT, LATE, or EXCUSED attendance. | Added Zod-validated `POST`/`PUT` attendance routes and shared transactional upsert logic in `src/lib/attendance.ts`. | `src/__tests__/pages/api/admin/attendance.test.ts` validates status, per-user/session upserts, and owning-coach writes. |
| Coaches are restricted to their own session and program. | Coach route re-reads `COACH` via `requireRole()` and requires both `session.coachId` and `program.coachId` to match the authenticated coach. | API test asserts a non-owning coach gets 403 without transaction/write; owner succeeds. |
| Attendance is only recorded for actively enrolled students. | Requested users must have `PENDING` or `APPROVED` registrations in the session program inside the write transaction; admin and coach roster queries use the same statuses. | API test confirms active registration filtering and that a missing roster member returns 400 with no upserts. |
| Admin and coach have Persian roster controls. | Shared accessible roster form is displayed in admin session edit and coach upcoming session cards; successful and failed saves are announced. | `src/__tests__/components/AttendanceRoster.test.tsx`; `e2e/attendance.spec.ts` added for browser verification. |
| Each student can see their own attendance history. | Student GSSP selects attendance through the authenticated user's ID and exposes safe session details; dashboard renders Persian status/history. | `src/__tests__/pages/student/dashboard.test.ts` and `dashboard-ui.test.tsx`. |
| Preserve existing unique `(userId, sessionId)` attendance constraint. | Existing Prisma model/unique constraint reused; no schema migration. | `prisma/schema.prisma` unchanged. |

## Validation

- `npm test` — passed: 36 files, 190 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed (exit 0; repository-wide warnings remain; no errors).
- Focused ESLint on attendance changes — passed (exit 0; existing `no-explicit-any`
  warnings in `src/pages/coach/dashboard.tsx`).
- Playwright test discovery — passed and found the new attendance test.
- `npm run test:e2e -- e2e/attendance.spec.ts` — attempted; browser navigation
  could not connect to `http://localhost:3000` (`ERR_CONNECTION_REFUSED`).
  Starting `npm run dev -- --hostname 127.0.0.1` was denied by the environment
  (`listen EACCES`), so browser verification was unavailable.

## Scope notes

- No schema or migration changes were needed; the attendance model and composite
  unique key already exist.
- No other phase requirements were added or changed.
- Changes are uncommitted as requested.
