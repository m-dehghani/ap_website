# Phase 11: Theme consistency and mobile homepage readability

## Context

The site is Persian-only and uses a shared Pages Router layout, a persisted
light/dark/system preference, and a red-and-warm-charcoal visual system. This
phase refines those existing patterns; it does not redesign the product or add
new claims.

## Functional requirements

- **FR-1 — One active theme:** The selected light, dark, or system preference
  must determine the document color scheme and theme-aware styles consistently
  across public, authentication, student, coach, and admin route groups.
- **FR-2 — Native and custom UI consistency:** Page backgrounds, content
  surfaces, text, borders, form controls, and interactive states must remain
  readable and visually coherent in both themes. Theme selection must remain
  keyboard-accessible and expose its selected state to assistive technology.
- **FR-3 — Stable initial rendering:** Preserve the pre-hydration theme
  initialization and persisted preference behavior; do not introduce a flash
  of the wrong theme or a hydration mismatch.
- **FR-4 — Mobile homepage scanability:** At narrow mobile widths, visitors can
  identify the primary enrollment action and find concise links to essential
  academy information without traversing repeated long-form sections.
- **FR-5 — Responsive content:** Persian headings, body copy, and controls must
  fit their containers without clipped text or horizontal page overflow at
  narrow, medium, and desktop viewport widths.
- **FR-6 — Product truth:** Preserve Persian copy and existing product facts.
  Do not add testimonials, academy claims, prices, or unsupported outcomes.

## Acceptance criteria

1. Selecting day, night, or system applies the corresponding root color scheme;
   system changes are reflected when system preference is selected.
2. Both theme variants follow the explicit root theme attribute, rather than
   independently following the operating-system preference.
3. Representative public, authentication, student, coach, and admin pages
   render under both themes; controls and body surfaces remain readable.
4. The homepage retains an enrollment path and links to essential full pages,
   while its mobile flow is shorter than its desktop flow.
5. Browser checks at 320px, 390px, 768px, and 1440px find no horizontal
   document overflow or clipped homepage headings/actions.
6. Targeted tests and the repository test, typecheck, and lint commands pass.
   Any environment limitation on browser checks is recorded in convergence
   notes.

## Scope and constraints

Authorized product files:

- `src/hooks/useThemePreference.ts`
- `src/pages/_document.tsx`
- `src/components/Layout.tsx`
- `src/components/ui/ThemePreferenceControl.tsx`
- `src/styles/globals.css`
- `src/pages/index.tsx`
- `src/components/Hero.tsx`

Authorized verification files:

- `src/__tests__/hooks/useThemePreference.test.tsx`
- `e2e/theme-mobile.spec.ts`

Only make changes needed for FR-1 through FR-6. Shared theme rules are preferred
over per-route theme patches. Do not modify unrelated routes, authentication
behavior, product data, or other phases.
