# Phase 17 tasks — Registration CAPTCHA and contact activation

- [x] Confirm previous phase gates pass and inspect existing registration,
      login, contact verification, and registration-success-proof behavior.
- [x] Add failing tests for CAPTCHA success/failure/expiry/malformed/timeout/
      unavailable responses and zero writes on verification failure.
- [x] Add failing tests for email/phone activation, credential-gated resend,
      incorrect/replayed/expired/wrong-target challenges, attempt/resend caps,
      atomic activation, and legacy-account access.
- [x] Add nullable activation state and a migration that backfills existing
      accounts without falsifying contact verification.
- [x] Implement a timeout-bounded, fail-closed Google reCAPTCHA v2 verifier;
      connect the localized widget and server-side registration check.
- [x] Preserve the Phase 2 serializable registration path; create new public
      accounts inactive and issue/send the first activation challenge.
- [x] Implement password-gated challenge resend and atomic one-time
      verification for either registered contact channel.
- [x] Prevent inactive students from receiving normal login access or using
      protected pages/APIs; preserve staff and legacy account behavior.
- [x] Add Persian activation, error, and recovery UI; document required
      deployment environment variables.
- [x] Restore the Phase 14 signed registration-success proof: issue it only
      after registration creation, store it outside the URL, verify it against
      an existing registration, and keep direct/invalid-proof visits neutral.
- [x] Run focused proof/activation tests, typecheck, changed-file lint, and a
      production build; reuse the previously recorded Prisma validation.
- [ ] Run browser/E2E checks for registration, activation, resend, and recovery;
      the full Vitest suite passes, but browser confirmation remains open.
- [x] Review the Phase 17 convergence evidence and preserve existing changes.
