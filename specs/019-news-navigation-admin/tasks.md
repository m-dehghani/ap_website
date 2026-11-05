# Phase 19 atomic tasks

Each task has a verifiable output. Keep implementation scoped to this phase.

## A. Specification gate

- [x] Review `spec.md`, `plan.md`, and this checklist against the Phase 19
  roadmap and constitution. Resolve any scope disagreement in these artifacts
  before product-code edits.
- [x] Confirm the installed Next.js 16 Pages Router docs for dynamic routes,
  server-side data, not-found responses, and page metadata have been read.

## B. Tests first — published article data and page

- [x] Add a service-level failing test proving article lookup filters by both
  stable `id` and `isPublished: true`, excludes unpublished/missing records,
  and serializes `publishedAt`.
- [x] Add page data tests proving the published article produces props while
  missing and unpublished IDs produce `notFound` with no content props.
- [x] Add article page UI assertions for title, metadata, existing content,
  and return-to-news navigation.

## C. Tests first — cards and homepage

- [x] Add card tests proving both news-card detail actions use the
  URL-encoded stable ID and an accessible name; protect existing product slug
  destinations.
- [x] Add homepage/card tests proving the product and news sections remain
  rendered and available at mobile widths without hiding or changing the
  existing content.

## D. Tests first — full admin route inventory

- [x] Add a generated route inventory that discovers all current page modules
  under `src/pages/admin`, excludes APIs, and substitutes safe values for
  dynamic segments.
- [x] Add Playwright checks that mock authenticated `ADMIN` identity, visit
  every discovered route, and assert the AdminLayout sidebar and top menu.
- [x] Add an unauthenticated admin-route check for the current login redirect
  and ensure unauthenticated page content does not render.

## E. Minimal implementation

- [x] Move only `ShopSpotlight` and `NewsUpdates` outside the desktop-only
  homepage wrapper; preserve all content, style tokens, desktop ordering, and
  behavior of other sections.
- [x] Update academy news-card detail destinations to `/news/[id]`.
- [x] Add the published-only service read and `/news/[id]` Pages Router route
  with serializable props, not-found behavior, existing-content rendering,
  page metadata, and news return link.
- [x] Keep existing `AdminLayout` markup and authorization unchanged unless a
  regression test demonstrates a phase requirement is currently broken.

## F. Verify and converge

- [x] Run focused Vitest tests for service, page, homepage, and cards; then
  typecheck and lint touched files.
- [x] Run Playwright at 320px and 390px and against the current generated
  admin route inventory; the run passed all 68 authenticated admin routes
  and recorded the two database-schema-blocked public-page failures in
  `converge.md`.
- [x] Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run test:e2e`, and `git diff --check`; record exact results and any
  environment blockers.
- [x] Review the final diff against every acceptance criterion and the
  constitution. Verify prohibited Phase 17, payment, upload, branding, and
  unrelated files were not changed.
- [x] Write `converge.md` with requirement-to-file/test mapping, the route
  inventory/outcomes, command results, runtime limitations, and deviations.
