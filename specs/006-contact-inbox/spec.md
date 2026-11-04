# Phase 6 — Contact inbox

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a visitor, I can submit a contact message through the website.
- As an admin, I can review messages and mark them read or answered.

## Functional requirements

- Persist valid public submissions as `ContactMessage` records through
  `/api/contact`.
- Validate mutations with Zod and use at least a honeypot or equivalent
  short-circuit if rate limiting is not available.
- Provide admin-only message list/detail and status management for NEW, READ,
  and ANSWERED.
- Retain `mailto:` only as an optional fallback if API submission fails.
- Do not log submitted message bodies.

## Success criteria

- Submitting a valid contact form creates a `ContactMessage`.
- An admin can view and mark the message read.
- Unauthenticated users can submit but cannot read the inbox.
- Tests cover validation and admin authorization; browser verification covers
  the form and inbox.

## Scope and verification from the parent plan

Follow Phase 6 in [`plans/plan.md`](../../plans/plan.md). Run the program's
test, typecheck, and lint gates and browser-verify the UI.
