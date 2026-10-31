# Phase 8 implementation plan — Evaluations

## Scope and requirements

Implement only Phase 8 from `plans/plan.md`, using the existing `Evaluation`
model. Coaches may create evaluations only for students enrolled in a program
owned by that coach; admins may create and list evaluations. A student may see
only their own evaluation history in the student dashboard and has no write
API. Each of the five scores (`technical`, `physical`, `mental`, `teamwork`,
`overall`) must be an integer from 1 through 10, inclusive; notes are optional.

The existing Prisma model has `id`, five integer scores, nullable `notes`,
`createdAt`/`updatedAt`, `userId` → `User`, and `coachId` → `Coach`. It has no
program relation or update workflow. Coach ownership will therefore be
verified against the student's registration and its program's `coachId`.

## Approach

1. Add focused API tests for admin authorization/create/list, coach role and
   source checks, coach ownership (including a cross-program 403), and invalid
   score rejection.
2. Add coach evaluation API at `/api/coach/evaluations` with GET limited to
   the signed-in coach and POST guarded by Zod and registration/program
   ownership.
3. Add admin evaluation API at `/api/admin/evaluations`, protected by
   `authorizeAdmin`, with GET and validated POST.
4. Extend the existing coach dashboard GSSP with an explicitly selected
   evaluation history and the enrolled students for coach-owned programs.
   Render a Persian list/form using labelled, bounded score fields and
   accessible save feedback; preserve the rest of the dashboard.
5. Extend student dashboard GSSP with evaluations selected by authenticated
   student id, serialize dates, and render Persian read-only evaluation cards.
   Do not add a student mutation route or client write control.
6. Add focused coach UI and student GSSP/UI tests, then run project tests,
   typecheck, lint, and attempt browser/e2e verification.
7. Record requirement-to-diff convergence and actual validation in
   `converge.md`; stop at Phase 8 without committing.

## Validation boundaries

- API tests prove scores 1 and 10 accepted, out-of-range values rejected,
  unauthorized coaches rejected, cross-program coaches receive 403, and admin
  access is restricted.
- Coach UI test proves the evaluation list/form and accessible bounded fields.
- Student GSSP/UI tests prove evaluations are scoped to the logged-in user,
  serialized, displayed read-only, and never expose password data.
- Browser/e2e attempt is limited to the evaluation flows; report unavailable
  setup or runtime blockers rather than expanding scope.
