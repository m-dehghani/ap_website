# Phase 12 atomic tasks

> The PostgreSQL storage task below records the original plan. Its storage
> direction was superseded by the owner-approved Phase 20 decision documented
> in [`spec.md`](./spec.md#subsequent-storage-decision).

- [x] **T1 — Add regression tests:** test unauthenticated and cross-account
  profile requests, coach/user ownership, CMS/editor role boundaries, empty,
  oversized, unsupported and signature-mismatched files, persistence and
  replacement cleanup.
- [x] **T2 — Add durable storage:** implement the PostgreSQL image asset
  migration, generated IDs, strict image validation, upload/read endpoints,
  and safe unreferenced-asset cleanup; make T1 pass.
- [x] **T3 — Add self-service profiles:** add the user profile reference and
  user/coach APIs using the existing session helper; wire Persian upload and
  preview UI into student and coach profile surfaces.
- [x] **T4 — Add CMS uploads:** connect authorized image upload controls to
  success-story, testimonial, coach, news-article, and shop-product forms;
  preserve unchanged legacy media and clean up replaced/unreferenced assets.
- [x] **T5 — Verify and converge:** run targeted tests followed by the full
  test/typecheck/lint/build commands; browser-check profile and CMS upload
  flows when possible; compare every FR to the diff and write actual results
  in `converge.md`.
