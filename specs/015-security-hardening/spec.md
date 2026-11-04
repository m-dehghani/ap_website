# Phase 15 — Security findings remediation

## Context and decisions

A static security review of this Next.js 16.4.2 Pages Router application
confirmed that `src/pages/api/students.tsx` returns complete program and
registration records without authentication. Registration data includes
parent/emergency-contact details and medical conditions. A source search found
no code callers of this endpoint; `docs/application.md` nevertheless describes
it as authenticated. Reconcile this documentation with the implementation and
confirm no external contract before removal. If a valid consumer exists, retain
the endpoint only with authorization and a minimal, purpose-specific response.

The dependency audit on 2026-11-04 reported 8 high, 18 moderate, and 1 low
advisory across the full dependency tree. `zod@4.4.3` is a direct runtime
dependency affected by an advisory for memory exhaustion when validating
oversized constrained collections. The audit also flags Prisma and transitive
tooling dependencies; determine whether each finding is reachable in production
or limited to development/build tooling before assigning remediation priority.
The production-only audit still reported 7 high and 7 moderate advisories,
including the Zod and Prisma dependency chains.

`next.config.ts` already sets frame, content-type, and referrer headers, but no
Content-Security-Policy. Treat CSP as defense-in-depth, not a confirmed
exploitable vulnerability. Follow the installed Next.js guidance and deploy a
policy safely without breaking legitimate scripts, styles, payment flows, or
image hosts.

## User stories

- As a student and family member, my registration and health/contact details
  are not exposed through an unauthenticated API.
- As an operator, vulnerable application and build dependencies are upgraded
  or have a documented, time-bound exception based on actual reachability.
- As a visitor, browser security policy reduces the impact of injection and
  framing attacks without breaking normal site behavior.

## Functional requirements

- **FR-1 — Registration privacy:** The public API surface never exposes
  registration or student/family data without authorization. Remove the
  unreferenced `GET /api/students` endpoint. If a consumer is shown to be
  required, authorize each request for its actual role and resource scope and
  return only the explicitly needed fields using Prisma `select`; never return
  the full program or registration rows.
- **FR-2 — Dependency remediation:** Resolve high/critical advisories in the
  lockfile, prioritizing direct production dependencies and reachable
  execution paths. Update `package.json` and the lockfile coherently, retain
  compatible Prisma/Next.js behavior, and document any remaining advisory with
  affected package, reachability, compensating control, and review date.
- **FR-3 — Content Security Policy:** Establish a tested CSP using the
  installed Next.js 16.4.2 documentation. Begin in report-only mode, inventory
  legitimate script/style/image/font/payment origins, and enforce only after
  representative route checks. Use per-request nonces if required by the
  rendered Next.js pages; do not use broad `unsafe-inline`/`unsafe-eval` or
  wildcard sources as an expedient. Preserve existing security headers.
- **FR-4 — Regression protection:** Add tests proving public and unauthorized
  callers cannot obtain registration data, authorized behavior is limited to
  an approved DTO if the route remains, and security headers/policy are
  emitted as intended.

## Acceptance criteria

1. `/api/students` is removed if unused, or unauthenticated and unauthorized
   requests are denied and authorized responses contain only approved fields.
   No response includes parent, emergency-contact, medical, password, or
   unrelated program data.
2. Tests cover the endpoint's allowed, denied, and missing-resource cases; no
   regression reintroduces full-row serialization. `docs/application.md`
   accurately describes the resulting route or its removal.
3. `npm audit` and `npm audit --omit=dev` are rerun after remediation. No
   unresolved high/critical advisory remains without an explicit documented
   exception and risk decision. Typecheck, lint, focused tests, full tests,
   and production build pass.
4. The CSP report-only policy is checked against public, authentication,
   admin, payment callback, and uploaded-image flows. Enforced CSP has no
   unexplained legitimate violations; existing frame/content-type/referrer
   protections remain enabled.
5. A convergence record maps each FR to the code, tests, dependency audit
   results, and any deployment-only validation still outstanding.

## Scope and constraints

Expected scope: `src/pages/api/students.tsx`, `docs/application.md`, focused
API tests, dependency manifests/lockfile only as required by advisories,
`next.config.ts` and/or the Next.js 16 request-processing surface required for
CSP, and `specs/015-security-hardening/`. Add other files only when required
by a verified finding and record them in convergence notes.

Do not modify unrelated APIs or data, return broad student records to
authenticated callers by default, upgrade dependencies blindly with force
flags, or claim CSP is a vulnerability. Use the actual installed framework
guidance under `node_modules/next/dist/docs/`; the relevant CSP and data
security guides describe nonce requirements and minimal authorized DTOs.

## Security references

- OWASP Top 10:2025 — Broken Access Control, Security Misconfiguration, and
  Vulnerable and Outdated Components.
- Next.js 16.4.2 installed guides:
  `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`,
  `node_modules/next/dist/docs/01-app/02-guides/data-security.md`, and
  `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`.
- OWASP API Security Top 10 — Broken Object Level Authorization (BOLA).
