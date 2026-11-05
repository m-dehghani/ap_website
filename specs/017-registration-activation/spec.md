# Phase 17 — Registration CAPTCHA and contact activation

**Status:** Clarified for implementation.

## Clarification decisions

- Use Google's reCAPTCHA v2 checkbox, localized for Persian. Require a
  server-side verification token before running registration writes. The public
  site key and private secret are deployment environment variables; never
  check credentials into source control. Missing configuration or an
  unavailable verifier fails closed.
- A new public student account remains inactive until either its registered
  email or registered mobile number is verified. Existing accounts are
  grandfathered as active without marking their contact details verified.
- Represent account activation explicitly with nullable `User.activatedAt`.
  The migration backfills existing users from `createdAt`; public
  registration sets it to null; successful activation sets it once. Contact
  verification timestamps continue to mean only that the corresponding
  contact was verified.
- Reuse `VerificationChallenge`, `sendEmail`, `sendSms`, and existing contact
  normalization. Activation challenges are account-, channel-, and
  destination-bound; expire after 10 minutes, allow at most five guesses, a
  minimum 60-second resend interval, and five sends per account in a rolling
  24-hour window. Reuse the Phase 10 per-IP limiter as an additional boundary.
- A registered user may request a new challenge only after proving the
  account password. Verification requires the opaque challenge ID and its
  code. A challenge is consumed once and cannot verify a changed or different
  account destination.
- Login does not issue a session to a new inactive account. It returns a
  localized activation-required response; public challenge verification and
  credential-gated resend remain available. Once activated, the normal login
  and shared session behavior is unchanged.
- Initial notification delivery failure does not roll back an already-created
  account or registration. Return an explicit pending-activation result with a
  safe resend path; never report account activation or login success.
- Keep Phase 2's 12-character password policy, serializable capacity checks,
  uniqueness behavior, and Phase 14's registration-success proof intact.

## User stories

- As an applicant, I can register only after the server verifies a valid
  Google reCAPTCHA response.
- As a newly registered student, I can activate my account by verifying
  either the registered email or the registered mobile number.
- As an existing student, I keep account access after deployment without the
  site falsely claiming my contact has been verified.
- As an administrator, I can trust that newly registered students cannot
  access protected student features before activation.

## Functional requirements

- **FR-17.1 CAPTCHA:** Render a Persian reCAPTCHA v2 checkbox, submit its
  response token, and verify it server-side before account creation. Missing,
  invalid, expired, malformed, or unavailable verification must create no
  account and return an actionable Persian response. Secrets remain
  server-only.
- **FR-17.2 Activation:** Send a short-lived challenge to a registered
  destination and bind its persisted challenge to user, channel, and exact
  destination. Enforce expiry, attempt and resend caps, and atomic one-time
  consumption. Either verified channel activates the account.
- **FR-17.3 Authorization:** Newly registered unactivated accounts cannot
  obtain a normal login session or access protected student pages/APIs.
  Existing accounts and non-student administrative/coach flows remain
  unaffected. Unactivated users retain a safe challenge verification and
  password-gated resend route.
- **FR-17.4 Compatibility:** Reuse `emailVerifiedAt` and `phoneVerifiedAt` to
  record the contact actually verified. Add only the activation state needed
  to grandfather existing accounts without misrepresenting contact
  verification.
- **FR-17.5 Abuse and privacy:** Reuse endpoint/IP throttling, enforce
  persistent account-bound resend and guess limits, return Persian recovery
  guidance, and do not log codes, tokens, CAPTCHA secrets, passwords, or
  contact-message content.
- **FR-17.6 Deterministic tests:** Mock Google's verification boundary and
  delivery providers. Cover CAPTCHA success, failure, expiry/malformed input,
  timeout/unavailability, no-write failure, contact activation, wrong
  destination/account/channel, replay, expiry, attempt/resend caps, and
  protected-access enforcement.

## Success criteria

- No registration write occurs unless a valid server-side CAPTCHA check
  succeeds.
- Email or phone verification activates an account once, updates only the
  verified channel, and rejects expired, replayed, wrong-account, wrong-target,
  and over-limit challenges.
- Existing accounts stay active without falsified verified-contact fields;
  new inactive students cannot access protected features before activation.
- Registration capacity, duplicate-contact handling, registration success
  proof, and 12-character password validation remain intact.
- Persian registration, login, and activation flows expose recovery after
  notification failure.
- Focused API/UI tests, test suite, typecheck, lint, and available browser
  checks pass; environment-blocked checks are documented accurately.

## Scope boundary

Follow Phase 17 in [`plans/plan.md`](../../plans/plan.md). Do not alter
payment gateways, registration pricing, student enrollment invariants, or
unrelated notification flows.
