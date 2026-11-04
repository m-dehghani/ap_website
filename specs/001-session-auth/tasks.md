# Phase 1 implementation tasks

- [x] Implement and type the shared session resolver, optional helper, required
      session guard, and role guard in `src/lib/auth.ts`.
- [x] Refactor the existing student, admin, shop-manager, staff, and optional
      account authorization helpers to use shared session resolution while
      preserving their caller-facing results and HTTP response shapes.
- [x] Update admin, student, and staff-notifications server-side authorization
      to use current database-backed sessions and enforce the expected roles.
- [x] Update `/api/auth/me` to use the shared session and preserve its account
      and coach response payloads.
- [x] Update optional student identity lookup for shop checkout to use the
      shared optional-session helper.
- [x] Update coach dashboard authorization and select only public fields used
      by the page; serialize its scheduled session dates.
- [x] Add auth helper tests for student, admin, shop manager, coach, forged
      role claims, invalid/expired tokens, and legacy authorization outcomes.
- [x] Add coach dashboard GSSP test asserting password is absent and selected
      props are serializable.
- [x] Run targeted tests, full required test/typecheck/lint gates, and review
      the diff against the spec.
- [x] Write `converge.md` documenting each success criterion and any deviation.
