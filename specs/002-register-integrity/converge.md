# Phase 2 convergence — Registration integrity

## Requirements checklist

- [x] Public registration checks duplicate user and coach email/phone
      identifiers inside a serializable Prisma transaction.
- [x] Program existence, active status, age eligibility, and capacity are
      checked in the same transaction that creates the user and registration.
- [x] Capacity counts the same `PENDING` and `APPROVED` registrations as
      student enrollment. A full program returns 409.
- [x] User unique-constraint errors (`P2002`) and serializable transaction
      conflicts (`P2034`) return documented 409 responses.
- [x] Public registration and student password changes share the same
      12-character minimum across server validation and relevant UI guidance.
- [x] Registration selects only response fields for the created user and does
      not return a password hash.

## Validation evidence

- Targeted registration and profile-verification tests passed.
- Full test suite: passed, 22 files / 114 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with existing warnings; targeted lint on changed files
  reported no errors (one existing React Hook Form `watch()` warning remains).
- `git diff --check`: passed.
- Browser verification was attempted but unavailable: Next.js could not bind
  to either `0.0.0.0:3000` or `127.0.0.1:3001` (`EACCES`). The UI changes are
  limited to validation and Persian password guidance.

The concurrent capacity test sends two requests through the handler against a
capacity-one program and asserts one 201 and one 409, with only one user and
registration creation. Its mocked transaction serializes callbacks and
verifies Prisma is requested at `Serializable` isolation; it does not exercise
a live database engine.

## Scope and deviations

Implementation stayed within the registration, password-change, related tests,
and Phase 2 specification artifacts. No schema migration or unrelated UI
changes were made. Browser verification could not run because the host denied
local port binding.
