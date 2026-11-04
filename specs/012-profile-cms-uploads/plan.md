# Phase 12 implementation plan

> **Superseded storage direction:** The original PostgreSQL-byte approach
> below is historical. Phase 20 records the owner-approved Vercel Blob plus
> durable `UPLOADS_DIR` decision that supersedes it:
> [`spec.md`](./spec.md#subsequent-storage-decision).

## Storage and request flow

Use the existing PostgreSQL database for durable image bytes in an
`ImageAsset` model. A server-only upload endpoint consumes one raw image body
with Pages Router `bodyParser` disabled, enforces the 5 MiB limit while
streaming, verifies JPEG/PNG/WebP signatures against the declared MIME type,
and creates a server-generated opaque key. A separate GET-by-key API serves
persisted bytes with verified content type and safe cache/nosniff headers.
The upload endpoint authorizes either the current user's own profile or the
specific CMS capability; it never trusts an identity, role, or filename from
the request.

Use application image URLs as the existing `String`/`String[]` references.
Add a nullable `User.image` field for the student/admin/shop-manager profile;
reuse `Coach.image`. CMS record update/delete paths remove replaced/deleted
asset bytes only after checking all supported fields for remaining references.
Preserve legacy external image references on existing records when those
fields are unchanged, but make new image selection/upload use the application
upload flow.

## Files and surfaces

- `prisma/schema.prisma`, `prisma/migrations/<timestamp>_profile_cms_image_assets/`
  — user image reference and durable asset table.
- `src/lib/uploads.ts` — file limits, signature checks, safe URLs, reference
  discovery and unreferenced cleanup.
- `src/pages/api/uploads/index.ts`, `src/pages/api/uploads/[id].ts` — scoped
  upload and durable asset serving.
- `src/pages/api/student/profile.ts` and `src/pages/api/uploads/index.ts` —
  user profile image validation and authenticated user/coach image updates.
- Student and coach profile UI — upload, preview, and Persian feedback.
- Existing admin create/edit flows and APIs for success stories, testimonials,
  coach image, and news-article image; shop product admin UI and API.
- Targeted unit/API tests beside the established `src/__tests__` patterns.
- `specs/012-profile-cms-uploads/{spec.md,plan.md,tasks.md,converge.md}`.

## Implementation sequence

1. Add focused tests for authenticated profile ownership, CMS role scopes,
   MIME/size/signature validation, database persistence, and cleanup when
   replacing references. Confirm tests fail before implementation.
2. Add the Prisma model/field and migration; implement tested storage
   validation, upload, read, and safe cleanup.
3. Connect profile APIs and student/coach profile upload controls.
4. Connect image upload controls to the specified CMS forms and enforce
   authorization and image references in their existing API mutations.
5. Run focused tests, then `npm test`, `npm run typecheck`, `npm run lint`,
   `npm run build`, and browser checks for profile and CMS upload paths where
   startup permits.
6. Review the final diff against each FR, record exact commands/results and
   limitations in `converge.md`, and stop before Phase 13.

## Risks and mitigations

- PostgreSQL bytea increases database capacity and backup needs; use the
  explicit per-file cap, keep storage in the existing durable database, and
  document operational implications rather than depending on ephemeral disk.
- Upload and database writes can fail independently; use transactions for
  reference changes and do not remove an old asset until the new reference is
  committed.
- Image MIME headers are client-controlled; verify actual file signatures and
  reject unsupported formats including SVG.
- Existing records may contain external media URLs; retain unchanged legacy
  references and do not break existing content while new uploads use only
  persisted app assets.
