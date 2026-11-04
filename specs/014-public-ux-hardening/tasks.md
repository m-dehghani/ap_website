# Phase 14 execution checklist

Follow the sequence and gates in [plan.md](./plan.md). Do not implement product
code until this spec, plan, and task checklist are reviewed. Before editing
Next.js code, read the relevant guides in
`node_modules/next/dist/docs/`. Preserve the existing worktree and do not
modify unrelated files.

## Clarification gate

- [ ] Confirm the implementation team accepts the explicit defaults recorded
  in the spec: existing programs stay public unless individually unpublished;
  the five specified mobile primary links remain fixed; registration success
  requires the signed, 10-minute proof; and no program price or promotional
  content is changed.
- [ ] Resolve any disagreement by editing the spec first, then update the plan
  and task checklist before starting implementation.

## Phase 1 — Public data and result-state correctness

- [ ] Add the migration-backed program visibility flag; keep existing records
  public by default; filter all public listing/registration paths; add focused
  service, API, and registration tests.
- [ ] Add authorized program-editor control and API validation; test default,
  update, invalid input, and authorization.
- [ ] Initialize registration form fields and ensure empty/malformed form
  submissions display localized, associated Persian messages rather than raw
  validation text.
- [ ] Add settled missing and unknown payment-result states after router
  readiness; retain every existing recognized result message.
- [ ] Implement signed 10-minute registration confirmation proof, server-side
  verification, safe session-storage transport, and neutral invalid/direct
  route state; test valid and invalid proof cases.
- [ ] Run phase-focused tests, `npm test`, `npm run typecheck`,
  `npm run lint`, and browser checks for changed public routes.
- [ ] Once deployed to the authorized target environment, confirm the exact
  audit-observed test-named record and explicitly mark it not public without
  changing its price or deleting it. If target access is unavailable, record
  this deployment action as blocked in the convergence record.

## Phase 2 — Accessibility and hierarchy

- [ ] Record an axe baseline for the ten public routes in both themes.
- [ ] Correct all observed light/dark contrast failures using current design
  tokens and validate the actual rendered color ratios.
- [ ] Correct program/shop accessible names and form labels; provide one
  descriptive H1 and a logical heading hierarchy on each audited route.
- [ ] Add axe, accessible-name, and heading regression assertions.
- [ ] Run phase-focused tests, `npm test`, `npm run typecheck`,
  `npm run lint`, and browser checks for affected routes in both themes.

## Phase 3 — Navigation, imagery, and release verification

- [ ] Group mobile navigation into the five specified primary links and the
  “بیشتر” disclosure; preserve secondary links and separate cart, registration,
  and account actions.
- [ ] Verify keyboard toggle, focus containment/restoration, Escape, active
  route, and route-change behavior.
- [ ] Trace homepage empty image sources to the CMS-backed data; prevent empty
  or invalid sources from rendering and use existing optimized-image patterns.
- [ ] Run browser checks at 320, 390, 768, and 1440 CSS px on scoped public
  routes in both themes; assert no horizontal overflow.
- [ ] Run focused tests, complete `npm test`, `npm run typecheck`,
  `npm run lint`, `npm run build`, and `npm run test:e2e`.
- [ ] Measure a production build with three mobile Lighthouse runs; record
  environment, median LCP, CLS, and transferred bytes. Confirm median LCP
  ≤ 2.5s and CLS ≤ 0.1, or record the unresolved performance gap.
- [ ] Create `converge.md`, map every REQ to implementation and evidence, list
  exact command results, and document unavailable production/admin checks.
