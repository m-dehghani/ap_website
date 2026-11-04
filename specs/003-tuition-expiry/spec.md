# Phase 3 — Tuition payment expiry

**Status:** Clarified for implementation.

## Decisions

- Use a persisted nullable `Payment.expiresAt`, set to 15 minutes after each
  tuition checkout is created. The column remains nullable for non-checkout and
  non-Zarinpal payments.
- Backfill existing pending Zarinpal payments from `createdAt + 15 minutes`.
- Treat expiry as a strict deadline: a payment is expired when
  `expiresAt <= now`.
- Expired pending payments become `FAILED` when a student retries, allowing a
  new checkout. A later gateway-verified success becomes `REFUND_REQUIRED` and
  never credits its registration.
- Reuse one `CHECKOUT_TTL_MS` constant for tuition and shop checkouts.

## User stories

- As a student, I can retry tuition checkout if a pending checkout is abandoned
  for more than 15 minutes.
- As the academy, I do not apply money from a late successful callback to an
  expired, cancelled, or overpaid registration.

## Functional requirements

- Expire pending tuition checkout after 15 minutes, using the shop window or a
  shared checkout TTL.
- Persist checkout expiry on each tuition payment and backfill existing
  pending Zarinpal payments.
- Allow a new checkout after expiry.
- Mark a verified successful callback arriving after expiry as
  `REFUND_REQUIRED`; do not apply it to an ineligible registration.
- Preserve the existing rial amounts and Persian API responses.

## Success criteria

- A pending payment older than the TTL no longer blocks a new checkout.
- A late successful verification is queued for staff refund and does not
  overpay or revive a cancelled registration.

## Scope and verification from the parent plan

Follow Phase 3 in [`plans/plan.md`](../../plans/plan.md). Test expiry and late
success behavior and run the program's test, typecheck, and lint gates.
