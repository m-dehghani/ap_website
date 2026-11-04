# Implementation plan: Phase 11

## Approach

Keep the incumbent Persian-first AP Academy visual language and shared
document/layout. Make the document's selected theme attribute the source of
truth for global and Tailwind dark styles, preserving the existing early
initialization and preference control. Reduce the small-screen homepage to the
existing hero/enrollment content plus a compact set of links to full
information pages; retain detailed sections at larger breakpoints. Use browser
checks to inspect shared rendering across route groups and representative
widths.

## Chosen files

Product scope:

- `src/hooks/useThemePreference.ts` — preference persistence and system-change
  behavior; change only if targeted tests show a defect.
- `src/pages/_document.tsx` — existing pre-hydration theme setup; preserve it
  unless verification demonstrates a necessary correction.
- `src/components/Layout.tsx` — shared route shell and header/footer theme
  surfaces; change only if the shared contract requires it.
- `src/components/ui/ThemePreferenceControl.tsx` — accessible control sizing
  and selected-state affordance.
- `src/styles/globals.css` — shared theme variant, semantic surface behavior,
  responsive safeguards, and overflow fixes justified by checks.
- `src/pages/index.tsx` — concise mobile homepage links and responsive
  composition.
- `src/components/Hero.tsx` — responsive hero sizing/type only where required.

Verification scope:

- `src/__tests__/hooks/useThemePreference.test.tsx`
- `e2e/theme-mobile.spec.ts`

The phase artifacts and `specs/011-theme-mobile/converge.md` are also in scope.
Any required extra file must be a directly necessary, tiny fix and be explained
in convergence notes before proceeding.

## Atomic tasks

1. Add targeted preference tests for stored choices, system preference changes,
   and root theme application; run them to establish the behavior under test.
2. Add a browser regression test for explicit theme rendering and responsive
   homepage enrollment/link visibility at the specified viewport sizes.
3. Make global theme-aware styles follow the root preference consistently;
   retain the pre-hydration initializer and native color-scheme support.
4. Ensure the visible theme selector has a clear selected state and usable
   touch/keyboard targets.
5. Add a compact Persian mobile homepage path to enrollment and full
   information pages; make the hero and text fit narrow screens while
   preserving desktop sections and product truth.
6. Run targeted tests, full tests, typecheck, and lint; run browser checks for
   public/auth/student/coach/admin route groups in both themes and homepage
   widths where the environment permits.
7. Review the final diff against FR-1 through FR-6 and record actual results
   and limitations in `converge.md`.
