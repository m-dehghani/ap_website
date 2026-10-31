# Phase 10 tasks

- [x] Confirm the current branch is based on Phase 9 and record a clean initial
      working tree.
- [x] Search application source for `stripe` and `micro`; remove either
      dependency only if it has no source imports.
- [x] Add failing API tests for crawler missing configuration, upstream
      timeout propagation, generic error responses, and absence of generated
      engagement values.
- [x] Add failing API tests for login and registration 429 behavior and a
      normal request below the threshold.
- [x] Implement the crawler empty response, timeout, non-leaking errors, and
      removal of synthetic engagement metrics.
- [x] Implement bounded in-memory login and registration rate limiting with
      explicit retry semantics.
- [x] Correct `docs/application.md` and `PRODUCT.md` to reflect product and
      architecture decisions without `/en` claims.
- [x] Remove confirmed-unused dependencies using npm and update the lockfile.
- [x] Run focused API tests, the complete Vitest suite, typecheck, and lint;
      record actual results and limitations in `converge.md`.
- [x] Build the production application and attempt a local production-server
      smoke check; record any environment limitation.
- [x] Review the final diff against this plan; leave all changes uncommitted.
