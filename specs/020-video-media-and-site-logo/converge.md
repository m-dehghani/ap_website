# Phase 20 convergence

## Status

The product and news playback paths, upload lifecycle, Aparat URL handling,
and branding work are implemented. The shared `VideoPlayer` is now rendered
on the Phase 19 news detail page, with a regression test covering both media
references. Automated unit/API and quality gates passed. Browser verification,
deployment migration, and restart/redeploy persistence remain unavailable.

## Requirement mapping

| Requirement | Implementation evidence | Status |
|---|---|---|
| Approved storage/provider decisions | `src/lib/media.ts`, `src/lib/uploads.ts`, Aparat allowlist in `src/lib/aparat.ts`; Phase 12 supersession note and deployment docs updated. | Implemented; live restart/persistence checks unavailable. |
| Product/news video and branding references | Additive migration `prisma/migrations/20261105030000_video_media_and_site_branding/migration.sql`; legacy news `videoUrl` and image columns are retained. | Implemented; migration was not applied to a deployment database. |
| Validated uploads and stable serving | `src/pages/api/uploads/video.ts`, `src/pages/api/uploads/[id].ts`, `src/lib/media.ts`, `/uploads/:id` rewrite in `next.config.ts`. Enforces host caps, signatures, UUID paths, safe headers, and byte ranges. | Implemented and locally tested. |
| Product/news authoring and lifecycle | Shop and news create/edit forms plus admin APIs persist uploaded/Aparat references and delete replaced objects only when unreferenced. | Implemented and API-tested. |
| Public playback | `src/pages/shop/[slug].tsx` and `src/pages/news/[id].tsx` use the shared `VideoPlayer`; uploaded video is muted with native controls and no autoplay, and Aparat embeds are constructed from validated URLs. | Implemented; focused component and page tests pass. |
| Site logo | Admin-only branding API/UI, shared Header/Footer logo rendering, preview/replace/remove, and AP fallback. | Implemented and API-tested. |
| Storage/deployment documentation | `docs/application.md`, `production.md`, and the Phase 12 convergence supersession note describe Blob/durable-directory requirements, public Blob access, caps, stable paths, and legacy compatibility. | Implemented. |

## Verification

- `npm test -- --run src/__tests__/components/VideoPlayer.test.tsx src/__tests__/pages/api/admin/news-video.test.ts src/__tests__/lib/shop.test.ts src/__tests__/pages/api/uploads/video.test.ts src/__tests__/pages/api/admin/settings/branding.test.ts` — 5 files, 25 tests passed.
- Before Phase 21's additional API contract tests, `npm test:coverage` passed
  87 files / 420 tests. The news page/player integration focused run passed
  2 files / 7 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed with 0 errors and 373 repository warnings.
- `npm run build` — passed; Next.js generated the branding, video-upload, media-serving, shop, and news routes.
- `git diff --check` — passed.

## Unavailable checks and operational notes

- Vercel Blob and durable `UPLOADS_DIR` persistence across a real restart/redeploy, production database migration, and production restore were not testable without deployment access.
- The dedicated payment-gateway admin Playwright check passed. The
  homepage/news smoke test failed because the configured database schema lacks
  `news_articles.uploaded_video_url`, and the news 404 check consequently
  returned 500 instead of 404. The media migration was not applied to the
  configured database; no video-specific browser journey was run.
- Vercel Blob media objects are created with public access. They are public site assets, not private files; deployment access and backup procedures must match that behavior.
- The Phase 19 news detail page was updated only to render the approved media
  fields required by this phase; its publication filtering and existing
  article behavior remain covered by page tests. Production DB migration and
  storage persistence after restart/redeploy remain rollout checks.
