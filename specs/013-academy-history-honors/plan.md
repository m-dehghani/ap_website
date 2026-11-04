# Phase 13 implementation plan

## Data decisions

- Store editable history in existing `AboutContent(section = "history")`.
  Represent paragraphs using its existing JSON field; add `history` to the
  existing About content admin selector and use the current general editor.
- Use `Milestone` for academy honors, add `isVerified Boolean @default(false)`,
  and filter the public service to verified rows only. Preserve existing rows
  and player success story data; remove unsupported milestone seed assertions
  so a future seed does not recreate unverified claims.
- Reuse published `GENERAL` testimonials and the existing testimonial card
  presentation. Do not add demo reviews or achievement claims.

## Product and verification files

- `prisma/schema.prisma` and
  `prisma/migrations/<timestamp>_verify_academy_honors/migration.sql`.
- `prisma/seed.ts`.
- `src/services/content/index.ts`.
- `src/pages/about.tsx`, `src/pages/success.tsx`,
  `src/pages/testimonials.tsx`, and `src/pages/index.tsx` (the homepage also
  renders the shared success component).
- `src/components/SuccessStories.tsx`, `src/components/Testimonials.tsx`,
  `src/components/Header.tsx`/`Footer.tsx` only if navigation constants do not
  fully cover both surfaces, and `src/constants/app.ts`.
- `src/pages/admin/content/about-content/new.tsx`,
  `src/pages/admin/content/milestones/new.tsx`,
  `src/pages/admin/content/milestones/[id].tsx`,
  `src/pages/admin/content/milestones/index.tsx`, milestone APIs, and
  `src/lib/validation/` for the shared milestone input schema.
- Targeted unit/API tests and `e2e/academy-history-honors.spec.ts`.
- `specs/013-academy-history-honors/{spec.md,plan.md,tasks.md,converge.md}`.

## Implementation sequence

1. Add failing tests for public honor filtering, admin verification defaults
   and validation, history rendering/edit capability, testimonial separation,
   route metadata/navigation, and no player story content on `/success`.
2. Add the verification migration and validate milestone create/update payloads
   with Zod; make public honor reads select only verified records.
3. Add the history option to the existing About editor and render active
   `history` content or a neutral empty state on `/about`.
4. Replace the shared success presentation with an academy honors view using
   only verified milestones, then update `/success` and homepage data loading.
5. Add `/testimonials` using the existing general testimonial query and
   presentation; remove success-page metadata/presentation coupling.
6. Update main/footer navigation, page metadata, Persian headings and empty
   states. Preserve existing responsive/theme patterns.
7. Run focused tests, the full test suite, typecheck, lint, build, and browser
   checks for the three routes in both themes and practical viewport widths.
   Record actual results and limitations in convergence notes.

## Constraints

- Never promote player achievements into academy honors.
- Do not publish old milestones until individually reviewed and verified by an
  admin; do not delete existing CMS rows.
- Never create or seed sample history, honors, or testimonials.
- Keep any extra file necessary for the new component signature/test coverage
  tightly coupled to FR-1 through FR-6 and list it in convergence notes.
