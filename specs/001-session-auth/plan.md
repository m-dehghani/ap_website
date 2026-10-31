# Phase 1 implementation plan — Unified session helper and coach leak

## Decisions

- Keep the existing `auth_token` cookie and JWT format. Treat only the JWT
  `userId` as an identifier; always derive role and identity source from the
  database.
- Define a session as `{ id, role, source }`, with `source` distinguishing
  `users` from active `coaches`.
- Expose optional and required session helpers plus one role guard. Keep
  current API authorization wrappers as thin adapters so callers and response
  shapes remain compatible.
- Invalid/missing JWTs produce no session; database and configuration failures
  propagate instead of being silently treated as missing authentication.
- Required guards preserve existing response statuses: missing/invalid tokens
  return 401; a verified token with an unknown account or disallowed role
  returns 403.
- Keep shop review optional-account access to student/admin/shop-manager roles;
  keep shop order association student-only.
- Restrict the coach dashboard query to fields used by its UI, and convert
  scheduled-session `date` values to ISO strings before returning page props.
- For the authentication-me endpoint, preserve the current response shape for
  account and coach records while using the shared session to identify the
  verified principal.

## Files and changes

- `src/lib/auth.ts`: implement `getSession`, `getOptionalSession`,
  `requireSession`, and `requireRole`; route `authorizeStudent`,
  `authorizeAdmin`, `authorizeShopManager`, `authorizeStaff`, and optional
  account lookup through them.
- `src/pages/coach/dashboard.tsx`: authorize from the shared session and query
  only public coach/program/session fields; serialize dates.
- `src/pages/admin/index.tsx`: use a database-verified admin session.
- `src/pages/student/dashboard.tsx`: use a database-verified student session.
- `src/pages/staff/notifications.tsx`: require a database-verified admin or
  active coach session.
- `src/pages/api/auth/me.ts`: use the shared session identity and preserve
  current JSON profiles.
- `src/pages/api/shop/orders/index.ts`: derive the optional student ID from the
  shared optional-session helper.
- `src/__tests__/lib/auth.test.ts`: cover session variants, DB role/source
  authority, expired JWT handling, and authorization response behavior.
- `src/__tests__/pages/coach/dashboard.test.tsx`: verify coach GSSP returns
  safe, serializable props and its query does not request the password.

## Verification

1. Run targeted auth and coach dashboard tests.
2. Run the required program gates: `npm test`, `npm run typecheck`, and
   `npm run lint`.
3. Inspect the final diff against the Phase 1 requirements and record any
   deviations in `converge.md`.

No schema migration or UI redesign is in scope.
