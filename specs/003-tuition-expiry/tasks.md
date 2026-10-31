# Phase 3 implementation tasks

- [x] Clarify expiry semantics, legacy-payment handling, and the shared
      15-minute TTL before planning.
- [x] Add persisted tuition payment expiry and a migration that backfills
      existing pending Zarinpal payments.
- [x] Expire pending tuition checkouts before blocking retries and set expiry
      on each newly created checkout payment.
- [x] Mark verified late tuition payments `REFUND_REQUIRED` without crediting
      their registrations.
- [x] Reuse the shared checkout TTL for shop orders.
- [x] Add tests for checkout retry after expiry and callback success after
      expiry; preserve timely payment behavior.
- [x] Run targeted tests, full tests, typecheck, and lint.
- [x] Review the final diff against the Phase 3 requirements and write
      `converge.md`.
