# Phase 21 convergence — Test completeness and suite-value audit

## Result

The audit mapped Phases 17–20's critical behaviors to unit, API, component,
and Chromium coverage. It found two concrete unit/API gaps and added tests for
the Zarinpal request/verification contract and product video-reference API
lifecycle. No tests were removed. All 426 Vitest tests pass. Public homepage
and news browser checks remain blocked by the configured database's unapplied
Phase 20 migration; deployment-only persistence checks were not attempted.

## Requirements-to-tests matrix

| Requirement area | Evidence | Result / limitation |
|---|---|---|
| Auth, role re-read, and coach/student separation | `src/__tests__/lib/auth.test.ts`, `src/__tests__/pages/api/auth/login.test.ts`, `src/__tests__/pages/coach/dashboard.test.tsx`, `src/__tests__/pages/student/dashboard.test.ts` | Tests cover forged roles, activation gating, expired tokens, current DB roles, access outcomes, and public coach props. |
| Registration, CAPTCHA, activation, and proof | `src/__tests__/lib/recaptcha.test.ts`, `src/__tests__/lib/registration-confirmation.test.ts`, `src/__tests__/pages/api/register.test.ts`, `src/__tests__/pages/api/register/confirmation.test.ts`, `src/__tests__/pages/api/auth/activate.test.ts`, `src/__tests__/pages/activate.test.tsx`, `src/__tests__/pages/registration-success.test.tsx` | Mocked CAPTCHA/provider failures, pre-write rejection, capacity races, resend limits, challenge binding/consumption, proof purpose/expiry, and confirmation/navigation are covered. Dedicated browser journeys for registration and activation were not run. |
| Tuition/shop checkout, provider contracts, callbacks, and refunds | `src/__tests__/pages/api/student/payments.test.ts`, `src/__tests__/pages/api/student/payment-callback.test.ts`, `src/__tests__/pages/api/shop/orders/callback.test.ts`, `src/__tests__/pages/api/admin/payment-gateways.test.ts`, `src/__tests__/lib/zarinpal-adapter.test.ts`, `src/__tests__/lib/zibal.test.ts`, `src/__tests__/pages/api/admin/refunds.test.ts`, `src/__tests__/lib/shop.test.ts` | Zarinpal and Zibal request/verify contracts and mocked lifecycle transitions are covered; callbacks test persisted-provider dispatch, exact amount checks, idempotency, expiry, reservation release, and refund queue outcomes. Pasargad is disabled/deferred by approved scope. |
| Upload authorization, storage, ranges, and cleanup | `src/__tests__/pages/api/uploads.test.ts`, `src/__tests__/pages/api/uploads/[id].test.ts`, `src/__tests__/pages/api/uploads/video.test.ts`, `src/__tests__/lib/uploads.test.ts`, `src/__tests__/lib/video-media.test.ts` | Role gates, signatures, size boundaries, stable opaque paths, Blob/disk behavior, byte ranges, fail-closed storage, and reference-aware cleanup are covered. |
| Product/news video and Aparat references | `src/__tests__/pages/api/admin/shop/products.test.ts`, `src/__tests__/pages/api/admin/news-video.test.ts`, `src/__tests__/lib/shop.test.ts`, `src/__tests__/components/VideoPlayer.test.tsx`, `src/__tests__/pages/news/[id].test.tsx` | Product and news mutations validate references; player tests assert uploaded mute/controls/no-autoplay, canonical Aparat embeds, untrusted-host rejection, and news-page rendering. |
| Branding and public navigation | `src/__tests__/pages/api/admin/settings/branding.test.ts`, `src/__tests__/pages/admin/payment-gateways.test.tsx`, `src/__tests__/components/Header.test.tsx`, `src/__tests__/components/Footer.test.tsx`, `src/__tests__/components/NewsUpdates.test.tsx`, `src/__tests__/services/content-detail.test.ts`, `src/__tests__/pages/news/[id].test.tsx` | Authorization, replacement/removal fallback, published-only detail lookup, card destinations, and shared chrome are covered. |
| Responsive homepage and admin route shell | `e2e/homepage-news-admin-layout.spec.ts`, `e2e/payment-gateways-admin.spec.ts` | Chromium passed all 68 authenticated admin routes, the unauthorized redirect, the shop-manager boundary, and the gateway settings journey. The homepage/news checks are blocked as detailed below. |

## Assertion and external-boundary audit

- The source test tree contains 89 test files and 426 executed cases; the
  repository has 9 Playwright spec files. At audit start the source tree had
  87 files and 420 cases.
- A TypeScript-AST scan found 384 declared `it`/`test` callback templates and
  no callback template without an explicit `expect()`. Parameterized tests
  expand those templates into the larger Vitest case count. Critical assertions
  were also reviewed by requirement area in the matrix above.
- No tests were removed.
- Provider HTTP and CAPTCHA calls are mocked at their boundaries in unit/API
  tests; Prisma is mocked in API tests; media tests use temporary directories
  and mocked Blob operations. Aparat parsing/embed construction is tested as a
  pure boundary. No live provider credentials or sandbox calls were used.
- `vitest.config.ts` uses V8 coverage reporters and defines no minimum
  threshold. Coverage is reported as a diagnostic, not treated as a behavioral
  completeness score.

## Validation

- `npm test`: **89 files passed, 426 tests passed**.
- `npm run test:coverage`: **89 files passed, 426 tests passed**; aggregate
  coverage: **65.29% statements, 60.54% branches, 62.84% functions, 67.02%
  lines**.
- `npm run typecheck`: passed.
- `npm run lint`: passed with 0 errors and 373 warnings.
- `npm run build`: passed on Next.js 16.4.2; output includes the media, logo,
  payment gateway, activation, and article routes.
- `npx prisma validate`: passed.
- `git diff --check`: passed after implementation and convergence edits.
- `e2e/homepage-news-admin-layout.spec.ts --project=chromium`: **70 passed,
  2 failed of 72**. All authenticated admin routes passed. The mobile homepage
  and missing-news 404 checks received HTTP 500 because the configured
  database lacks `news_articles.uploaded_video_url`; the server log confirmed
  Prisma P2022. The Phase 20 migration was not applied to the configured
  database.
- `e2e/payment-gateways-admin.spec.ts --project=chromium`: **1 passed**.
  Firefox/WebKit and the complete multi-project Playwright suite were not run.

## Remaining gaps

- Run the public homepage/news browser checks after applying the approved
  migration in a disposable or deployment-approved database. Do not apply a
  schema migration to a shared/live database without explicit approval.
- Run browser journeys for registration/activation and video playback; current
  evidence is from component/API tests and the admin browser checks.
- Verify Vercel Blob and durable `UPLOADS_DIR` persistence across a real
  restart/redeploy, and apply/verify the production migrations through the
  deployment procedure. Those checks require deployment access.
