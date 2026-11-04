# Phase 7 — Attendance

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a coach, I can record attendance for students in sessions belonging to my
  program.
- As an admin, I can manage attendance.
- As a student, I can see my attendance history.

## Functional requirements

- Support PRESENT, ABSENT, LATE, and EXCUSED attendance.
- Provide admin and coach attendance APIs; scope coaches to their own program
  sessions.
- Reject attendance for users not registered in the session's program.
- Provide an attendance roster UI for coaches/admins and a history section on
  the student dashboard.
- Preserve the schema's unique `(userId, sessionId)` attendance constraint.

## Success criteria

- A coach can save attendance for an authorized roster and the student can see
  their own history.
- An unauthorized coach receives 403.
- Tests cover roster membership and coach authorization; browser verification
  covers the relevant UI.

## Scope and verification from the parent plan

Follow Phase 7 in [`plans/plan.md`](../../plans/plan.md). Run the program's
test, typecheck, and lint gates and browser-verify the UI.
