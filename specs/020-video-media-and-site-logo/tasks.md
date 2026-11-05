# Phase 20 tasks — Product/news video media and site logo

- [x] **T1 — Reconcile storage and provider decisions:** record the owner-
      approved Vercel Blob/durable-directory decision as superseding Phase 12;
      verify Aparat watch/embed behavior; inventory existing image references.
      Record unavailable deployment checks rather than assuming them.
- [x] **T2 — Add content references:** add video and Aparat URL references to
      products/news plus a stable branding setting; preserve legacy news
      `videoUrl` data and existing image references in a forward-only
      migration.
- [x] **T3 — Add upload validation and serving:** implement the Vercel 4 MiB
      and non-Vercel 100 MiB video limits, content-signature checks, opaque
      IDs, durable Blob/directory writes, safe headers, and byte-range
      responses. Fail closed if production storage is not durable/configured.
- [x] **T4 — Add content lifecycle:** connect uploaded-video and Aparat URL
      fields to product/news create/edit APIs and forms; preserve existing
      content and remove replaced assets only when unreferenced.
- [x] **T5 — Add public playback:** render uploaded and verified Aparat media
      with no autoplay, muted uploaded-video startup, controls, fullscreen, and
      mobile-safe sizing.
- [x] **T6 — Add logo management:** implement admin-only branding API/UI,
      preview, replacement, removal, shared chrome rendering, and fallback.
- [x] **T7 — Reconcile operations documentation:** update Phase 12's storage
      handoff and application/deployment instructions for the superseding Blob
      and durable-directory decision, `/uploads/`, caps, backups, and legacy
      storage compatibility.
- [x] **T8 — Validate and converge:** run targeted upload/content/playback
      tests, `npm test`, typecheck, lint, build, and relevant browser tests;
      review requirements against the diff and write exact evidence in
      `converge.md`.
