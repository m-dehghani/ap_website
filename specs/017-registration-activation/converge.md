# Phase 17 convergence — Registration CAPTCHA and contact activation

## Implemented

- Added Google reCAPTCHA v2 server verification with a five-second timeout,
  fail-closed configuration, and pre-database registration verification.
- Added the Persian checkbox widget, public site-key configuration, and
  actionable registration error/recovery states.
- Added nullable `User.activatedAt`; existing rows are backfilled from
  `createdAt` without changing either contact-verification timestamp. Public
  registration explicitly creates inactive students and leaves the existing
  serializable capacity/duplicate checks intact.
- Added account-, channel-, and destination-bound activation challenges with
  ten-minute expiry, five guesses, a 60-second resend interval, five sends per
  rolling 24 hours, per-IP throttling, password-gated resend, and conditional
  one-time activation.
- Blocked session issuance and protected student access until activation;
  retained admin, coach, and grandfathered-account behavior.
- Added Persian activation UI and documented reCAPTCHA and notification
  environment requirements.
- Restored Phase 14 registration-success proof continuity: successful
  registration returns a short-lived purpose-bound signature, the browser
  stores it in session storage rather than the URL, activation returns the
  registrant to `/registration-success`, and that page confirms only after the
  server verifies the proof and finds the associated registration. Direct,
  malformed, expired, tampered, and unresolvable proofs remain neutral.

## Verification evidence

- `npx vitest run src/__tests__/lib/registration-confirmation.test.ts src/__tests__/pages/api/register/confirmation.test.ts src/__tests__/pages/api/register.test.ts src/__tests__/pages/registration-success.test.tsx src/__tests__/pages/activate.test.tsx`: **5 files passed, 37 tests passed**. Covers proof signing/purpose/expiry, no-write registration failures and proof issuance, confirmation endpoint binding to an existing registration, neutral/confirmed page states, and post-activation navigation.
- `npm run typecheck`: passed; `next typegen` and `tsc --noEmit -p tsconfig.json` completed successfully.
- `npx eslint src/lib/registration-confirmation.ts src/pages/api/register/confirmation.ts src/pages/api/register.ts src/pages/register.tsx src/pages/registration-success.tsx src/pages/activate.tsx src/__tests__/lib/registration-confirmation.test.ts src/__tests__/pages/api/register/confirmation.test.ts src/__tests__/pages/api/register.test.ts src/__tests__/pages/registration-success.test.tsx src/__tests__/pages/activate.test.tsx`: passed.
- `npx next build --webpack`: passed on Next.js 16.4.2; production build compiled, prerendered pages, and included `/api/register/confirmation`.
- Previously recorded before proof restoration: 81 focused tests across eight files, whole-repository `npm run lint -- --quiet`, `npx prisma generate`, `npx prisma validate`, and `git diff --check` passed. These were not repeated.
- Final cross-phase validation: `npm test` passed **89 files / 426 tests**;
  `npm run typecheck` passed; `npm run lint` passed with **0 errors and 373
  existing/repository warnings**; `npm run build` passed; and
  `npx prisma validate` passed.
- Registration/activation/resend/recovery browser E2E was not run. Phase 17
  remains open for its specified browser confirmation; component/API coverage
  is present and the full automated suite passes.

## Scope and remaining work

The only new behavior needed to resolve the earlier Phase 14 prerequisite was
proof continuity and its tests; existing Phase 17 changes were preserved.
Full-suite, typecheck, lint, and build gates now pass; browser/E2E validation
remains open. No UI redesign was performed.

No live Google CAPTCHA, SMS, or email credentials were used. The activation
migration was validated but not applied to a database.
