# Phase 19 — Mobile homepage cards, news details, and admin shell coverage

## Status

Reviewed against the Phase 19 roadmap and constitution. This phase implements the Phase 19 scope in
`plans/plan.md`; it does not change the roadmap or expand into Phase 20.

## Problem

The homepage's existing product and news sections are hidden below the `md`
breakpoint, article cards do not open academy article detail pages, and
authenticated admin pages have not been verified as a complete route set
against the shared `AdminLayout`.

## User stories

- As a mobile visitor, I can see and use the existing homepage product and
  academy news cards at 320px and 390px.
- As a visitor, I can open a published news article at a stable URL based on
  its database ID, read its content, and return to the news listing.
- As a visitor, I cannot access an unpublished or nonexistent article through
  a public detail URL.
- As an administrator, every current admin page retains the shared sidebar
  and top menu after authentication.
- As an unauthenticated visitor, an admin route follows existing auth
  behavior without briefly exposing a broken or partial admin page.

## Functional requirements

- **FR-19.1 — Mobile homepage cards:** Render the existing `ShopSpotlight`
  product cards and `NewsUpdates` cards on mobile without changing their
  desktop behavior or existing Persian content. Use existing data sources and
  links; do not fabricate products, articles, prices, or claims.
- **FR-19.2 — Article navigation and detail:** Each academy news-card
  “ادامه مطلب”/“بیشتر” action links to `/news/[id]`, where `[id]` is the
  existing `NewsArticle.id`. The detail page shows only a published article,
  includes its title, existing content, a path back to `/news`, and metadata
  derived from its title and excerpt. Missing and unpublished IDs return
  Next.js's not-found response and disclose no article content. Product cards
  continue to point to their existing `/shop/[slug]` routes.
- **FR-19.3 — Complete admin route inventory:** Inventory every page module
  below `src/pages/admin/`, excluding API routes. For every current page route,
  an authenticated `ADMIN` sees both the `AdminLayout` sidebar and top menu.
  `/admin/shop` also retains its existing `SHOP_MANAGER`-specific shell and
  access behavior. An unauthenticated visitor sees the existing login
  redirect/loading behavior, never page content without its layout.
- **FR-19.4 — Responsive and accessible behavior:** Product and news cards
  remain visible, keyboard-operable, descriptively named, and free of
  horizontal page overflow at 320px and 390px. Preserve native link semantics
  and the current RTL design tokens.

## Acceptance criteria

1. At 320px and 390px, the homepage displays the existing product and news
   sections when their data sources return cards; neither section is hidden by
   the mobile navigation summary.
2. The homepage retains the current desktop section order, content, and card
   behavior.
3. Every academy news-card detail action points to the exact stable article
   ID route. A published ID renders article content, title metadata, and a
   return-to-news link. Missing and unpublished IDs return `notFound` and
   contain no article props.
4. Product card links retain the product's existing slug destination.
5. The generated admin inventory accounts for all current page modules
   (currently 68 page route patterns, including `/admin`). Authenticated
   layout checks cover every route and find the appropriate sidebar and top
   menu. Dynamic route parameters use test-only values. API files are not
   treated as pages.
6. Tests cover the server-side published-only lookup, missing/unpublished
   not-found behavior, card destinations and accessible link names, responsive
   visibility/overflow, and the complete authenticated admin route inventory.
7. Phase validation results and any unavailable browser/runtime checks are
   recorded in `converge.md`.

## Boundaries

- Preserve the current Persian UX, layout identity, card semantics, typography,
  colors, and spacing tokens. This is a responsive correction, not a redesign.
- Do not add product or academy claims, sample content, or new API behavior
  unrelated to public article retrieval.
- Do not change Phase 17 registration/activation, payment routes or gateway
  configuration, media upload/storage, branding/logo, Prisma schema, or
  unrelated page content.
- Phase 20 remains responsible for product/news video uploads, Aparat, and
  branding. Its future routes must continue to use the Phase 19 admin-shell
  invariant.

## Dependencies and decisions

- Follows Phase 11 mobile homepage behavior and Phase 14 public navigation and
  accessibility rules as specified by `plans/plan.md`.
- Uses the Pages Router conventions installed with Next.js 16.4.2:
  `src/pages/news/[id].tsx`, server-side lookup, `notFound`, and page-level
  metadata.
- Uses the existing `NewsArticle.id`, `isPublished`, `publishedAt`,
  `title`, `excerpt`, and `content` fields; no migration is needed.
- The route inventory is derived from page files at test time so future admin
  pages are automatically included rather than silently omitted.
