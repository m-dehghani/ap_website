# Phase 17 implementation plan — Registration CAPTCHA and contact activation

## Approach

Keep the existing Pages Router, form validation, session helper, Prisma
transaction, `VerificationChallenge` model, and email/SMS adapters. Implement
activation as a credential-gated public flow instead of issuing an ordinary
session to an inactive student. Use one-time conditional database writes for
challenge attempts and consumption, and keep CAPTCHA and notification
providers mocked at their external boundaries in tests.

## Files and changes

- `prisma/schema.prisma` and a migration:
  - Add nullable `User.activatedAt`.
  - Backfill existing accounts to `createdAt` without changing verified
    contact timestamps.
- `src/pages/api/register.ts`:
  - Require and server-verify the reCAPTCHA response before starting the
    serializable registration transaction.
  - Preserve duplicate and capacity checks, create new students inactive, and
    create/send an account-bound activation challenge after the transaction.
  - Return the existing registration data plus explicit pending-activation
    and challenge navigation data; do not return a code or secret.
- `src/lib/recaptcha.ts`:
  - Provide a narrow, timeout-bounded server verification boundary with
    fail-closed configuration and typed outcomes.
- `src/pages/register.tsx` and `src/pages/registration-success.tsx`:
  - Render the Persian checkbox widget, submit its token, and provide clear
    activation guidance and a resend route.
- `src/pages/api/auth/login.ts` and `src/pages/api/auth/activate.ts`:
  - Prevent normal session issuance for inactive public accounts.
  - Provide Zod-validated, password-gated challenge requests and challenge
    verification; bind both to the current registered destination and update
    activation/contact timestamps atomically.
- `src/lib/auth.ts` and student page/API guards:
  - Preserve the shared `{ id, role, source }` session contract.
  - Prevent an unactivated student session from protected access, including
    student dashboard GSSP and all routes using student authorization.
- `.env.example` and `docs/application.md`:
  - Document reCAPTCHA keys and the activation delivery settings, without
    values or secrets.
- Add focused CAPTCHA, activation, registration, login, and protected-route
  regressions beside existing tests.
- `specs/017-registration-activation/tasks.md` and `converge.md`:
  - Track verifiable tasks and final evidence.

## Invariants and edge behavior

- CAPTCHA verification occurs before any capacity/account/registration write.
- Preserve Phase 2 transaction isolation and duplicate/capacity semantics.
- Keep initial notification failure recoverable: the registration remains
  pending activation, and password-gated resend remains usable.
- Keep old accounts active through migration backfill; do not fabricate
  `emailVerifiedAt` or `phoneVerifiedAt`.
- Count sends over the rolling day and do not delete the history needed for
  rate-limit enforcement. Keep only the most recent active challenge usable.
- Challenge verification updates `activatedAt` only if null, sets only the
  selected verified-contact timestamp, and consumes the challenge in one
  transaction. Replays and concurrent second use fail as conflicts.
- No request body or provider response secrets are logged.

## Verification

1. Add focused tests and check failures before implementation where practical.
2. Verify mocked CAPTCHA accepted/rejected/expired/malformed/timeout/
   unavailable outcomes and account non-creation on every failed outcome.
3. Verify both contact channels, activation/access boundaries, resends, limits,
   races, and Phase 2 registration integrity.
4. Run focused suites, then `npm test`, `npm run typecheck`, and
   `npm run lint`. Generate and validate the Prisma client/migration.
5. Browser-check registration and activation at desktop/mobile widths if the
   local server can start; record environment blocks without calling them
   passes.
6. Review against the spec, write `converge.md`, and commit this phase alone.
