# Phase 15 implementation plan — Security findings remediation

## Data and access decisions

- First confirm the repository-wide caller search for `GET /api/students`.
  The current search found no code caller, but `docs/application.md` claims
  the endpoint is authenticated. Resolve that documentation/implementation
  mismatch and confirm there is no external contract. Remove the endpoint if
  unused; update documentation to match the verified result.
- If an in-scope consumer is discovered, define its needed fields and caller
  roles before retaining the API. Require `requireRole`/existing shared auth
  helpers and query a narrow Prisma `select`; do not include complete
  registrations or program rows.
- Use `npm audit` advisory metadata and dependency paths to separate runtime
  impact from development/build-only exposure. Upgrade compatible direct
  packages and transitive parents; avoid forced overrides unless compatibility
  and tests demonstrate they are safe.
- Follow Next.js 16.4.2's CSP guide. In this Pages Router app, verify the
  supported request/response integration for unique nonces and Next-generated
  scripts before choosing configuration. Keep report-only policy during
  discovery and enforce only after legitimate origin requirements are
  understood.

## Files and validation surfaces

- `src/pages/api/students.tsx` — remove or restrict and minimize the route.
- `src/__tests__/` — add route authorization and response-shape regression
  tests beside existing API tests.
- `docs/application.md` — correct the `/api/students` authentication and
  response description to match the secured implementation or removal.
- `package.json`, `package-lock.json` — update only packages required to
  address the verified audit advisories.
- `next.config.ts` and, only if required by the installed Next.js guidance,
  the Pages Router request-processing surface — CSP and existing headers.
- Security-sensitive routes for browser checks: public pages, login,
  registration, admin, shop/payment, and uploaded images.
- `specs/015-security-hardening/{spec.md,plan.md,tasks.md,converge.md}`.

## Implementation sequence

1. Add API regression tests for unauthenticated, unauthorized, authorized,
   missing-program, and response-shape cases. Reconcile the route's actual
   behavior with `docs/application.md`; confirm there is no external contract.
   Remove the route when unused. Otherwise implement only the narrowly
   authorized DTO required by a documented consumer.
2. Update the smallest compatible set of direct/transitive dependencies.
   Review audit advisories and `npm ls` paths; run focused tests, typecheck,
   lint, and build before accepting any lockfile change.
3. Configure CSP in report-only mode using the installed Next.js version's
   supported Pages Router path. Check real rendered routes and required
   third-party origins; record violations without logging sensitive request
   data. Add per-request nonces where needed rather than weakening the policy.
4. Enforce the reviewed policy, retaining existing headers, and verify response
   headers and the critical browser flows.
5. Run `npm audit`, `npm audit --omit=dev`, focused tests, `npm test`,
   `npm run typecheck`, `npm run lint`, `npm run build`, and targeted browser
   checks. Record exact outcomes and any deployment-only limitations in
   `converge.md`.

## Out of scope

- General authentication redesign or changes to unrelated API authorization.
- Editing or deleting student records.
- Broad dependency upgrades unrelated to identified advisories.
- Reporting missing CSP as a confirmed exploit.
