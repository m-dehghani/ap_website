# Phase 10 convergence

## Requirement mapping

| Requirement | Implementation and evidence |
|---|---|
| Persian-only product/routing and accurate product behavior | `docs/application.md` and `PRODUCT.md` now describe unprefixed Persian routes, Zarinpal tuition/shop checkout and distinct money units, `users`/`coaches` identity tables, staff-managed `REFUND_REQUIRED` queue, attendance, and evaluations. No English locale support is promised. |
| Crawler timeout and safe failures | `src/pages/api/crawler-news.ts` applies `AbortSignal.timeout(5_000)` to article and stats requests and returns only the generic Persian error on failure. `src/__tests__/pages/api/crawler-news.test.ts` checks timeout use and that internal exception details are absent from JSON. |
| Empty crawler response when unconfigured | The crawler route returns HTTP 200 with an empty news list, zero total, null stats, and source list without making an upstream request. Covered by the crawler API test. |
| No fabricated crawler engagement | The crawler transformation no longer generates likes/comments. Those counts are optional in `src/types/viewModels/content.ts` and hidden when absent in `src/components/EnhancedNewsUpdates.tsx`. Covered by the crawler API test. |
| Remove only unused dependencies | A source search found no `stripe` or `micro` imports under `src/`. `npm uninstall --ignore-scripts stripe micro` removed them from `package.json` and `package-lock.json`; neither package remains as a lockfile entry. |
| Throttle login and registration | `src/lib/api-rate-limit.ts` applies a bounded in-memory fixed window of five POSTs per socket address per endpoint per 15 minutes. Routes return HTTP 429 with a Persian message and `Retry-After`, before validation/database work. Login and registration API tests cover the sixth-request rejection and unaffected requests (401 login/201 registration). |
| Multi-instance limitation | `docs/application.md` records that counters are per-process, instances do not share state, and a proxy must expose the actual client socket address. |

## Verification

- Focused API suite: **passed**, 3 files / 26 tests.
- Full `npm test`: **passed**, 40 files / 219 tests.
- `npm run typecheck`: **passed** (`next typegen` and `tsc --noEmit`).
- `npm run lint`: **passed**, exit code 0; ESLint reported non-failing warnings in unrelated existing files.
- `npm run build`: **passed**; Next.js compiled and generated all 79 static pages.
- Runtime/browser check: attempted `next start --hostname 127.0.0.1 --port 3000`; the server could not bind because the environment returned `listen EACCES`. HTTP probes therefore could not connect. This is an environment limitation, not a passing runtime check.
- Dependency search: **confirmed unused** in `src/`; package and lockfile entries removed.

## Deviations and boundaries

- Rate limiting is process-local as permitted by the phase spec; it is not a distributed limiter.
- No Phase 9 files were changed. No changes were committed.
