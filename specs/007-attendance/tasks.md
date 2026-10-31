# Phase 7 — Attendance tasks

- [x] Add Zod schemas and admin attendance API with role enforcement,
  registration validation, and transactional per-user/session upserts.
- [x] Add coach attendance API with strict session `coachId`/program ownership
  enforcement and the same registration/upsert guarantees.
- [x] Add focused API tests for unauthorized coach, non-enrolled users,
  malformed status, and independent create/update for user-session pairs.
- [x] Add Persian attendance roster controls to admin session detail and coach
  dashboard; cover status selection and save feedback with focused UI tests.
- [x] Select and render the signed-in student's own attendance history in the
  student dashboard; test visibility and safe serialized props.
- [x] Run `npm test`, `npm run typecheck`, and `npm run lint`; attempt browser
  verification and record outcomes/limitations in `converge.md`.
