# Phase 2 implementation tasks

- [x] Clarify the spec: set the password minimum to 12, use 409 for capacity
      conflicts, and document serializable retry behavior.
- [x] Update public registration to perform identity, program, eligibility,
      capacity, account, and registration work in one serializable transaction.
- [x] Map duplicate unique constraints and serialization conflicts to the
      documented 409 responses.
- [x] Align the registration page's validation and helper copy with the
      12-character minimum.
- [x] Align student password-change validation with the same minimum.
- [x] Add registration tests for user/coach duplicate conflicts, capacity
      behavior, transaction isolation, and concurrent capacity-one requests.
- [x] Add a password-change minimum validation test.
- [x] Run targeted tests and all required test, typecheck, and lint gates.
- [x] Attempt browser verification; local Next.js server startup was denied
      with `EACCES` on the default and alternate loopback ports.
- [x] Review the final diff against the Phase 2 requirements and write
      `converge.md`.
