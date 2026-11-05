# Phase 19 Convergence

## Result

Implemented Phase 19 without redesigning the existing Persian UI, changing
AdminLayout, or changing unrelated behavior. The news page now also renders
the media added by Phase 20. Changes are included in the requested combined
Phases 17–21 commit.

## Requirements and evidence

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| FR-19.1 — mobile product/news cards | `src/pages/index.tsx` keeps the existing `ShopSpotlight` and `NewsUpdates` sections visible outside the desktop-only wrapper. | `e2e/homepage-news-admin-layout.spec.ts` checks existing content, product slug, news links, and overflow at 320px/390px. |
| FR-19.2 — stable published article detail | `src/components/NewsUpdates.tsx`, `src/services/content/index.ts`, `src/pages/news/[id].tsx`. Lookup filters by ID and `isPublished: true`; missing/unpublished records return `notFound`; page uses existing title/excerpt/content and `/news` link. | `src/__tests__/components/NewsUpdates.test.tsx`, `src/__tests__/services/content-detail.test.ts`, `src/__tests__/pages/news/[id].test.tsx`, and the Playwright missing-article 404 check. |
| FR-19.3 — complete admin shell inventory | `e2e/homepage-news-admin-layout.spec.ts` generates routes from all `.tsx` page modules under `src/pages/admin`, excludes API paths, and substitutes safe dynamic values. `/admin` server-session behavior is separately tested in `src/__tests__/pages/admin/index.test.tsx`. | Current Chromium sweep passed all 68 authenticated admin routes, the unauthorized redirect, and shop-manager boundary check. |
| FR-19.4 — responsive/accessibility | Existing card semantics and tokens retained; news actions are native links with descriptive names. | Component tests plus the mobile Playwright assertions above. |

### Current admin route inventory

The current checkout has 69 generated page patterns: `/admin` plus 68
client-authenticated routes. The generated inventory includes the Phase 18
`/admin/payment-gateways` and Phase 20 `/admin/settings/branding` pages; neither
is excluded. `/admin` is covered separately by SSR/auth and shared-shell
Vitest tests. Dynamic values include `phase19-test-id`, `about`, and `history`;
API modules are excluded.

## Validation

- Focused service, article page, news-card, and `/admin` Vitest tests passed.
- Final `npm test`: passed, 89 files / 426 tests across Phases 17–21.
- `npm run lint`: exit 0, 373 warnings.
- `npm run typecheck`: passed after `npm run prebuild` regenerated the Prisma
  client from the current schema. The earlier typecheck failed because that
  generated client was stale for the separately present Phase 18 payment
  gateway model; no payment route or schema source was changed for this phase.
- `npm run build`: passed; output included the dynamic `/news/[id]` route.
- Current Chromium inventory: `npx playwright test
  e2e/homepage-news-admin-layout.spec.ts --project=chromium` discovered 72
  tests; 70 passed and 2 failed. All 68 authenticated admin routes, the
  unauthenticated redirect, and the shop-manager boundary passed. The mobile
  homepage assertion and missing-news 404 assertion received HTTP 500 because
  the configured database lacks the Phase 20 `news_articles.uploaded_video_url`
  migration column. This was confirmed in the Next.js server log. The
  migration was not applied to the configured database.
- The dedicated payment-gateway admin Playwright test passed (1 test).
- Firefox and WebKit checks were unavailable because their browser
  executables were not installed.
- `git diff --check`: passed after the convergence documentation edit; Git
  emitted only line-ending conversion warnings for other existing worktree
  files.

## Scope and limitations

No phase scope change. The two current browser failures require a migrated
database to verify; do not treat them as passes or apply a migration to a
shared/live database without deployment approval. The temporary server was
stopped after the run.
