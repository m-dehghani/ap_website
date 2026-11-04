# Phase 14 — Public UX trust, accessibility, navigation, and performance

## Context and decisions

The public-site audit found a test-named program priced at 600 toman/month in
the public catalog, raw validation text after an empty registration step,
payment and registration success routes that can show indefinite or unsupported
states, WCAG contrast and accessible-name failures, an overloaded mobile menu,
and empty image sources on the homepage. The development-server transfer and
LCP measurements are diagnostic only and are not production performance
baselines.

Add an explicit public visibility flag for programs. Existing programs remain
public after migration unless an administrator changes their visibility; do
not hide records by matching names or price values. The test-named record
observed during the audit must be reviewed and explicitly unpublished in the
target environment. Do not change any program price.

Preserve the Persian RTL experience and existing design system. Do not invent
academy facts, program details, prices, or promotional claims. Keep the desktop
navigation intact; on mobile, retain every destination while grouping
secondary informational destinations behind an accessible disclosure.

Registration completion must be verified without putting personal data or a
bearer proof in the URL. A short-lived signed proof tied to the created
registration is stored in session storage and verified server-side before the
success page presents confirmation. Missing, invalid, expired, or unverifiable
proof must never produce success copy.

## User stories

- As a prospective student or parent, I only see programs intentionally
  published for public browsing and registration.
- As a prospective student, I receive clear Persian validation and payment
  feedback instead of raw implementation errors or a spinner that never ends.
- As a newly registered student, I see success only after the server verifies
  the registration created by the successful submission.
- As a visitor using assistive technology, I can identify page headings,
  controls, form errors, and navigation states.
- As a visitor on a phone, I can reach every destination through a shorter,
  understandable menu without losing registration, login, or cart access.
- As a visitor with low vision, I can read text and distinguish controls in
  light and dark themes.
- As a visitor on a slow connection, I do not download unnecessary or broken
  homepage imagery.

## Functional requirements

- **REQ-001** — Program visibility: add `Program.isPublic` with a database
  default of `true`; public program retrieval and registration choices include
  only records with both `isActive` and `isPublic` set. Registration API
  rejects an unpublished program. Authorized program administration can edit
  the flag. Existing active records remain visible through migration; never
  infer visibility from name, description, or price.
- **REQ-002** — Test-record cleanup: mark the specific test-named, 600
  toman/month program identified in the audit as not public in the target
  environment after confirming its record identity. Preserve its record and
  price; do not make a blanket price or name-based update.
- **REQ-003** — Registration validation: initialize form values consistently
  and show localized, field-associated Persian errors for empty and malformed
  input. No raw Zod or JavaScript exception text is visible to visitors.
- **REQ-004** — Payment result states: distinguish router initialization from
  a settled missing or unrecognized result. Once routing is ready, every
  missing or unknown result renders a Persian recovery state that does not
  claim payment failure or success and offers safe navigation. Existing
  recognized result messages remain intact.
- **REQ-005** — Verified registration success: the registration API returns a
  short-lived signed proof only on successful creation. The browser stores it
  outside the URL; a server endpoint verifies its signature, purpose, expiry,
  and associated registration before the success page renders confirmation.
  Invalid or absent proofs render a neutral recovery state. Responses and
  URLs expose no new personal data.
- **REQ-006** — Contrast: correct the audit-confirmed contrast failures on the
  homepage, About, programs, coaches, testimonials, news, contact, login, and
  shop surfaces in both themes. Normal text meets 4.5:1; large text and
  meaningful non-text controls meet 3:1 against adjacent colors.
- **REQ-007** — Accessible names and structure: visible labels match control
  accessible names on programs and shop; every page has one descriptive H1
  followed by a logical heading hierarchy. Fix the heading-order findings on
  login and cart and the missing H1 on programs. Preserve visible keyboard
  focus and meaningful error associations.
- **REQ-008** — Mobile navigation: keep all nine public destinations available.
  In the mobile menu, present five primary links—home, programs, coaches,
  shop, and contact—and put About, news, academy honors, and testimonials
  under a keyboard-operable “بیشتر” disclosure. Keep cart, registration, and
  account/login actions distinct. Preserve active-page semantics, focus
  management, Escape behavior, and route-change closing.
- **REQ-009** — Homepage imagery and performance: do not render an image with
  an empty or invalid source. Use existing responsive-image and
  `imageOptimizationProps` patterns where applicable; avoid adding an image
  dependency. In a production build, record three mobile Lighthouse runs and
  their median. Target median LCP at or below 2.5 seconds and CLS at or below
  0.1; record transferred bytes and avoid regressions against the measured
  production baseline.

## Acceptance criteria

1. `/programs` and `/api/programs` omit unpublished programs; registration
   options omit them; `/api/register` rejects an unpublished program with a
   localized client error. Existing active records are public after migration
   until explicitly unpublished. The audited test-named record is explicitly
   unpublished in the target environment without changing its price or
   deleting it.
2. The program admin form and API read, validate, and persist the visibility
   flag. Unauthorized requests cannot change it.
3. Empty and malformed registration submissions show Persian field-level
   errors; no raw exception text appears in the browser.
4. `/shop/payment` displays a settled, actionable state for missing and
   unrecognized result query values after router readiness; known outcomes
   preserve their existing copy and destinations.
5. `/registration-success` confirms completion only after a valid,
   unexpired, server-verified proof references an existing registration.
   Direct navigation, expired proof, invalid proof, and a missing registration
   never display success.
6. Axe reports no WCAG A/AA contrast, accessible-name, or heading violations
   on the audited public routes, in light and dark themes. Any unavoidable
   exception is individually documented with a reason and a follow-up.
7. All nine public destinations remain reachable in the mobile menu; the five
   primary links and “بیشتر” group match REQ-008. Keyboard users can expand,
   collapse, enter, and leave the menu without losing focus.
8. No homepage image renders with an empty or broken source. At 320, 390,
   768, and 1440 CSS pixels, audited routes have no horizontal overflow and
   primary actions remain visible and operable.
9. Targeted tests, complete Vitest suite, typecheck, lint, production build,
   public-route browser checks, and recorded production performance results
   pass. Any blocked production or authenticated-data validation is explicitly
   recorded rather than reported as passed.

## Scope and constraints

Scope is limited to the public program discovery and registration path,
registration/payment result UI, audited public page accessibility and
navigation, homepage imagery, and directly related tests. Program
administration changes are limited to editing the new visibility flag.
Authenticated student/coach/staff dashboard redesign is excluded because the
audit could not access those routes with an authorized account.

Do not redesign unrelated pages, alter program prices, invent copy or
promotional evidence, add dependencies, or modify unrelated database records.
Before changing Next.js code, read the relevant guides under
`node_modules/next/dist/docs/` and follow `AGENTS.md`. Browser checks use the
existing Playwright configuration and `axe-core`; use the established Vitest,
ESLint, TypeScript, Prisma, and build scripts.
