# Phase 2 — Registration integrity

**Status:** Clarified and ready for implementation.

## Clarified decisions

- Require a minimum of 12 characters for public registration and student
  password changes. This follows the parent plan's recommendation and the
  seed's existing minimum; the server and registration form must enforce the
  same rule.
- Return 409 when capacity is full, matching student enrollment. A serializable
  transaction conflict also returns 409 with a retry message.
- Check both user and coach identities before creating a public student
  account. Preserve the existing 409 duplicate response and map user unique
  constraint errors (`P2002`) to that response.

## User stories

- As an applicant, I can register only while the program has capacity, even
  when several people register concurrently.
- As an applicant, duplicate email or phone conflicts, including conflicts
  with coaches, are reported consistently.
- As an applicant, I must choose a password meeting the documented policy.

## Functional requirements

- Enforce `program.maxStudents` inside a serializable transaction in public
  registration, recounting capacity within that transaction. Capacity-full
  responses use HTTP 409.
- Handle unique-constraint errors (`P2002`) as a conflict response.
- Apply a minimum of 12 characters consistently to public registration and
  student password changes.
- Keep registration capacity behavior consistent with student enrollment.

## Success criteria

- With capacity 1 and two concurrent public registrations, exactly one
  succeeds; the other receives HTTP 409 for capacity or a serializable
  conflict.
- Duplicate email/phone collisions, including coach collisions, return 409.
- Registration and password-change validation reject passwords shorter than
  12 characters and accept passwords of at least 12 characters.

## Scope and verification from the parent plan

Follow Phase 2 in [`plans/plan.md`](../../plans/plan.md). Test concurrency and
run the program's test, typecheck, and lint gates.
