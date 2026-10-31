# Phase 1 convergence — Unified session helper and coach leak

## Requirements checklist

- [x] Shared `getSession` / `getOptionalSession` resolve the user or active
      coach by verified JWT `userId`; roles come from the database, not the
      JWT role claim.
- [x] `requireSession` and `requireRole` provide shared API guards. Existing
      `authorizeStudent`, `authorizeAdmin`, `authorizeShopManager`, and
      `authorizeStaff` use the shared resolution and retain their result and
      response shapes.
- [x] Admin, student, and staff-notifications server-side props use current
      database-backed authorization.
- [x] `/api/auth/me` uses the shared session resolution and preserves account
      and coach profile payloads and invalid/unrecognized-account status
      behavior.
- [x] Shop checkout uses the optional shared session and associates only
      student accounts, as before.
- [x] Coach dashboard requires an active coach session, selects only fields
      needed by the page, does not select or return password data, and
      serializes scheduled session dates to ISO strings.
- [x] Tests cover student, admin, shop-manager, and coach sessions; forged JWT
      role claims; expired tokens; role denial; legacy response behavior; and
      coach dashboard prop safety/serialization.

## Validation evidence

- Targeted auth and coach dashboard tests passed during implementation.
- Full test suite: passed, 22 files / 103 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with repository lint warnings only; targeted lint
  reported no errors. Existing `any` warnings remain in the admin and coach
  dashboard components.
- `git diff --check`: passed.
- Browser verification was not required for this non-visual phase.

## Scope and deviations

Implementation stayed within the Phase 1 application surfaces and added the
planned auth and coach dashboard tests. The required `spec.md`, `plan.md`,
`tasks.md`, and this convergence handoff were also completed. No schema or UI
design changes were made.

One compatibility detail was made explicit in the shared resolver: a missing
or invalid token remains 401, while a verified token with an unknown account
or disallowed role remains 403. `/api/auth/me` retains 404 for a verified but
unrecognized account.
