# Phase 16 — Audit-driven correctness and quality hardening

## Status and review snapshot

This is a proposed implementation phase from a repository-wide review. No
product code has been changed for this phase.

- The application is Next.js 16.4.2 with the Pages Router and React 19.2.7.
- `npm run typecheck` and `npm run build` passed during the review.
- `npm test -- --reporter=dot` passed: 68 test files and 305 tests. It emitted
  React DOM-prop, `act(...)`, and jsdom canvas warnings from test code and
  mocks.
- `npm run lint` passed with 0 errors and 372 warnings. `npm run lint -- src`
  passed with 0 errors and 86 warnings. The full lint run includes local
  `.claude` content, which `.gitignore` excludes from version control.
- `vitest.config.ts` triggered Vite's warning about use of `__dirname` with
  the native config loader.
- `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter` destructure
  remaining HTML attributes but do not pass them to their rendered elements.
- The shop-cart city-loading effect reads `values.city` without listing it as
  a dependency and does not guard against out-of-order province responses.
- The repository implementations under `src/lib/repositories/` are only
  instantiated and exported by their own barrel; a repository-wide source
  search found no consumers.
- The existing Phase 14 public UX findings and Phase 15 security findings,
  including the unauthenticated `/api/students` data exposure and dependency
  advisories, are already tracked in their respective specs and are not
  repeated as new work here.

## Goal

Fix confirmed UI/data-state defects, remove unused abstractions where safe, and
make the repository's lint and test results representative of first-party
code. Preserve existing behavior and use the installed Next.js Pages Router
guidance; this phase does not migrate the application to the App Router.

## User stories

- As a visitor using checkout, I see city choices and selected values that
  match the province currently selected, even when requests finish out of
  order.
- As a user of shared UI components, native accessibility attributes, event
  handlers, and data attributes passed to a card component reach the rendered
  element.
- As a developer, lint and test output identifies actionable first-party
  issues instead of ignored local tooling or warnings caused by incomplete
  mocks.

## Functional requirements

- **FR-1 — Card attribute forwarding:** `CardHeader`, `CardTitle`,
  `CardContent`, and `CardFooter` must forward supported HTML attributes to
  their underlying elements, in addition to their existing `className`,
  children, and ref behavior.
- **FR-2 — Current checkout location state:** City loading must apply results
  only to the currently selected province. A stale response must not replace
  the current city list or clear a newer valid selection. Errors remain
  visible through the existing notification behavior.
- **FR-3 — Repository layer disposition:** Confirm that the repository
  factories have no in-repository consumers before removing them. If a
  legitimate consumer is identified, retain only the needed repositories and
  give their inputs and return values explicit Prisma/domain types rather
  than `any`.
- **FR-4 — Type-safe shared boundaries:** Replace unsafe `any` usage in the
  active shared form hook and the view-model mapping boundaries touched by
  this phase with concrete types. Preserve validation and form behavior.
- **FR-5 — Reliable quality signals:** Update the Vitest path alias to avoid
  the unsupported `__dirname` config pattern; keep local ignored `.claude`
  files out of lint; and fix test doubles or async assertions that produce
  React DOM-prop, `act(...)`, or jsdom canvas warnings. Do not hide these
  messages with global console suppression or disable relevant lint rules.
- **FR-6 — Lint debt:** Triage the existing first-party lint warnings and
  resolve them or record a specific justified exception in the convergence
  notes. Do not increase the warning baseline or weaken rule severity.

## Acceptance criteria

1. Regression tests prove card subcomponents forward `id`, `data-*`,
   `aria-*`, and event-handler props while preserving refs and existing
   styling.
2. Checkout tests use deferred city responses to resolve two province
   requests out of order and verify that only the latest province's cities
   and valid selection are retained. The test also covers a failed request.
3. Repository removal is supported by a repository-wide consumer search;
   no database schema or externally visible API behavior changes as a result.
4. Shared form and mapper types no longer rely on `any` in the changed
   boundaries; validation, login, registration, and relevant API tests pass.
5. `npm run lint` no longer lints local ignored `.claude` content. There are
   no unexplained lint warnings in tracked first-party code; every retained
   warning is listed with rationale and follow-up in `converge.md`.
6. The test suite no longer emits the identified invalid motion/image DOM
   prop warnings, unawaited-update warnings, or canvas-environment warning.
   Tests must wait for the user-visible async result rather than suppressing
   React diagnostics.
7. `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
   `converge.md` records exact command results and any remaining exceptions.

## Scope and constraints

Expected scope: `src/components/ui/Card.tsx` and focused tests;
`src/pages/shop/cart.tsx` and focused checkout tests; `src/lib/repositories/`
only if the no-consumer result is reconfirmed; `src/hooks/useForm.ts` and
view-model types only where required for safe typing; `vitest.config.ts`,
`vitest.setup.tsx`, and the affected test mocks; `eslint.config.mjs`; and this
phase's SDD artifacts.

Do not redesign checkout, alter shipping prices or APIs, migrate routers,
perform speculative bundle optimization, remove lint rules, or rework the
already-tracked Phase 14/15 scope. If new security, accessibility, or
performance findings arise, reconcile them with those existing specs or the
backlog before expanding this phase.

## Review references

- Installed framework: Next.js Pages Router documentation under
  `node_modules/next/dist/docs/02-pages/`, especially the API Routes,
  production, and image guides.
- Vercel React Best Practices skill:
  <https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices>.
  Apply only relevant React and Pages Router guidance; do not apply
  App-Router-only recommendations.
- Current modern web guidance was consulted for performance and diagnostic
  hygiene. Performance changes remain measurement-gated and are already
  covered by Phase 14.
