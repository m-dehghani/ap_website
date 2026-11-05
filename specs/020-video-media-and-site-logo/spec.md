# Phase 20 — Product/news video media and site logo

**Status:** Clarified for implementation, with Aparat API upload explicitly
out of scope.

## Clarification decisions

- The owner supersedes Phase 12's PostgreSQL-byte decision: use Vercel Blob on
  Vercel and a configured durable `UPLOADS_DIR` on other hosts. Do not write to
  ephemeral production filesystems or reintroduce PostgreSQL byte storage.
  Update the Phase 12 handoff and deployment guidance to record this decision.
- Enforce a 4 MiB maximum upload on Vercel-hosted deployments and a 100 MiB
  maximum on other hosts. The server selects the cap from its deployment
  environment and checks both the declared and streamed size.
- Administrators do not upload videos to Aparat from this application. They
  paste a URL for a video already hosted on Aparat. Validate the provider URL
  and generate the supported embed URL; never accept arbitrary iframe markup.
- Use Aparat's standard embedded player and default controls. Do not autoplay;
  the owner accepts that muted startup cannot be guaranteed for Aparat embeds.
  Uploaded local videos still start muted.
- Uploaded video files use opaque generated identifiers and server-side
  extension, MIME, and file-signature checks. Support MP4 and WebM.
- Keep Phase 12's 5 MiB image limit on non-Vercel hosts and enforce a 4 MiB
  image limit on Vercel to remain below its request-body limit.
- Keep existing content available during storage and field migrations. Do not
  remove a replaced media object unless it is no longer referenced.

## Objective

Let authorized editors attach durable videos to shop products and news articles
and manage the website logo. Visitors can play uploaded or Aparat-hosted videos
with usable controls. Existing text-only content and legacy media remain valid.

## User stories

- As an authorized editor, I can upload, replace, and remove a product or news
  video through its create/edit form.
- As an editor, I can associate an already-published Aparat video by pasting
  its supported video URL.
- As a visitor, I can play, pause, mute/unmute, and enter full screen for an
  uploaded video; it begins muted and never autoplays.
- As an administrator, I can upload, preview, replace, and remove the site
  logo, which is used consistently in shared site chrome.

## Functional requirements

- **FR-20.1 — Validated uploads:** Accept only supported MP4/WebM files. Enforce
  the host-specific maximum (4 MiB on Vercel, 100 MiB elsewhere) using both
  `Content-Length` and streamed byte counts. Validate the extension, declared
  MIME type, and file signature; reject empty, mismatched, oversized, or
  unsupported files before persisting them. Generate opaque identifiers on
  the server and never use client filenames as storage paths. Preserve the
  Phase 12 5 MiB image cap on non-Vercel hosts and apply the 4 MiB cap to
  images on Vercel.
- **FR-20.2 — Durable storage and serving:** Store new media in Vercel Blob on
  Vercel and in an explicitly configured durable `UPLOADS_DIR` on other
  production hosts. Expose stable `/uploads/<opaque-id>` URLs and serve
  validated objects with safe content headers, `nosniff`, and byte-range
  support required by native video playback. Never fall back to ephemeral
  production disk when the durable backend is unavailable. Preserve existing
  image/media references while documenting the storage decision.
- **FR-20.3 — Content references and authorization:** Add distinct optional
  references for uploaded-video assets and Aparat URLs on products and news.
  Keep the legacy news `videoUrl` data readable during migration. Protect all
  mutations with existing admin/shop-manager authorization and Zod validation;
  only admins may manage news and branding, while existing product-editor
  roles may manage product video.
- **FR-20.4 — Aparat links:** Accept only supported HTTPS URLs on the verified
  Aparat host/path allowlist. Convert a URL to the provider's supported embed
  form; do not inject arbitrary iframe HTML or pass untrusted query parameters
  through. Do not autoplay; use the standard Aparat player controls and allow
  full screen. The owner accepts that the provider's muted-start behavior is
  not guaranteed.
- **FR-20.5 — Playback:** Render uploaded files with accessible native video
  controls, muted initial state, and no autoplay. Render Aparat videos through
  the validated embed only, using its default controls and no autoplay. Keep
  the existing detail-page text and image behavior when no video is configured.
- **FR-20.6 — Branding:** Add an admin-only branding/settings section to
  upload, preview, replace, and remove the logo using the durable asset flow.
  Persist a stable asset reference, use it across shared site chrome, and show
  a safe existing brand fallback when no logo is configured.
- **FR-20.7 — Lifecycle:** A failed upload or content save must not remove
  currently published media. Replaced/deleted assets are removed only when
  no product, article, or branding setting references them.
- **FR-20.8 — Deterministic verification:** Mock upload/storage boundaries in
  unit/API tests. Test both host-specific size limits, signature validation,
  authorization, range responses, asset retention/cleanup, URL validation,
  no-autoplay/muted playback attributes, and logo replacement. No test may
  require Aparat credentials or live provider calls.

## Project structure

- Durable media and URL validation helpers live in `src/lib/`.
- Upload and media-serving handlers live under `src/pages/api/`.
- Product/news editor and public-detail changes stay in existing
  `src/pages/admin/` and `src/pages/` routes.
- Branding settings use `src/pages/admin/settings/` and
  `src/pages/api/admin/settings/`.
- Focused tests live beside the existing upload, admin-content, shop, and
  public news/product tests; browser coverage lives in `e2e/`.
- Operational storage guidance belongs in `docs/application.md` and
  `production.md`.

## Testing strategy

- Vitest unit tests cover content signatures, host-specific limits, URL
  allowlisting, embed construction, and storage lifecycle helpers.
- API tests cover editor authorization, mutation validation, range serving,
  persistence, and cleanup.
- UI tests cover new/edit media states, preview/removal, and playback
  attributes.
- Playwright verifies representative editor and public playback journeys at
  desktop and mobile sizes when the local server is available.
- Run focused tests plus `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run build`, and `git diff --check`; report blocked checks accurately.

## Boundaries

- **Always:** Keep the user experience Persian; preserve existing media and
  content; use database-backed authorization and Zod; keep uploaded media
  durable; validate Aparat URLs before embedding.
- **Ask first:** Changing the owner-approved Vercel Blob/durable-directory
  decision, increasing the approved per-host upload caps, or adding a new
  media provider.
- **Never:** Store production media on ephemeral disk; trust client filenames;
  accept arbitrary iframe HTML; autoplay; log file contents or credentials; or
  delete still-referenced media.

## Success criteria

- Authorized editors can manage uploaded videos and Aparat URLs on product and
  news create/edit forms, and manage the logo from admin settings.
- Vercel uploads reject files above 4 MiB; non-Vercel uploads reject files
  above 100 MiB. Signature, MIME, and extension mismatches are rejected.
- Uploaded media is served from stable `/uploads/` URLs after process restart
  and deployment restart, with safe headers and byte-range support. Vercel
  reads/writes use Blob; other production hosts require durable `UPLOADS_DIR`.
- Aparat URLs are restricted to verified HTTPS hosts and embed safely without
  autoplay; uploaded videos start muted, and Aparat embeds use the provider's
  standard controls without claiming muted startup.
- Existing media survives failed saves and is deleted only when unreferenced.
- Focused API/UI/browser checks pass where available, and repository-wide
  quality gates and storage operations are recorded in `converge.md`.

## Open questions

- Verify Blob persistence on Vercel and durable-directory persistence on other
  hosts after a real restart/redeploy; if deployment access is unavailable,
  record the check as unavailable.
