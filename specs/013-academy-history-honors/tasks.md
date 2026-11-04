# Phase 13 tasks

- [x] **T1 — Add regression coverage:** Cover editable history display and
  empty state, verified-only honors, admin verification defaults and updates,
  testimonial separation, navigation/metadata, and responsive page content.
- [x] **T2 — Gate honors publication:** Add `Milestone.isVerified` with a
  false default and migration; validate create/update input with Zod and query
  only verified milestones for public display.
- [x] **T3 — Add academy history CMS section:** Make `history` available in the
  About editor and render its CMS paragraphs on `/about` without invented
  fallback claims.
- [x] **T4 — Separate public page purposes:** Make `/success` and the shared
  success component show only verified academy honors; create `/testimonials`
  from published general testimonials; prevent homepage reuse from exposing
  individual player stories.
- [x] **T5 — Align navigation and metadata:** Update Persian labels, page
  headings, descriptions, canonical URLs, and neutral empty states.
- [x] **T6 — Verify and converge:** Run focused and full tests, typecheck,
  lint, build, and browser checks where possible; map every FR to changes and
  record exact outcomes and limitations in `converge.md`.
