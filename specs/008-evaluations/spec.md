# Phase 8 — Evaluations

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a coach, I can record an evaluation for a student in my program; an admin
  can also create one.
- As a student, I can read my evaluations but cannot create or change them.

## Functional requirements

- Provide coach and admin evaluation APIs.
- Restrict coaches to students in their program.
- Validate evaluation scores from 1 through 10 and support notes.
- Display coach evaluation entry/list UI and student read-only evaluation
  cards.

## Success criteria

- One evaluation round-trips from coach entry through the database to the
  student's read-only view.
- Scores outside 1–10 and unauthorized writes are rejected.
- Tests cover score validation and access control; browser verification covers
  the relevant UI.

## Scope and verification from the parent plan

Follow Phase 8 in [`plans/plan.md`](../../plans/plan.md). Run the program's
test, typecheck, and lint gates and browser-verify the UI.
