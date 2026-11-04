# Phase 15 tasks

- [ ] **T1 — Lock the route behavior:** Confirm all consumers of
  `/api/students`; add regression tests for access control, errors, and minimal
  response fields. Remove the route if it is unused.
- [ ] **T2 — Close the data exposure:** Remove the public registration-data
  response or require the appropriate shared authorization helper and return
  only a documented, minimal DTO. Verify sensitive registration fields are
  never serialized.
- [ ] **T3 — Remediate audited dependencies:** Trace the full and production
  audit advisory paths; upgrade affected direct dependencies and their
  compatible transitive parents; document any remaining reachability-based
  exception.
- [ ] **T4 — Deploy CSP safely:** Implement report-only CSP using the installed
  Next.js guidance; validate required origins and nonce behavior; enforce only
  after public, auth, admin, payment, and image flows pass.
- [ ] **T5 — Verify and converge:** Run endpoint tests, dependency audits,
  complete tests, typecheck, lint, build, and targeted browser checks. Map
  every FR to changes and evidence in `converge.md`.
