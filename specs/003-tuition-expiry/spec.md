# Phase 3 — Tuition payment expiry

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a student, I can retry tuition checkout if a pending checkout is abandoned
  for more than 15 minutes.
- As the academy, I do not apply money from a late successful callback to an
  expired, cancelled, or overpaid registration.

## Functional requirements

- Expire pending tuition checkout after 15 minutes, using the shop window or a
  shared checkout TTL.
- Prefer a persisted `Payment.expiresAt` timestamp and migration if confirmed
   during clarification.
- Allow a new checkout after expiry.
- Mark a verified successful callback arriving after expiry as
  `REFUND_REQUIRED`; do not apply it to an ineligible registration.

## Success criteria

- A pending payment older than the TTL no longer blocks a new checkout.
- A late successful verification is queued for staff refund and does not
  overpay or revive a cancelled registration.

## Scope and verification from the parent plan

Follow Phase 3 in [`plans/plan.md`](../../plans/plan.md). Test expiry and late
success behavior and run the program's test, typecheck, and lint gates.
