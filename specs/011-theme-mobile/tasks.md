# Phase 11 task checklist

- [x] **T1 — Add preference regression coverage:** Cover explicit theme
  selection, system preference changes, and applied root state in
  `src/__tests__/hooks/useThemePreference.test.tsx`; run the focused test.
- [x] **T2 — Add browser acceptance coverage:** In
  `e2e/theme-mobile.spec.ts`, verify light/dark page rendering and homepage
  enrollment/link visibility plus overflow at 320px, 390px, 768px, and 1440px.
- [x] **T3 — Unify theme styling:** Make root theme selection control shared
  light/dark and native UI styles in the authorized global/theme files without
  regressing early initialization.
- [x] **T4 — Preserve accessible controls:** Keep the preference control
  keyboard-operable, named, and stateful, with touch-sized options.
- [x] **T5 — Shorten mobile homepage flow:** Keep the existing enrollment action
  prominent, add concise links to full information pages, and fit hero content
  at narrow widths without changing factual copy.
- [x] **T6 — Verify route groups and quality gates:** Exercise public, auth,
  student, coach, and admin pages in both themes; run `npm test`,
  `npm run typecheck`, and `npm run lint`; capture browser limitations.
- [x] **T7 — Converge phase:** Map each functional requirement to its diff and
  actual verification in `converge.md`; confirm no out-of-phase changes.
