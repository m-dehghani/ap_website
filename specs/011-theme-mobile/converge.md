# Phase 11 convergence

## Requirement-to-diff mapping

| Requirement | Implementation evidence | Verification |
|---|---|---|
| FR-1: One active theme across route groups | `src/styles/globals.css` defines shared light/dark surface tokens and makes Tailwind's `dark:` variant follow `data-theme`, the root preference attribute. Existing `src/hooks/useThemePreference.ts` and `src/pages/_document.tsx` were reviewed and retained: the hook applies stored/system changes and the before-interactive script initializes the root before hydration. | `npm test` passed 221 tests; production build passed. Browser route test was added, but could not render any route because the local server could not bind. |
| FR-2: Readable native/custom UI and accessible theme selection | Global variables drive root surfaces, headings, scrollbars, and existing dark surface rules. `src/components/ui/ThemePreferenceControl.tsx` keeps its named group and `aria-pressed` states and gives each choice a 44px minimum height. | Hook tests passed. A Playwright test for theme selection, accessible state, and target height was added and discovered, but execution was blocked before navigation. |
| FR-3: Stable initial rendering | The existing `_document.tsx` pre-hydration theme initializer and meta color-scheme support remain unchanged; no client-only theme markup was introduced. | Source review and production build passed. A rendered hydration/flash check could not run because no local server could start. |
| FR-4: Concise mobile homepage with enrollment | `src/pages/index.tsx` keeps desktop detail sections at `md` and adds a Persian mobile navigation summary linking to programs, coaches, news, about, and registration. The register link remains a direct primary action. `src/components/Hero.tsx` reduces mobile hero height and hides its repeated news panel until larger screens. | A Playwright test checks mobile links at 320px and 390px and checks all listed widths; browser execution was blocked before render. No academy claims or testimonials were added. |
| FR-5: Responsive text and no horizontal clipping | `src/components/Hero.tsx` uses smaller mobile sizing/spacing; `src/styles/globals.css` wraps the mobile hero heading and removes body-level `overflow-x: hidden` so overflow is not concealed. | `npm run typecheck`, `npm run lint`, and production build passed. The browser test includes document-width and heading-bound checks at 320px, 390px, 768px, and 1440px, but actual measurements remain unavailable. |
| FR-6: Preserve Persian product truth | New navigation labels and summaries are Persian route descriptions only; existing factual homepage content was not rewritten. | Diff review against the phase spec; no new testimonials, prices, or promotional claims. |

## Verification results

- `npx.cmd vitest run src/__tests__/hooks/useThemePreference.test.tsx`:
  passed, 4 tests.
- `npm test`: passed, 40 files / 221 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with 0 errors and 379 warnings in unchanged repository/tool files (including `.claude/skills/impeccable/scripts/live-browser.js` and `vitest.setup.tsx`); no warnings were reported for changed files.
- `npm run build`: passed; Next.js compiled and generated route data.
- `npx.cmd playwright test --list e2e/theme-mobile.spec.ts`: passed; 5
  browser tests discovered.
- `npx.cmd playwright test e2e/theme-mobile.spec.ts --project=chromium
  --workers=1 --retries=0 --timeout=10000`: 5 tests attempted, all blocked
  before page load with `net::ERR_CONNECTION_REFUSED` at
  `http://localhost:3000/`.
- `npm run dev` could not start: binding to both `0.0.0.0:3000` and
  `127.0.0.1:3000` returned `EACCES`. No committed visual-regression fixture
  was present to substitute for a live render. Thus light/dark screenshots,
  actual overflow measurements, and authenticated student/coach/admin page
  rendering were not verified in this environment.

## Scope and deviations

Changed only the authorized theme/homepage files, targeted tests, and the four
phase artifacts. `Layout.tsx`, `_document.tsx`, and `useThemePreference.ts`
required no product-code change after inspection; shared styles and the
existing initializer remain their route-wide mechanism. No branch changes,
commits, or work on another phase.
