# Phase 19 implementation plan

## Approach

Keep the current Pages Router, view models, and design system. Reveal the
already implemented product/news sections on narrow screens while leaving the
rest of the full homepage detail flow desktop-only. Change academy article
card actions to the stable internal article ID URL, then add a server-rendered
detail route whose database query includes `isPublished: true`. Verify every
admin page route with a generated Playwright inventory against the existing
shared shell; make no layout redesign or route authorization changes.

## Files and responsibilities

### Homepage and news

- `src/pages/index.tsx`
  - Keep `ShopSpotlight` and `NewsUpdates` outside the desktop-only wrapper.
  - Keep existing `Features`, coach, milestones, testimonial, and CTA behavior
    desktop-only, in the same order relative to the restored sections.
  - Continue using current homepage props and the existing featured-product
    API.
- `src/components/NewsUpdates.tsx`
  - Point each academy `NewsArticleViewModel` detail action to
    `/news/${encodeURIComponent(article.id)}`.
  - Preserve current content, styles, and card interaction semantics.
- `src/services/content/index.ts`
  - Add a published-article-by-ID read using `id` and `isPublished: true`;
    return the existing safe `NewsArticleViewModel` shape and ISO date string.
  - Avoid returning unrelated fields or changing list-query behavior.
- `src/pages/news/[id].tsx`
  - Use `getServerSideProps` to load only a published article and return
    `{ notFound: true }` for both missing and unpublished IDs.
  - Render existing Persian article fields safely, use title/excerpt for
    page-level SEO metadata, and provide a `/news` return link.

### Tests

- `src/__tests__/services/content-detail.test.ts`: assert the lookup constrains both the stable
  ID and `isPublished: true`, maps dates to serializable strings, and returns
  no article for an unpublished/missing record.
- `src/__tests__/pages/news/[id].test.tsx`: exercise the page's server props
  for published, missing, and unpublished IDs and render metadata/content/
  return navigation without exposing unpublished props.
- `src/__tests__/components/NewsUpdates.test.tsx`: assert the detail action
  uses the encoded stable ID and has a meaningful Persian accessible name.
- `src/__tests__/components/shop/ShopSpotlight.test.tsx` or a focused homepage
  test: mock featured product API data and assert product slug links are
  retained.
- `e2e/homepage-news-admin-layout.spec.ts`
  - At 320px and 390px, assert the existing homepage shop/news sections and
    card links are usable with no horizontal overflow.
  - Generate all route patterns by walking `src/pages/admin`, exclude API
    modules, map dynamic segments to test IDs, mock the existing
    `/api/auth/me` response as `ADMIN`, and assert both the admin sidebar and
    top menu on each authenticated route. Assert the existing login redirect
    on an unauthenticated admin route.
  - Do not assume an authenticated admin page was verified by checking only
    `/admin`; report every visited route in test output.

## Data and rendering

- Article detail is read on each server request so an unpublished article
  cannot be served from a stale shared page cache.
- Use a narrow Prisma `select` for fields required by the existing article
  view model. Keep `content` as escaped React text unless the existing data
  contract explicitly defines another safe renderer; do not add
  `dangerouslySetInnerHTML`.
- Dates crossing the Pages Router props boundary must be ISO strings.
- Metadata uses only the existing article title and excerpt; no invented
  description or academy assertions.

## Verification

1. Run focused service, page, homepage, and card tests (Red-Green-Refactor).
2. Run the new Playwright file against a running application; test widths 320
   and 390 and the full generated admin route list.
3. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and
   `npm run test:e2e` as the phase release gate.
4. Run `git diff --check`, confirm no Phase 17, payment, upload, branding, or
   unrelated files changed, then record route and command evidence in
   `converge.md`. If the browser server or database is unavailable, retain the
   test and record the precise blocker rather than claiming visual success.
