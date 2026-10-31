# Phase 9 implementation plan — Dashboard split and CMS validation

## Scope

Implement only Phase 9 from `plans/plan.md`: preserve the student dashboard's
existing behavior while extracting its profile, enrollment, payment,
attendance, and evaluation sections; apply Zod validation to CMS mutations for
one template resource and two or three additional resources; and establish a
safe homepage cache strategy only when supported by the installed Next.js
documentation and deployment configuration.

Do not refactor all CMS endpoints or modify functionality from earlier phases.
Do not cache personalized responses.

## Approach

1. Treat `specs/constitution.md` and this phase's `spec.md` as requirements.
2. Read installed Next.js 16 documentation for Pages Router data fetching,
   response caching, and standalone deployment before changing page/cache code.
3. Extract semantic dashboard components under `src/components/student/`,
   retain existing form state, handlers, props, and Persian UI, and use safe
   view-model types.
4. Choose testimonials as the CMS template if its current route shape permits
   a focused conversion. Validate mutation bodies with Zod and return the
   established API error shape for invalid input. Apply the same approach to
   only two or three related resources.
5. Add focused regression tests for dashboard section rendering/behavior,
   invalid CMS mutation rejection, and homepage caching if a supported cache
   policy is implemented.
6. Document confirmed deployment/cache evidence and maintain the remaining
   resource checklist in `tasks.md`.
7. Run `npm test`, `npm run typecheck`, and `npm run lint`; attempt browser
   checks for `/` and `/student/dashboard`, recording any server-bind limit.
8. Write `converge.md` mapping each requirement to implementation and
   verification evidence. Stop at Phase 9; do not commit.

## Completion gates

- Dashboard sections are extracted without deleting Phase 7/8 functionality.
- Selected CMS resources reject invalid create/update mutations via Zod.
- Homepage caching is either supported and regression-tested, or explicitly
  left unchanged with evidence explaining why the current deployment does not
  establish safe cache semantics.
- All requested validation commands and browser-check attempts are recorded.
