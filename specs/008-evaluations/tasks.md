# Phase 8 tasks — Evaluations

- [x] **API regression tests** — Cover coach/admin GET and POST, student-role
  denial, coach identity-source check, cross-program coach 403, score bounds
  (including 0 and 11), and database create/list scoping.
- [x] **Coach evaluation API** — Add `/api/coach/evaluations`; validate all five
  integer scores in [1, 10], accept optional notes, verify student enrollment
  in a program owned by the authenticated coach, and scope GET to that coach.
- [x] **Admin evaluation API** — Add `/api/admin/evaluations`; authorize via
  the shared admin helper, validate POST input, and support evaluation listing.
- [x] **Coach dashboard integration** — Add safe GSSP data for evaluations and
  students in the coach's programs; provide Persian list/form with labelled
  bounded controls and accessible pending/success/error feedback.
- [x] **Student dashboard integration** — Load only the authenticated user's
  evaluations in GSSP and show read-only Persian cards; add no student write
  route/control.
- [x] **Dashboard tests** — Verify coach list/form rendering, student-only
  GSSP query/serialization, and student read-only card rendering.
- [x] **Phase verification and convergence** — Run `npm test`,
  `npm run typecheck`, `npm run lint`, attempt browser/e2e, and map each
  requirement to implementation and observed validation in `converge.md`.
