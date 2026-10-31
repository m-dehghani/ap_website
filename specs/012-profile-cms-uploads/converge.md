# Phase 12 convergence

## Requirement-to-change mapping

| Requirement | Implementation evidence | Verification |
|---|---|---|
| FR-1: Users and coaches can update only their own profile image | `src/pages/api/uploads/index.ts` derives the account from `getSession`; `src/pages/api/student/profile.ts` uses the session user ID; `src/pages/coach/dashboard.tsx`, `src/pages/student/dashboard.tsx`, and `src/components/AdminLayout.tsx` expose self-service controls. | Upload API/profile tests cover anonymous and ownership boundaries; the 239-test suite passes. |
| FR-2: CMS upload authorization and supported content scope | Upload scopes in `src/pages/api/uploads/index.ts` require `ADMIN` for story, testimonial, coach, and news; product scope permits `ADMIN`/`SHOP_MANAGER`. Controls are wired in the corresponding admin forms and shop editor. | Upload API tests cover editor-role restrictions; CMS validation tests pass. |
| FR-3: JPEG/PNG/WebP, 5 MiB limit, server-side content validation | `src/lib/uploads.ts` verifies file signatures against declared MIME; `src/pages/api/uploads/index.ts` enforces streaming and `Content-Length` limits. | Targeted upload tests cover empty, unsupported, oversized, and mismatched payloads; pass. |
| FR-4: Safe durable storage and image serving | `prisma/schema.prisma`, migration `20261101000000_profile_cms_image_assets`, and `ImageAsset` persist bytes in PostgreSQL under generated UUIDs. `src/pages/api/uploads/[id].ts` serves only stored assets with verified type, `nosniff`, and immutable cache headers. Operational implications are recorded in `docs/application.md`. | Persistence and serving tests pass; production build passes. No deployment migration or live database restart test was run. |
| FR-5: Reference replacement and cleanup | Profile and CMS APIs validate app-owned references and call `deleteUnreferencedImage` after replacement/removal; product image arrays retain any still-referenced asset. | Targeted replacement, retention, and cleanup tests pass. |
| FR-6: Persian UI and actionable errors | `src/components/ImageUploadField.tsx` provides Persian picker, preview, progress/status, removal, and errors; admin profile and CMS forms use it. Server errors are Persian. | Component tests pass. Browser checks were blocked because the environment denied Next.js server binds (`EACCES` on `0.0.0.0:3000` and `127.0.0.1:3100`). |
| FR-7: Preserve existing records and limit schema changes | Added `users.image` and dedicated `image_assets`; retained `coaches.image`. Validation permits unchanged legacy references without treating remote URLs as new uploads. No Phase 13 success-page changes were made. | Schema migration generation and production build pass; existing tests pass. Live migration against deployment PostgreSQL was not run. |

## Verification performed

- Focused upload/profile/CMS tests: 34 passed across 7 files.
- `npm test`: 44 test files, 239 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with existing warnings; no lint errors.
- `npm run build`: passed; Next.js generated all routes, including upload endpoints.
- `git diff --check`: passed.
- Browser checks: not run; local server startup was denied by the environment with `EACCES` on both attempted loopback/port configurations.

## Operational limits

Image bytes share the existing PostgreSQL durability and backup lifecycle; deployment must apply the included migration and account for image growth in database capacity and backups. No object-storage integration or credentials were found or assumed. A live database migration, deployment restart check, and browser upload journey were unavailable in this environment.
