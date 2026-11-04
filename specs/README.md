# Program handoff

## Current state

Phase 0 (specification setup), Phase 1 (unified session helper and coach leak),
and Phase 2 (registration integrity) are complete. Phase 2's implementation,
tests, plan, tasks, and convergence record are in the repository.

## Next phase

Phase 3, **Tuition payment expiry (P0)**, is next. Its specification is still a
draft, and its implementation plan and tasks do not exist. Clarify and review
`specs/003-tuition-expiry/spec.md`, then write that phase's implementation plan
and atomic tasks before changing product code. Phase 2's required validation
gates passed.

## Instructions for the next agent

1. Read `plans/plan.md`, `specs/constitution.md`, and the Phase 3 spec.
2. Follow the program workflow: clarify the spec, write its implementation plan
   and atomic tasks, then implement.
3. Use `specs/002-register-integrity/converge.md` as the Phase 2 handoff/evidence.
4. Follow Phase 3's file scope, tests, and convergence checklist; stop at that
   phase boundary.

Phase specs for 3–10 remain drafts; their implementation plans and tasks have
not yet been written. Do not treat those stubs as approved implementation plans
or as evidence that those phases have been implemented or tested.

The Phase 3 next-step above refers to the original sequential core program.
The separate backlog phases 17–21 have their own Spec Kit artifacts and
convergence evidence:

- Phase 17's signed registration-success proof is restored and automated
  quality gates pass; browser/E2E confirmation remains open.
- Phase 18 implements Zarinpal and Zibal. Pasargad remains disabled and
  deferred pending verifiable official documentation; its database migration
  was not applied to a live database.
- Phase 19 implements the mobile homepage cards, published article detail,
  and complete generated admin-route inventory. Current browser results and
  environment blockers are recorded in its convergence report.
- Phase 20 implements durable media, Aparat URL embeds, and logo management;
  browser and real-deployment persistence/migration checks remain rollout
  items.
- Phase 21 records the requirements-to-tests audit and exact validation
  results. See `specs/021-test-suite-audit/converge.md`.

The original Phase 3–10 sequencing remains independent of this later backlog;
their draft status is unchanged.
