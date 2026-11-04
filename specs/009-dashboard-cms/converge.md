# Phase 9 convergence — Dashboard split and CMS validation

## Requirement-to-evidence mapping

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| Split the student dashboard into profile, enrollments, payments, attendance, and evaluations without changing behavior. | `src/components/student/ProfileSection.tsx`, `EnrollmentsSection.tsx`, `PaymentsSection.tsx`, `AttendanceSection.tsx`, and `EvaluationsSection.tsx`, composed in `src/pages/student/dashboard.tsx`. | `src/__tests__/pages/student/dashboard-ui.test.tsx` verifies section headings, profile value, evaluation/attendance content, and pending-payment cancellation behavior. `src/__tests__/pages/student/dashboard.test.ts` verifies attendance/evaluation data remains scoped and serialized for the signed-in student. |
| Preserve view-model safety and Phase 7/8 functionality. | Components use the student view-model types from `src/types/viewModels/student.ts`; dashboard server selection and serialization were retained. | `npm run typecheck` passed; the dashboard SSR and UI tests passed. |
| Validate CMS mutations with Zod using one template and two or three additional resources. | `src/lib/validation/cmsContent.ts` defines create/update schemas. Testimonials is the template; facilities and statistics are the two additional resources. Both POST and PUT handlers validate before writes. Other CMS resources were left unchanged. | `src/__tests__/pages/api/admin/content-validation.test.ts` verifies invalid testimonials/facilities/statistics creates and invalid testimonial update return 400 without writes. |
| Establish an appropriate homepage cache strategy without caching personalized data. | Homepage rendering was left unchanged in `src/pages/index.tsx`; the student dashboard also remains uncached. | Reviewed installed `node_modules/next/dist/docs/02-pages/03-building-your-application/03-data-fetching/03-get-server-side-props.md` and `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`. The repo uses `output: 'standalone'` and `next start` but identifies no CDN/reverse proxy. Because no shared cache is configured or verifiable, no cache header/ISR behavior was added; deployment must confirm cache support before enabling one. |
| Browser-check `/` and `/student/dashboard`. | Attempted Playwright navigation to both routes. | `next dev --webpack --hostname 127.0.0.1 --port 3000` failed with `listen EACCES`; both browser navigations then returned `ERR_CONNECTION_REFUSED`. Browser rendering could not be verified in this environment. |
| Run requested gates. | Full gates were rerun after parent review changes. | `npm test`: 39 files / 211 tests passed. `npm run typecheck`: passed. `npm run lint`: exited 0 with repository warnings. `git diff --check`: passed. |

## Scope and deviations

- Only Phase 9 product code and tests were changed. No changes were made to
  unrelated CMS resources or later-phase work.
- Homepage caching remains unchanged because the repository does not establish
  a shared caching layer. A cache policy should be selected only after the
  production proxy/CDN behavior is confirmed.
- The remaining CMS resources are listed in `tasks.md` and intentionally
  remain unchecked for later phases.
- No commit was created.
