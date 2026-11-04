# AP Academy correctness and operations constitution

These principles apply to every phase in the program described by
[`plans/plan.md`](../plans/plan.md).

## Non-negotiable principles

- Preserve the existing Persian user experience. Do not invent academy claims,
  prices, or testimonials.
- Never return password hashes or unused secrets in page props or JSON.
- Keep shop amounts in toman in the database; convert to rial only at Zarinpal.
  Tuition `Payment.amount` remains in rial until a dedicated money-unification
  specification. Document both conventions in `docs/application.md`.
- Reserved stock must never be negative. Available stock is
  `max(stock - reserved, 0)`.
- Keep coaches in the `coaches` table and students, admins, and shop managers
  in `users`. Use shared session helpers rather than one-off JWT decoding.
- Re-read roles from the database on every request. A JWT role is only a hint.
- The product is Persian-only. Do not add English UI or retain documentation
  that promises `/en` routing.
- Refunds are handled by staff outside the app. Set `REFUND_REQUIRED` and
  provide a queue; never call Zarinpal refund APIs.
- Prefer Zod validation for every mutating API and `select` over fetching whole
  rows with `include`.

## Locked product decisions

- Preserve dual identity tables; add `getSession()` and `requireRole()` in
  `src/lib/auth.ts`.
- Provide an admin refund queue; staff perform refunds outside the application.
- Keep the locale Persian-only and correct `PRODUCT.md` and
  `docs/application.md`.
- Program delivery covers hardening and academy operations (attendance and
  evaluations), contact inbox, tuition expiry, and CMS/auth cleanup.

## Program change control

- Do not expand a phase's scope. Put new ideas on the backlog in
  `plans/plan.md`.
- Before implementation, each phase needs an agreed specification, an
  implementation plan, and atomic, verifiable tasks.
- Stop at the phase boundary. Compare the diff against the phase requirements
  and record deviations in that phase's convergence notes.
