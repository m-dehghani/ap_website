# Phase 4 atomic tasks — Shop reservation consistency

- [x] **Harden the shared reservation release primitive**
  - Reject order items without a variant instead of silently skipping them.
  - Retain the conditional `reserved >= quantity` update and throw on mismatch.
  - Add focused tests for missing variants and insufficient reserved quantity.

- [x] **Verify and close every reservation release path**
  - Ensure checkout-time and scheduled expiry cleanup transition the order
    before releasing within the same transaction.
  - Ensure request-payment failure, customer cancellation, and gateway failure
    release only while the order remains `PENDING_PAYMENT`.
  - Ensure a verified late payment transitions to `REFUND_REQUIRED`, releases
    the reservation once, and never decrements stock.
  - Add callback tests for cancellation, gateway failure, late expiry payment,
    and duplicate/terminal callbacks.

- [x] **Run phase validation and document convergence**
  - Run the focused reservation tests.
  - Run `npm test`, `npm run typecheck`, and `npm run lint`.
  - Map each Phase 4 requirement to its implementation and validation in
    `converge.md`, including any deviations or limitations.
