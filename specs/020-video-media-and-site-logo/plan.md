# Phase 20 implementation plan — Product/news video media and site logo

## Approach

Use Vercel Blob on Vercel and a configured durable `UPLOADS_DIR` on other
production hosts, as explicitly approved by the owner to supersede Phase 12's
PostgreSQL-byte decision. Reconcile that decision in the Phase 12 handoff and
deployment documentation, then extend the existing storage lifecycle while
preserving legacy image URLs. Use separate database references for uploaded
assets and Aparat watch URLs. Aparat uploads are not part of this phase; URLs
are validated and converted to the provider embed format.

## Files and changes

- `prisma/schema.prisma` and a migration:
  - Add optional uploaded-video and Aparat URL references for products/news.
  - Add a stable branding setting for the site logo asset.
  - Preserve existing news `videoUrl` values and current image references.
- `src/lib/uploads.ts` and related helpers:
  - Extend the existing Vercel Blob/durable-directory lifecycle while keeping
    reads for already-referenced assets.
  - Enforce the Phase 12 5 MiB image cap off Vercel and 4 MiB image cap on
    Vercel; enforce the video-specific 4 MiB/100 MiB caps by deployment host.
  - Fail closed if a production host has no configured durable storage.
  - Add signature checks, media URL validation, safe cleanup, and stable
    `/uploads/` references.
- `src/pages/api/uploads/` and new API routes:
  - Add authorized upload and byte-range media serving.
  - Add admin-only branding read/update/remove operations and Zod validation.
  - Reuse the database-backed role helpers; never accept client-chosen roles.
- `src/pages/admin/content/news-articles/new.tsx`,
  `src/pages/admin/content/news-articles/[id].tsx`,
  `src/pages/admin/shop/index.tsx`, and the corresponding public detail pages:
  - Add separate uploaded-video and Aparat URL controls to create/edit flows.
  - Render validated video sources with accessible controls and no autoplay.
- `src/pages/admin/settings/branding.tsx`, its API, and shared chrome:
  - Add logo upload, preview, replacement, removal, and a safe fallback.
  - Apply the configured logo consistently without changing unrelated layout.
- `docs/application.md` and `production.md`:
  - Document Vercel Blob and durable-directory persistence, host-specific size
    limits, `/uploads/` behavior, and migration/recovery procedures.
- Focused upload, persistence, content API, UI, and E2E tests:
  - Verify size boundaries for both host types, asset lifecycle, Aparat URL
    restrictions, playback attributes, and logo authorization/replacement.

## Invariants

- No client filename is used as an object key or path.
- Vercel Functions receive at most 4 MiB per media upload; raw request
  streaming does not override the platform request-body limit.
- Other deployment targets accept at most 100 MiB per upload, subject to the
  configured request and database limits.
- Media references are updated only after successful storage; failed writes
  preserve the currently referenced media.
- A media asset is deleted only after checking every product, article, and
  branding reference.
- Legacy image URLs remain readable during the transition; do not claim that
  a live database migration or deployment restart was tested unless it was.

## Verification sequence

1. Review the Phase 12 storage discrepancy and record the superseding owner
   decision. Write tests for durable persistence, migration compatibility,
   host-specific caps, and range reads.
2. Implement and validate the Vercel Blob/durable-directory media boundary.
3. Add product/news references and safe local/Aparat playback; test create,
   edit, failure, replacement, and retention.
4. Add branding settings and shared-logo rendering; test authorized mutations
   and safe fallback behavior.
5. Update storage and deployment documentation to match the verified code.
6. Run targeted tests, full Vitest, typecheck, lint, production build, and
   relevant browser checks. Record any environment-blocked deployment or
   browser checks in `converge.md`.

## Risks

- Media bytes require storage capacity and backup/retention planning; document
  the applicable Blob and durable-directory operational procedures.
- A 100 MiB non-Vercel request may exceed an operator's reverse-proxy/body
  limits; reject based on the configured host cap and report transport errors
  explicitly.
- Aparat's provider API and embed semantics must be checked against official
  documentation. Do not invent support for player controls or URL paths.
- Existing production media may live on disk or Vercel Blob despite the
  approved Phase 12 design. Preserve existing references and record any
  migration that cannot be executed or verified in this environment.
