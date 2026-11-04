# Phase 10 — Docs, crawler, Stripe, and rate-limit hygiene

**Status:** Draft; requirements need clarification and review before planning or
implementation.

## User stories

- As a maintainer, I can rely on product documentation matching the current
  Persian-only application and its payment/auth behavior.
- As a visitor, crawler API failures do not expose internal errors or fail
  unnecessarily when crawler configuration is absent.
- As an operator, login and registration are throttled against abuse.

## Functional requirements

- Correct documentation to describe Persian-only routing, Zarinpal, dual
  identity, refunds, attendance, and evaluations.
- Give `/api/crawler-news` a timeout, remove random likes, and avoid returning
  internal error messages.
- Return an empty-news 200 when `CRAWLER_API_URL` is not configured.
- Remove `stripe` and `micro` dependencies only if repository search confirms
  they are unused.
- Rate-limit `/api/auth/login` and `/api/register`; an in-memory per-instance
  limiter is acceptable if its multi-instance limitation is documented.

## Success criteria

- `PRODUCT.md` and `docs/application.md` no longer promise `/en` routing and
  reflect current product decisions.
- Crawler behavior meets the timeout, error handling, and missing-config
  requirements.
- Login throttling is covered by tests; registration throttling is implemented
  and verified.
- Potentially removable dependencies are confirmed unused before removal.

## Scope and verification from the parent plan

Follow Phase 10 in [`plans/plan.md`](../../plans/plan.md). Run the program's
test, typecheck, and lint gates.
