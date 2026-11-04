# Phase 2 implementation plan — Registration integrity

## Decisions

- Keep the public registration API and existing Persian response messages.
- Require 12 or more characters for public registration and student password
  changes, matching the seed's existing minimum.
- Move public identity checks, program eligibility/capacity reads, and account
  plus registration creation into one serializable transaction.
- Return 409 for capacity-full results, matching student enrollment. Translate
  Prisma serialization conflicts (`P2034`) to a retryable 409 and unique
  constraint errors (`P2002`) to the existing duplicate-account 409.
- Keep account/registration response payloads unchanged and select only the
  user fields needed for that response.

## Files and changes

- `src/pages/api/register.ts`
  - Validate the 12-character password minimum.
  - Check duplicate user/coach identifiers in the transaction.
  - Read program eligibility and count active registrations inside the same
    serializable transaction that creates the user and registration.
  - Return typed outcomes for missing/inactive/full/ineligible programs and
    map `P2002`/`P2034` to conflict responses.
- `src/pages/register.tsx`
  - Align client validation and password placeholder with the 12-character
    server policy.
- `src/pages/api/student/profile/verification.ts`
  - Align password-change validation with the same 12-character policy.
- `src/__tests__/pages/api/register.test.ts`
  - Cover minimum password validation, coach/user duplicates, in-transaction
    capacity counting, serializable configuration, and concurrent requests
    against capacity 1.
- `src/__tests__/pages/api/student/profile-verification.test.ts`
  - Cover the shared password-change minimum.
- `specs/002-register-integrity/converge.md`
  - Record requirement coverage, validation results, and any deviations.

## Verification

1. Run targeted registration and profile-verification tests.
2. Verify two simultaneous registration requests with capacity 1 yield one
   201 and one 409, and only one account/registration is created.
3. Run `npm test`, `npm run typecheck`, and `npm run lint`.
4. Browser-check the registration form's password guidance/validation when a
   local server is available; document any environment limitation.
5. Review the diff against the spec and record convergence evidence.

No schema migration or UI redesign is in scope.
