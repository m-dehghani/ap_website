# Phase 13 — Academy history, honors, and separate testimonials

## Context and decisions

The existing `AboutContent` model stores flexible named sections and the About
admin surface already edits them, so an editable `history` section needs no new
content table. The `Milestone` model has the fields needed for academy-wide
honors, but its existing seed entries make unverified academy and player
achievement claims. Add a verification flag, default it to false, and expose
only verified milestone entries publicly. Remove the unsupported milestone
seed claims; existing records remain stored but hidden until an editor reviews
and verifies them.

The existing `Testimonial` records and `Testimonials` presentation are reused
for `/testimonials`. Player `SuccessStory` records and their CMS are preserved,
but no longer appear on `/success`. No new testimonials, academy history, or
honors will be fabricated.

## User stories

- As a visitor, I can read the academy history maintained by an authorized
  editor on `/about`.
- As a visitor, I can browse verified academy-wide honors on `/success`
  without seeing individual player stories or reviews mixed into that page.
- As a visitor, I can read reviews and experiences on `/testimonials`.
- As an admin, I can edit the history section and verify only suitable,
  evidence-backed academy honors before publishing them.

## Functional requirements

- **FR-1 — Editable academy history:** `/about` renders active `AboutContent`
  section `history`, including its title and paragraphs. The About CMS editor
  can create and edit this section. Missing history produces a clear empty
  state, not an invented founding date or academy claim.
- **FR-2 — Verified academy honors:** `/success` presents academy-wide honors
  and achievements from the existing milestone CMS. Only entries explicitly
  marked verified are public. Existing unverified records are preserved but
  hidden. Admins can set the verification flag while creating or editing an
  entry. Player `SuccessStory` records are not relabeled or displayed as
  academy honors.
- **FR-3 — Separate testimonials:** `/testimonials` presents the existing
  published general testimonials and experiences. `/success` no longer
  includes testimonials. Existing testimony content is reused without
  alteration.
- **FR-4 — Correct discovery and metadata:** Main and footer navigation use
  page-purpose-specific Persian labels and link to `/success` and
  `/testimonials`. Page title, description, canonical URL, and page headings
  match each route's content.
- **FR-5 — Responsive and truthful UI:** all three pages remain usable at
  narrow, medium, and desktop sizes and in both existing themes. Empty states
  and page copy make no unsupported factual, pricing, testimonial, or outcome
  claims.
- **FR-6 — Compatibility and validation:** preserve existing player-story
  records and CMS. Honor edits use validated, authorized admin API mutations;
  verification defaults to false. No unrelated schema or content changes.

## Acceptance criteria

1. `/about` displays the active CMS-managed history and its empty state when
   no history exists; an admin can create/edit section `history`.
2. The public honors query excludes every unverified milestone. Creating a
   milestone defaults it to unverified; an authorized admin can explicitly
   verify it. Existing player stories are not part of the honors data or UI.
3. `/testimonials` displays published general testimonials; its metadata and
   navigation identify it as reviews/experiences.
4. `/success` has no player story, testimonial, or unsupported statistics
   presentation and uses academy honors/achievements wording.
5. Targeted tests, full tests, typecheck, lint, and production build pass.
   Browser checks at mobile/tablet/desktop sizes and both themes are run where
   local server startup permits; exact results and limitations are recorded.

## Scope and constraints

The direct product scope is `src/pages/about.tsx`, `src/pages/success.tsx`,
`src/components/SuccessStories.tsx`, `src/components/Testimonials.tsx`,
`src/components/Layout.tsx`, the About and milestone admin surfaces/API,
`prisma/schema.prisma`, and the corresponding seed/migration. Homepage calls
to the shared success component must be updated to prevent player stories from
remaining exposed there. Add only targeted tests and an end-to-end regression
spec for the three public routes.

Preserve Persian-only UX and the existing design system. Do not invent
academy history, honors, or testimonials. No Phase 12 changes or unrelated
content edits.
