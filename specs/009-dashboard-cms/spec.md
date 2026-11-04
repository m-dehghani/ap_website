# Phase 9 — Dashboard split and CMS duplication

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a student, I retain the existing dashboard behavior while its sections
  become easier to maintain.
- As a CMS administrator, invalid content mutations are rejected consistently.
- As a site visitor, homepage content is served with an appropriate cache
  strategy.

## Functional requirements

- Split the student dashboard into profile, enrollments, payments, attendance,
  and evaluations sections without changing behavior.
- Validate mutating CMS APIs with Zod; use one resource as a template and
  convert only a few more in this phase.
- Leave a checklist for remaining CMS resources in this phase's tasks.
- Add appropriate homepage ISR or cache headers and confirm the behavior for
  the actual deployment environment.

## Success criteria

- Student dashboard code is split into section components with unchanged
  behavior.
- At least one CMS resource (for example testimonials) uses Zod validation.
- The homepage cache behavior is documented and confirmed.
- Visual checks cover `/` and `/student/dashboard`.

## Scope and verification from the parent plan

Follow Phase 9 in [`plans/plan.md`](../../plans/plan.md). Do not rewrite every
CMS resource in one phase. Run the program's test, typecheck, and lint gates
and browser-verify the specified pages.
