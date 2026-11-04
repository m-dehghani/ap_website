# Phase 12 — User profile and CMS image uploads

## Context and decision

The application is a Next.js 16 Pages Router application using Prisma with
PostgreSQL. `docs/application.md` documents PostgreSQL as the production
database, and `production.md` documents deployment against the Prisma-hosted
PostgreSQL service. The repository has no configured object-storage provider,
bucket integration, or storage credentials; its dependencies and configuration
also show no such integration. Do not assume one exists.

**Durable storage decision:** store uploaded image bytes in the existing
PostgreSQL database, using a dedicated `ImageAsset` table (`bytea`/Prisma
`Bytes`) and generated opaque identifiers. This reuses the already provisioned
durable service and survives application restarts/deployments; it does not
depend on ephemeral application filesystems or unconfigured cloud credentials.
It increases database size and backup/restore time, so operators must include
asset bytes in normal PostgreSQL backup/retention and capacity planning. A
future object-storage migration requires its own confirmed provider and
operational configuration.

## User stories

- As any authenticated student/user or coach, I can upload and replace only
  my own profile picture.
- As an authorized admin content editor, I can upload and use images on
  supported CMS content, including success stories, testimonials, coach
  profiles, and news articles.
- As an authorized shop editor (admin or shop manager), I can upload and use
  product images without entering arbitrary remote URLs.
- Visitors can continue to view uploaded content through stable application
  URLs after an application restart.

## Functional requirements

- **FR-1 Profile ownership:** authenticated `users` identities (students,
  admins, and shop managers) and `coaches` identities may update only their
  own profile image. Resolve the current role/identity with the existing
  database-backed auth helper on each request. Do not accept an account ID or
  role from the client to select the profile.
- **FR-2 CMS authorization and scope:** admins may manage images for success
  stories, testimonials, coach profiles, and news articles. Admins and shop
  managers may manage product images. User-submitted shop-review media is not
  CMS content and is outside this phase.
- **FR-3 Upload constraints:** accept exactly one JPEG, PNG, or WebP image per
  upload request, with a maximum size of 5 MiB (5,242,880 bytes). Reject empty,
  oversized, unsupported, or MIME/signature-mismatched files server-side.
  SVG and arbitrary remote image URLs are not accepted as uploads.
- **FR-4 Safe persistence and serving:** generate opaque storage identifiers
  on the server; never use client filenames as filesystem paths or storage
  keys. Persist bytes and verified media type in PostgreSQL. Serve assets only
  from the application’s image endpoint with an appropriate content type,
  `X-Content-Type-Options: nosniff`, and immutable caching for immutable IDs.
- **FR-5 Reference updates and cleanup:** persist an asset reference in the
  existing profile/CMS image fields. On replacement or CMS record removal,
  remove the old asset only when it is no longer referenced elsewhere. Failed
  updates must not delete the currently referenced image.
- **FR-6 UI and errors:** use Persian labels, instructions, loading/success
  states, and actionable validation/authorization errors. Provide a file
  picker and preview where suitable; do not make a remote URL field the
  upload substitute.
- **FR-7 Data compatibility:** preserve existing content and image references;
  add only schema/migration changes needed for user profile image and durable
  image bytes. Keep the existing coach image field.

## Acceptance criteria

1. A student/user and a coach can each upload and replace their own picture;
   one identity cannot choose or change another identity's profile.
2. Requests without a valid session, and CMS requests without the required
   editor role, are rejected.
3. JPEG, PNG, and WebP files up to and including 5 MiB are persisted; empty,
   oversized, unsupported, or mismatched content is rejected before use.
4. An uploaded asset can be fetched from the app after the application process
   restarts, provided PostgreSQL remains available.
5. Replacing a profile/CMS image updates its reference and removes an
   unreferenced replaced asset, while an asset still referenced elsewhere is
   retained.
6. Authorized editors can upload and use media in success-story, testimonial,
   coach, news-article, and shop-product flows; those forms do not offer
   arbitrary remote image URLs as an upload alternative.
7. Targeted tests cover authorization, MIME/size rejection, persistence,
   reference replacement, and cleanup. UI flows are browser-checked when the
   local server can start.

## Out of scope

- Phase 13 success-page purpose/content changes.
- Review attachment upload workflows and migration of legacy remote media.
- Object-storage provider setup, image transformations, quotas, CDN work, or
  background cleanup of assets abandoned before a CMS record references them.
- Changing any CMS content, testimonial text, product price, or claim.
