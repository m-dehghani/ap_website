# Phase 3 convergence — Tuition payment expiry

## Requirements checklist

- [x] Tuition checkout payments persist a 15-minute `expiresAt`; the shared
      `CHECKOUT_TTL_MS` is also used for shop checkout orders.
- [x] The migration backfills expiry for existing pending Zarinpal payments
      based on `createdAt`.
- [x] Checkout initialization marks expired pending payments `FAILED` before
      checking for an active checkout, so students can retry.
- [x] Callback verification re-reads current payment state and routes expired,
      verified payments to `REFUND_REQUIRED` without crediting registration
      balances. This also handles a retry that already marked the old payment
      `FAILED`.
- [x] Timely verified payments retain the existing completion and tuition
      credit behavior; cancelled and overpaid registrations remain ineligible.

## Validation evidence

- Targeted checkout and callback tests: passed, 2 files / 7 tests.
- Full test suite: passed, 22 files / 117 tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed with existing warnings; targeted ESLint on all changed
  TypeScript files passed without warnings.
- `npx prisma generate`: passed against the updated schema.
- `git diff --check`: passed.
- Browser verification was not applicable; this phase changes payment APIs
  and checkout persistence, not UI.

## Scope and deviations

Changes are limited to tuition checkout expiry, the shared shop/tuition TTL,
the Prisma schema and migration, tests, and Phase 3 artifacts. No Zarinpal
refund API or currency conversion changes were introduced.
