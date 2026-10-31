# Phase 10 implementation plan

## Goal

Bring the application documentation in line with implemented Persian-only
behavior and payment/auth flows; make crawler failures bounded and non-leaky;
remove confirmed-unused dependencies; and throttle public login and registration
requests with explicit HTTP 429 responses.

## Files and approach

- `docs/application.md`, `PRODUCT.md`: replace unsupported `/en`/i18n claims,
  remove stale Stripe references, and document Persian-only routes, Zarinpal
  money conventions, dual user/coach identity, staff-managed refund queue,
  attendance, and evaluations.
- `src/pages/api/crawler-news.ts`: return a stable empty response when no
  `CRAWLER_API_URL` is configured; bound crawler fetches with abort timeouts;
  return only a generic Persian error on failure; remove generated likes and
  comments rather than presenting fabricated engagement metrics.
- `src/types/viewModels/content.ts` and
  `src/components/EnhancedNewsUpdates.tsx`: permit absent engagement counts and
  omit those labels for crawler articles that do not provide real counts.
- `src/lib/api-rate-limit.ts`: add a small fixed-window, per-process limiter
  keyed by the direct socket address, with bounded in-memory state and explicit
  `Retry-After`/429 responses.
- `src/pages/api/auth/login.ts`, `src/pages/api/register.ts`: apply the limiter
  to POST requests before validation or database work.
- `src/__tests__/pages/api/crawler-news.test.ts`, existing login and
  registration API tests: cover missing crawler configuration, timeout
  propagation, non-leaking failures, no synthetic metrics, throttling, and an
  unaffected request below the threshold.
- `package.json`, `package-lock.json`: remove `stripe` and `micro` only after
  confirming source imports are absent, using npm.
- `specs/010-docs-crawler-hygiene/tasks.md`: atomic verification checklist.
- `specs/010-docs-crawler-hygiene/converge.md`: requirement-to-file mapping and
  actual verification outcomes.

## Decisions and constraints

- Rate limit: five POST requests per client socket address per 15-minute
  window, independently for login and registration. The in-memory map is
  per-process; deployments behind a proxy must expose the actual client socket
  address to the app, and multiple instances do not share counters.
- A rate-limited response has HTTP 429, a Persian message, and `Retry-After`;
  it does not resemble a successful login or registration.
- Crawler timeout is five seconds per upstream request. Upstream errors never
  include exception details in the public JSON response.
- Do not add English UI, gateway refunds, or changes outside Phase 10.
- No browser verification is planned because this phase adds no page UI; the
  news component adjustment only hides unavailable crawler engagement counts.
