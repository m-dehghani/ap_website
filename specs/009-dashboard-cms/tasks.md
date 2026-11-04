# Phase 9 tasks — Dashboard split and CMS validation

- [x] Read the installed Next.js documentation for Pages Router rendering,
  cache/revalidation behavior, and standalone deployment; record deployment
  evidence before adding homepage caching.
- [x] Extract the dashboard profile, enrollments, payments, attendance, and
  evaluations into semantic components under `src/components/student/`;
  preserve existing Persian behavior and typed view-model boundaries.
- [x] Add targeted regression coverage for extracted dashboard section
  rendering and retained Phase 7/8 attendance/evaluation content.
- [x] Select testimonials as the CMS mutation template (or record the reason
  for choosing another resource); validate create/update input with Zod and
  test invalid mutation rejection.
- [x] Convert only two or three additional CMS resource APIs to Zod mutation
  validation and test invalid mutation rejection.
- [x] Review homepage caching support against the installed Next.js docs and
  deployment configuration; leave it unchanged because the repository does
  not establish a shared-cache/CDN deployment.
- [x] Run and record `npm test`, `npm run typecheck`, and `npm run lint`.
- [x] Attempt browser checks for `/` and `/student/dashboard`; record results
  and any server-bind limitation.
- [x] Write `converge.md` mapping all Phase 9 requirements to changed files
  and actual validation evidence.

## Remaining CMS resources — not in Phase 9 scope

- [ ] `about-content`
- [ ] `academy-info`
- [ ] `cta-content`
- [ ] `facilities`
- [ ] `feature-stats`
- [ ] `features-content`
- [ ] `hero-achievements`
- [ ] `hero-content`
- [ ] `milestones`
- [ ] `news-articles`
- [ ] `news-categories`
- [ ] `opening-hours`
- [ ] `social-links`
- [ ] `staff-members`
- [ ] `statistics`
- [ ] `success-stories`

Testimonials are the intended template resource; if converted, they are
intentionally excluded from this remaining-resource checklist.
