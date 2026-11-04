# Phase 7 — Attendance implementation plan

## Goal

Let admins and coaches record attendance for registered students, and let each
student view their own attendance history. Preserve the existing
`Attendance` model and unique `(userId, sessionId)` constraint.

## Design

- Use the existing Pages Router, `getPrisma()`, `getSession()` /
  `requireRole()`, and Zod conventions.
- Add admin `POST`/`PUT /api/admin/sessions/[id]/attendance` and coach
  `POST`/`PUT /api/coach/sessions/[id]/attendance` endpoints. Requests contain
  a non-empty list of `{ userId, status, notes? }`; validate status as
  `PRESENT | ABSENT | LATE | EXCUSED`.
- Re-read roles through the shared auth helpers. Admin routes require `ADMIN`.
  Coach routes require an active coach session and verify the session's
  `coachId` and program ownership against the authenticated coach. Return 403
  for sessions outside that ownership scope.
- Before writing, verify every attendance user has a `Registration` in the
  session's program with an active `PENDING` or `APPROVED` status. Reject the
  entire request if any user is not actively enrolled.
- Upsert by the existing `(userId, sessionId)` unique key, retaining per-user,
  per-session update behavior. Use a transaction for roster writes.
- Add Persian attendance controls to the existing admin session detail and
  coach dashboard. Keep status options explicit, show pending/error/success
  feedback accessibly, and submit through the authorized endpoint.
- Extend the student dashboard GSSP query to select only the signed-in
  student's attendance and safe session details; render a Persian history
  section without changing unrelated dashboard behavior.
- No schema migration is expected. No attendance bulk delete, reporting,
  evaluation, or unrelated dashboard refactor is in scope.

## Validation

- Focused API tests: coach outside session ownership gets 403; non-enrolled
  user is rejected without partial writes; upsert/update remains isolated to
  each user-session pair; admin auth and invalid status are covered.
- Focused UI/GSSP tests: roster controls submit the chosen status and the
  student sees only their own history.
- Run `npm test`, `npm run typecheck`, and `npm run lint`; attempt Playwright
  verification and record environmental limitations in `converge.md`.
