# Phase 1 — Unified session helper and coach leak

**Status:** Implemented and verified.

## Clarification decisions

- The signed JWT is used only to identify a record by `userId`. Its `role`
  claim is ignored; the session role and source come from current database
  records.
- `getSession` returns null for a missing, invalid, expired, malformed, or
  unrecognized identity token. Database/configuration failures are not treated
  as unauthenticated sessions and must remain visible to the caller.
- Coaches are valid sessions only when their coach record is active. User
  accounts are valid only for the existing `STUDENT`, `ADMIN`, and
  `SHOP_MANAGER` roles.
- Required guards preserve existing response statuses: missing/invalid tokens
  return 401, while a verified token with no recognized account or a
  disallowed database role returns 403. Existing JSON response shapes remain
  unchanged.
- `/api/auth/me` preserves its current user payload shape, including the
  coach-specific public profile shape and student registration relations.
- Staff notifications require an admin or active coach session; merely having
  any auth cookie is not sufficient.
- The shop order's optional student association remains limited to a student
  account; other valid sessions continue to create an unassociated order.
- Coach dashboard props include only fields consumed by the page. Scheduled
  session dates are serialized to ISO strings before being returned.
- For this run, requirements are treated as clarified against the repository
  behavior and the parent plan. No unrelated auth flows or login/token format
  changes are included.

## User stories

- As a staff member, student, or shop user, I get a consistent session shape
  from pages and APIs.
- As a coach, I can use my dashboard without exposing my password hash.
- As a user, an invalid, expired, or forged JWT role cannot grant access beyond
  the role stored in the database.

## Functional requirements

- Add shared session helpers in `src/lib/auth.ts` that verify the JWT and load
  the corresponding user or coach from the database.
- Return `{ id, role, source: 'user' | 'coach' }` from `getSession(req)` or
  `null`; provide shared required-session and role-checking helpers.
- Route existing student, admin, shop-manager, and staff authorization
  functions through the shared helper without changing their HTTP status or
  JSON response contracts.
- Use an optional shared-session helper for shop order student identity.
- Restrict coach dashboard props to public fields and serialize dates.
- Align the admin, student, staff notifications, auth-me, and shop-order
  surfaces listed in the parent plan with the shared session behavior.

## Success criteria

- Coach dashboard props do not contain a password field or hash.
- All existing `authorize*` paths use the shared session implementation.
- Tests cover student, admin, coach, and shop-manager sessions, role mismatch,
  invalid/expired JWTs, and legacy authorization response behavior.
- Existing authorization response behavior is preserved.
- No password field or hash is queried for or serialized in coach dashboard
  props.

## Scope and verification from the parent plan

Follow the files, test additions, and `Done when` checklist in Phase 1 of
[`plans/plan.md`](../../plans/plan.md). Browser verification is not called out
for this phase; run the program's test, typecheck, and lint gates.
