# Phase 6 — Contact inbox tasks

- [x] Add failing API tests for invalid contact payloads, valid public
  submission persistence, honeypot non-persistence, and absence of submitted
  body content in server logs.
- [x] Implement `POST /api/contact` with Zod validation, honeypot short-circuit,
  safe error handling, and `ContactMessage` creation.
- [x] Add failing admin API tests proving unauthenticated/non-admin requests
  cannot list or change messages, supported status values are enforced, and
  status updates only affect valid `ContactMessage` records and stale updates
  are rejected.
- [x] Implement admin-authorized `GET`/`PATCH /api/admin/messages` with
  field-selective listing and conditional status updates for `NEW`, `READ`,
  and `ANSWERED`.
- [x] Add failing contact-page tests for labelled fields, visible validation
  feedback and live success/error announcements, API submission, and
  mailto-only-on-failure behavior.
- [x] Wire the Persian contact form to `/api/contact`, add the honeypot field,
  and keep mailto as a failure fallback without logging message content.
- [x] Add failing admin inbox UI tests for listing, status controls, and
  accessible loading/error feedback; implement `/admin/messages` and expose it
  in admin navigation. Added mocked browser scenarios for visitor submission
  and admin status updates.
- [x] Run focused tests and the complete test, typecheck, and lint gates; attempt
  browser/e2e verification and document exact results plus requirement-to-change
  convergence in `converge.md`.
