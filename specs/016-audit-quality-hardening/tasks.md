# Phase 16 tasks — Audit-driven correctness and quality hardening

Do not begin implementation until the currently prioritized roadmap work and
any overlapping Phase 14/15 changes are reconciled. Update this checklist if
the spec or plan changes.

- [ ] **T1 — Confirm scope and consumers:** Re-run the repository-wide search
  for repository exports and consumers. Record the initial lint/test
  diagnostics for the implementation branch.
- [ ] **T2 — Preserve card attributes:** Forward native attributes from
  `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter`; add tests for
  `id`, `data-*`, `aria-*`, event handlers, refs, and existing class behavior.
- [ ] **T3 — Guard checkout city requests:** Add deferred-response tests for
  province changes in both response orders and for request failure. Prevent
  stale responses from replacing current cities or clearing the current valid
  city, without changing server-side checkout validation.
- [ ] **T4 — Remove or type repositories:** If no consumers exist, remove the
  unused repository factories and barrel. Otherwise retain only the required
  repositories, type their Prisma queries/results, and add focused tests.
- [ ] **T5 — Type shared form and view models:** Replace unsafe `any` at the
  active `useForm` and mapper boundaries; preserve login, registration, CMS,
  and API payload behavior with focused tests and typecheck.
- [ ] **T6 — Fix test/config diagnostics:** Use an ESM-safe Vitest alias;
  exclude ignored local `.claude` content from lint; fix the affected motion,
  image, async-update, and canvas test doubles/assertions without global
  warning suppression.
- [ ] **T7 — Resolve lint debt:** Review warnings from tracked first-party
  files, fix them or document a specific exception in `converge.md`, and
  verify the relevant lint rules remain enabled.
- [ ] **T8 — Validate and converge:** Run focused tests, `npm test`,
  `npm run typecheck`, `npm run lint`, and `npm run build`. Record exact
  results, the before/after warning counts, and any outstanding limitations
  in `converge.md`.
