---
goal: Improve public-site trust, accessibility, navigation, and measured performance
version: "1.0"
date_created: 2026-11-04
last_updated: 2026-11-04
owner: Website team
status: Planned
tags: [design, accessibility, UX, performance]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-007ec6)

This is the implementation plan for [Phase 14](./spec.md). It converts the
public UI/UX audit findings into testable changes while preserving existing
Persian content, prices, Next.js Pages Router conventions, and the active
design system. It does not implement application changes. Execute phases in
order; do not start a phase until its tasks are accepted and the preceding
phase's validation gates pass.

## 1. Requirements & Constraints

- The normative functional requirements are **REQ-001** through **REQ-009**
  in [spec.md](./spec.md); this plan references those requirements without
  redefining them.
- **SEC-001**: Sign registration confirmation proofs with the existing
  `getJwtSecret()` key and a dedicated purpose claim; set a 10-minute maximum
  lifetime, verify signature/purpose/expiry server-side, and include no
  personal data or proof in the URL.
- **CON-001**: Before implementation, read the relevant local Next.js guides
  in `node_modules/next/dist/docs/`; do not assume conventional Next APIs.
- **CON-002**: Preserve Persian-only, RTL behavior and verified content. Do
  not invent facts, testimonials, prices, or program availability.
- **CON-003**: Do not redesign authenticated internal dashboards; those were
  not accessible during the audit.
- **GUD-001**: Use the existing named palette and typography in `DESIGN.md`
  and `src/styles/globals.css`; test both themes rather than introducing a
  new visual system.
- **PAT-001**: Follow the existing phase workflow in `plans/plan.md` and
  `specs/constitution.md`; use Vitest, Playwright, axe-core, and existing
  helpers without adding dependencies.

## 2. Implementation Steps

### Implementation Phase 1 — Correct public data and result states

- **GOAL-001**: Ensure public program eligibility and registration/payment
  success states are accurate and verifiable.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Add `Program.isPublic Boolean @default(true)` with a Prisma migration. Filter `getPrograms()` in `src/services/programService.ts` and `/api/programs` to active, public programs; reject unpublished program IDs in `src/pages/api/register.ts`. Add service/API/registration tests. Migration preserves current visibility; do not filter by name or price. | | |
| TASK-002 | Add `isPublic` to the authorized program editor in `src/pages/admin/programs/[id].tsx` and its create/update API validation in `src/pages/api/admin/programs/index.ts` and `src/pages/api/admin/programs/[id].ts`. Test default, persistence, invalid input, and authorization. After deployment, explicitly unpublish the single audit-observed record by confirmed identity; do not alter its price. Depends on TASK-001. | | |
| TASK-003 | In `src/pages/register.tsx`, initialize all form values and ensure empty/malformed fields display localized errors linked with `aria-describedby`; extend `src/__tests__/pages/register.test.tsx` to assert Persian errors and absence of raw exception text. | | |
| TASK-004 | In `src/pages/shop/payment.tsx`, distinguish `router.isReady` from settled missing/unrecognized query results and show a neutral Persian recovery state with safe links. Add tests for loading, missing, unknown, and every existing recognized result. | | |
| TASK-005 | Add a 10-minute, purpose-bound proof helper in `src/lib/registration-confirmation.ts`, issue it only after successful creation in `src/pages/api/register.ts`, and verify it plus the referenced registration through `src/pages/api/register/confirmation.ts`. Store the proof in session storage, never the URL; clear it after successful verification; make `src/pages/registration-success.tsx` render success only after API verification. Add signature, purpose, expiry, missing-record, direct-navigation, and successful-flow tests. Depends on TASK-001 and TASK-003 because it updates the same registration API and form route. | | |

### Implementation Phase 2 — Accessibility and page hierarchy

- **GOAL-002**: Resolve the audit-confirmed contrast, accessible-name, and
  heading findings without changing the existing brand direction.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | Re-run axe on `/`, `/about`, `/programs`, `/coaches`, `/testimonials`, `/news`, `/contact`, `/login`, `/shop`, and `/shop/cart` in light/dark themes. Fix every reported contrast failure in the affected page/component using the existing tokens in `src/styles/globals.css`; retain visible focus and verify contrast ratios. | | |
| TASK-007 | Correct accessible names on programs and shop controls so they include their visible labels. Give `/programs` one page-level H1 in `src/components/Programs.tsx`, fix heading order in `src/pages/login.tsx` and `src/pages/shop/cart.tsx`, and ensure each audited route has one descriptive H1 and logical heading levels. Add accessible-name and heading assertions plus axe regression coverage. Depends on TASK-006 because both tasks update audited page components. | | |

### Implementation Phase 3 — Mobile navigation, imagery, and final verification

- **GOAL-003**: Reduce mobile navigation choice overload, eliminate broken
  homepage image sources, and verify responsive quality and production speed.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | In `src/components/Header.tsx` and `src/constants/app.ts`, present Home, Programs, Coaches, Shop, and Contact as the five primary mobile links; group About, News, Honors, and Testimonials in a “بیشتر” disclosure. Keep cart, registration, and account actions separate. Preserve every destination, focus trap/restore, Escape, active-page, and route-change behavior; add `Header` tests for mouse and keyboard interaction. | | |
| TASK-009 | Trace the homepage's nine empty image elements to their CMS-backed source in `src/pages/index.tsx`, `src/components/Hero.tsx`, and hero-content services. Prevent empty/invalid URLs from rendering, provide a neutral existing-style fallback where the image is optional, and use the repository's `next/image` and `imageOptimizationProps` conventions where applicable. Add tests for missing and valid image values. | | |
| TASK-010 | Add/update `e2e/public-ux-hardening.spec.ts` to cover the public program, registration, payment, success, accessibility, and mobile-menu flows. Check no horizontal overflow at 320/390/768/1440 CSS px and both themes. Run focused tests, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and the Playwright suite. Measure three production mobile Lighthouse runs, report median LCP/CLS and transferred bytes, and record any environment limitation in `converge.md`. | | |

## 3. Alternatives

- **ALT-001**: Filter programs by a “test” name or unusually low price. Rejected
  because it is fragile, can hide legitimate records, and encodes commercial
  decisions in presentation logic.
- **ALT-002**: Change `isActive` on all existing records or default new
  `isPublic` values to false. Rejected because it could unexpectedly remove
  legitimate public programs. Preserve existing behavior with a true migration
  default and explicitly unpublish the one reviewed record.
- **ALT-003**: Display registration success from a query parameter or client
  flag alone. Rejected because direct navigation or a forged URL could show an
  unverified success state.
- **ALT-004**: Redesign every page or replace the existing visual system.
  Rejected because the audit identified targeted issues and the current RTL
  identity is a strength; broad redesign increases regression risk.
- **ALT-005**: Add a new accessibility, image, or performance dependency.
  Rejected because `axe-core`, Playwright, existing image helpers, and project
  scripts already cover the planned checks.

## 4. Dependencies

- **DEP-001**: Existing PostgreSQL/Prisma setup and the standard migration
  workflow; migration generation must not reset or delete existing data.
- **DEP-002**: Existing `jose` dependency and `getJwtSecret()` helper in
  `src/lib/auth.ts` for signed, purpose-bound registration confirmation.
- **DEP-003**: Existing Vitest, Playwright, `axe-core`, ESLint, TypeScript,
  and Next.js build scripts in `package.json`.
- **DEP-004**: Authorized access to the target environment to identify and
  unpublish the exact audit-observed test program after the code is deployed.
  Do not execute a production data mutation without confirming that record.
- **DEP-005**: A production-like server and Lighthouse-capable browser for
  repeatable performance measurements; development-server measurements are
  not substitutes.

## 5. Files

- **FILE-001**: `specs/014-public-ux-hardening/spec.md`,
  `specs/014-public-ux-hardening/plan.md`, and
  `specs/014-public-ux-hardening/tasks.md` — phase artifacts.
- **FILE-002**: `prisma/schema.prisma` and a new
  `prisma/migrations/<timestamp>_program_public_visibility/migration.sql` —
  program publication flag.
- **FILE-003**: `src/services/programService.ts`,
  `src/pages/api/programs.ts`, `src/pages/api/register.ts`,
  `src/pages/api/admin/programs/index.ts`,
  `src/pages/api/admin/programs/[id].ts`, and
  `src/pages/admin/programs/[id].tsx` — public filtering, registration
  eligibility, and authorized editing.
- **FILE-004**: `src/pages/register.tsx`,
  `src/pages/registration-success.tsx`,
  `src/pages/api/register/confirmation.ts`, and
  `src/lib/registration-confirmation.ts` — validated registration feedback
  and verified completion.
- **FILE-005**: `src/pages/shop/payment.tsx` — settled unknown/missing
  payment states.
- **FILE-006**: `src/styles/globals.css`,
  `src/components/Programs.tsx`,
  `src/components/programs/ComparisonTable.tsx`,
  `src/pages/about.tsx`, `src/pages/coaches.tsx`,
  `src/pages/testimonials.tsx`, `src/pages/news.tsx`,
  `src/pages/contact.tsx`, `src/pages/login.tsx`,
  `src/pages/shop/index.tsx`, and `src/pages/shop/cart.tsx` — targeted
  contrast and semantic fixes as confirmed by axe.
- **FILE-007**: `src/constants/app.ts` and `src/components/Header.tsx` —
  public navigation grouping.
- **FILE-008**: `src/pages/index.tsx`, `src/components/Hero.tsx`, and
  `src/services/content/index.ts` — homepage image source validation.
- **FILE-009**: New or extended focused tests under
  `src/__tests__/services/`, `src/__tests__/pages/`,
  `src/__tests__/components/`, and `src/__tests__/pages/api/`, plus
  `e2e/public-ux-hardening.spec.ts`.
- **FILE-010**: `specs/014-public-ux-hardening/converge.md` — create at
  implementation time to record requirement mapping, validation, and
  environment limitations.

## 6. Testing

- **TEST-001**: Unit/API tests prove `isPublic` defaults true, public queries
  exclude false values, registration rejects unpublished programs, and
  authorized admin updates persist the flag.
- **TEST-002**: Registration UI tests cover empty/malformed step submission,
  Persian messages, `aria-invalid`/`aria-describedby`, and no raw exception
  output.
- **TEST-003**: Payment page tests cover router-not-ready, missing result,
  unknown result, and all existing known result states.
- **TEST-004**: Confirmation-token/API/page tests cover valid signature,
  purpose, 10-minute expiry, invalid signature, missing/invalid token,
  missing registration, no URL token, and successful server verification.
- **TEST-005**: Axe tests cover WCAG 2.1 A/AA and WCAG 2.2 AA rules on the
  ten named public routes in light and dark themes; zero violations for
  contrast, names, and heading structure.
- **TEST-006**: Navigation tests verify five primary links, four links under
  “بیشتر”, all original destinations, separate cart/register/account actions,
  keyboard toggling, focus containment/restoration, Escape, and route closing.
- **TEST-007**: Image tests prove empty/invalid CMS URLs do not render as
  image sources and valid URLs remain displayed.
- **TEST-008**: Browser checks at 320, 390, 768, and 1440 CSS px verify
  no horizontal overflow and working primary actions on the scoped routes.
- **TEST-009**: Run focused Vitest and Playwright coverage, then
  `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and
  `npm run test:e2e`. In a production build, record three mobile Lighthouse
  runs and the median LCP, CLS, and transfer bytes; target LCP ≤ 2.5s and
  CLS ≤ 0.1.

## 7. Risks & Assumptions

- **RISK-001**: An incorrect program migration can hide legitimate offerings
  or disrupt enrollment. Preserve all existing visibility by default and
  explicitly verify the one data record before changing it.
- **RISK-002**: A confirmation proof could become a bearer credential. Limit
  it to registration confirmation, use a 10-minute expiry, keep it out of
  URLs, return no personal data from verification, and clear it after use.
- **RISK-003**: Shared color changes can regress other routes or themes. Run
  axe and visual checks for both themes on every affected surface.
- **RISK-004**: Lighthouse results vary by machine and network. Keep the
  production setup fixed, run three times, report the median and configuration,
  and distinguish measured results from targets.
- **RISK-005**: No authorized test account was available during the audit.
  Verify admin visibility controls through existing API/component tests; mark
  any inaccessible end-to-end admin check as unavailable.
- **ASSUMPTION-001**: The audit-observed test-named 600 toman/month program is
  a non-public test record; its database identity must be confirmed before it
  is unpublished.
- **ASSUMPTION-002**: Existing primary/secondary navigation grouping specified
  in REQ-008 is accepted as the implementation default; no destination is
  removed.
- **ASSUMPTION-003**: A production-like environment can be made available for
  Lighthouse and data reconciliation; if not, report those gates as blocked,
  not passed.

## 8. Related Specifications / Further Reading

- [Phase 14 specification](./spec.md)
- [Phase 14 execution checklist](./tasks.md)
- [Repository Spec Kit workflow](../../plans/plan.md)
- [Project constitution](../constitution.md)
- [Current design system](../../DESIGN.md)
- [Next.js local documentation](../../node_modules/next/dist/docs/)
