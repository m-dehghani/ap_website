# Phase 11 convergence

## Requirement-to-diff mapping

| Requirement | Implementation evidence | Verification |
|---|---|---|
| FR-1: One active theme across route groups | `src/styles/globals.css` defines shared light/dark surface tokens and makes Tailwind's `dark:` variant follow `data-theme`. The audit found the light root advertised `color-scheme: light dark`, allowing native controls to follow the OS despite an explicit light selection. The root now defaults to light; `src/hooks/useThemePreference.ts` and the `_document.tsx` before-interactive initializer both apply the resolved root color scheme. | Targeted hook tests and `npm test` pass. The Playwright assertion for computed root color scheme was added, but browser execution was blocked before navigation. |
| FR-2: Readable native/custom UI and accessible theme selection | Global variables drive root surfaces, headings, scrollbars, form controls, and existing dark surface rules. `src/components/ui/ThemePreferenceControl.tsx` keeps its named group and `aria-pressed` states and gives each choice a 44px minimum height. | Hook tests pass. The Playwright test for theme selection, accessible state, and target height is discovered, but execution was blocked before navigation; rendered contrast is therefore unverified. |
| FR-3: Stable initial rendering | `_document.tsx` applies the stored/system-resolved data attribute and color scheme before hydration; the hook keeps persisted preferences and system-change handling. | Source review and production build passed. A rendered hydration/flash check could not run because the local server could not start. |
| FR-4: Concise mobile homepage with enrollment | `src/pages/index.tsx` keeps desktop detail sections at `md` and adds a Persian mobile navigation summary linking to programs, coaches, news, about, and registration. The register link remains a direct primary action. `src/components/Hero.tsx` reduces mobile hero height and hides its repeated news panel until larger screens. | A Playwright test checks mobile links at 320px and 390px and checks all listed widths; browser execution was blocked before render. No academy claims or testimonials were added. |
| FR-5: Responsive text and no horizontal clipping | `src/components/Hero.tsx` uses smaller mobile sizing/spacing; `src/styles/globals.css` wraps the mobile hero heading and removes body-level `overflow-x: hidden` so overflow is not concealed. | Typecheck, lint, and production build passed. The browser test includes document-width and heading-bound checks at 320px, 390px, 768px, and 1440px, but actual measurements remain unavailable. |
| FR-6: Preserve Persian product truth | New navigation labels and summaries are Persian route descriptions only; existing factual homepage content was not rewritten. | Diff review against the phase spec; no new testimonials, prices, or unsupported outcomes. |

## Audit follow-up

The explicit-light native color-scheme mismatch was the meaningful implementation
gap found in the phase audit. It is fixed in the shared root/hook/initializer
path and guarded by hook and browser assertions. The protected-route browser
cases currently verify their authentication redirect rather than rendering
authenticated student, coach, and admin content; those route-group visuals
remain unverified in this environment.

## Verification results

- `npx.cmd vitest run src/__tests__/hooks/useThemePreference.test.tsx`:
  passed, 4 tests.
- `npm test`: passed, 48 files / 248 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with 0 errors and 379 warnings in unchanged
  repository/tool files; no warnings were reported for changed files.
- `npm run build`: passed; Next.js compiled and generated route data.
- `npx.cmd playwright test --list e2e/theme-mobile.spec.ts`: passed; 5
  browser tests discovered.
- `npx.cmd playwright test e2e/theme-mobile.spec.ts --project=chromium
  --workers=1 --retries=0 --timeout=10000`: 5 tests attempted, all blocked
  before page load with `net::ERR_CONNECTION_REFUSED` at
  `http://localhost:3000/`.
- `npm run dev -- --hostname 127.0.0.1` could not start because binding to
  `127.0.0.1:3000` returned `EACCES`. The bundled detector also requires an
  active CDP browser target, which was unavailable. No committed
  visual-regression fixture was present to substitute for a live render.
  Therefore theme screenshots, actual overflow measurements, and authenticated
  student/coach/admin page rendering remain unverified.

## Scope and deviations

The audit correction changed only authorized theme files, targeted tests, and
this phase's convergence record. `Layout.tsx` needed no change; shared styles,
the root preference attribute, and the early initializer remain the route-wide
mechanism. No unrelated phase files were changed.
