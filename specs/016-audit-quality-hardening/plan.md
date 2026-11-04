# Phase 16 implementation plan — Audit-driven correctness and quality hardening

## Decisions and sequencing

- Keep the existing phase ordering and handoff. This audit phase must not
  silently replace the currently documented Phase 3 priority or overlap
  unfinished Phase 14/15 work.
- Use the installed Next.js Pages Router documentation and React guidance
  applicable to this app. Do not migrate to the App Router or copy
  App-Router-specific patterns.
- Fix correctness defects before reducing warning counts. Do not weaken
  lint rules, blanket-ignore warnings, or suppress React diagnostics.
- Remove the repository layer only if a fresh repository-wide search confirms
  the current no-consumer result. If it has an actual consumer, retain and
  type only the used surface.
- Preserve the current checkout behavior and server-side validation. Browser
  results are not authoritative for price or inventory.

## Files and validation surfaces

- `src/components/ui/Card.tsx` — forward remaining native attributes for card
  subcomponents.
- `src/__tests__/components/` — add card attribute/ref regression coverage.
- `src/pages/shop/cart.tsx` — guard city-list state against stale values and
  out-of-order requests.
- `src/__tests__/pages/shop/` — add checkout city-request race and failure
  coverage; create the focused test file if none exists.
- `src/lib/repositories/` — confirm no callers and remove the abandoned
  abstraction, or type the minimum retained API.
- `src/hooks/useForm.ts` and `src/types/viewModels/` — improve types without
  changing current login, registration, or content behavior.
- `vitest.config.ts`, `vitest.setup.tsx`, and affected test files — correct
  module path resolution and mocks/async assertions.
- `eslint.config.mjs` — exclude local ignored tooling while continuing to
  lint tracked first-party source and configuration.
- `specs/016-audit-quality-hardening/converge.md` — record final evidence.

## Implementation sequence

1. Re-run the baseline consumer search and confirm which repository exports
   are unused. Add focused regression tests for card attribute forwarding and
   for city responses resolving out of order before changing implementation.
2. Fix card prop forwarding and checkout city state handling. For checkout,
   use cleanup or a request identity guard so stale responses cannot commit;
   use the latest state when deciding whether to clear a city. Avoid adding
   dependencies or changing the server's checkout validation.
3. Remove the unused repository layer if the no-consumer search still holds.
   Otherwise preserve only used repositories and replace loose Prisma
   `any` types with generated input/payload types.
4. Replace unsafe `any` at active form and view-model boundaries, addressing
   hook dependencies as part of the underlying state design rather than by
   suppressing `react-hooks/exhaustive-deps`.
5. Change test doubles to consume or model framework-only props instead of
   spreading them onto plain DOM nodes. Await observable asynchronous updates
   in tests; use a narrow canvas mock only if a test genuinely needs that API.
6. Update the Vitest alias to an ESM-safe path and update ESLint ignores for
   `.claude`. Review the remaining lint output against tracked project files;
   resolve first-party warnings or document an explicit exception.
7. Run focused tests, then `npm test`, `npm run typecheck`, `npm run lint`,
   and `npm run build`. Write `converge.md` with the exact outcomes, changed
   files, warning baseline/result, and any deployment-only checks.

## Out of scope

- Changing business rules, shipping configuration, payment, stock, or
  persisted data.
- Repeating Phase 14 public UX/performance work or Phase 15 security work.
- Broad Next.js/React/dependency upgrades, App Router migration, or
  unmeasured client-bundle rewrites.
- Silencing test output or downgrading lint rules to make the gate pass.
