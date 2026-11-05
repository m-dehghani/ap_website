AP Academy correctness and ops program (Spec-Driven)

Process (GitHub Spec Kit)

Follow GitHub Spec Kit agentically. Do not start coding a phase until that phase’s spec, plan, and tasks exist and the previous phase’s tests pass.

Once per program

Write specs/constitution.md (principles below).

For each phase: spec.md (what/why) → clarify → plan.md (how, files, data) → tasks.md (atomic, verifiable) → implement → converge (diff vs spec).

Put artifacts in specs/NNN-short-name/ (example: specs/001-session-auth/).

After each phase: npm test, npm run typecheck, and npm run lint. Browser-verify any UI you touch.

Constitution (non-negotiable)

Preserve existing Persian UX; do not invent academy claims, prices, or testimonials.

Never return password hashes (or unused secrets) in page props or JSON.

Money: shop amounts stay toman in DB and convert to rial only at Zarinpal; tuition Payment.amount stays rial until a dedicated money-unification spec (out of this program unless a phase needs it). Document both in docs/application.md.

Stock: reserved must never go negative; available stock is max(stock - reserved, 0).

Auth: Coaches stay on coaches; students/admins/shop managers stay on users. Every request uses one helper, never a one-off JWT decode.

Roles are re-read from the DB on every request; JWT role is a hint only.

No new English UI in this program; remove or rewrite docs that claim /en routing.

Refunds are staff-handled; set REFUND_REQUIRED and surface a queue. Do not call Zarinpal refund APIs.

Prefer Zod on every mutating API. Prefer select over include of whole rows.

Do not expand scope mid-phase. Add new ideas to the backlog in `plans/plan.md`.

Locked product decisions

Identity: keep dual tables; add getSession() / requireRole() in src/lib/auth.ts.

Refunds: admin queue only.

Locale: Persian-only; fix PRODUCT.md, docs/application.md.

Delivery: hardening and academy ops (attendance, evaluations), contact inbox, tuition expiry, CMS/auth cleanup.

flowchart TD
constitution[constitution.md]
p1[001 session-auth]
p2[002 register-integrity]
p3[003 tuition-expiry]
p4[004 shop-reservations]
p5[005 admin-money-and-refunds]
p6[006 contact-inbox]
p7[007 attendance]
p8[008 evaluations]
p9[009 dashboard-and-cms]
p10[010 docs-crawler-hygiene]
constitution --> p1 --> p2 --> p3 --> p4 --> p5
p5 --> p6 --> p7 --> p8 --> p9 --> p10

Phase 0 — Spec artifacts (no product code)

Agent instruction: Create the constitution and empty phase folders with spec.md stubs listing user stories, FRs, and success criteria from this plan. Do not change src/ yet. Stop for review.

Phase 1 — Unified session helper and coach leak (P0)

Why: Coach GSSP dumps the full Prisma row including password. Auth helpers are copy-pasted and diverge.

Spec stories

Staff/student/shop APIs and pages obtain the same session shape.

Coach dashboard never exposes password.

A forged JWT role cannot elevate if the DB role differs.

Plan / files

Extend src/lib/auth.ts: getSession(req) → { id, role, source: 'user' | 'coach' } | null; requireSession, requireRole. Reuse jwtVerify + DB lookups already in authorizeStudent / authorizeAdmin / authorizeShopManager / authorizeStaff.

Replace those four functions to wrap the helper (keep the same HTTP status JSON so clients do not break).

Rewrite src/pages/coach/dashboard.tsx getServerSideProps: use helper; select public coach fields only (no password); serialize Dates like the student dashboard.

Align src/pages/admin/index.tsx, src/pages/student/dashboard.tsx, src/pages/staff/notifications.tsx, src/pages/api/auth/me.ts, src/pages/api/shop/orders/index.ts (getOptionalStudentId should call the shared optional-session helper).

Tests: extend src/tests/lib/auth.test.ts. Add a coach dashboard GSSP test that asserts password is absent from props.

Done when: rg password on coach GSSP is gone; all authorize\* paths go through getSession; tests cover student/admin/coach/shop_manager and expired JWT.

Phase 2 — Registration integrity (P0)

Why: Public register counts capacity then creates the user outside a transaction. Password min length is 6.

Spec stories

Concurrent public registrations cannot exceed program.maxStudents.

Duplicate email/phone still 409, including coach collisions.

New passwords meet a documented policy (recommend 12+, matching seed).

Plan / files

Change src/pages/api/register.ts to match src/pages/api/student/registrations.ts: serializable transaction; recount inside; unique-constraint handling P2002.

Align Zod password min with student password-change rules if they exist; update the register page validation to match.

Tests: two concurrent registers against maxStudents: 1 → one 201, one 400/409.

Done when: public and student enrollment share the same capacity invariant; password policy is consistent.

Phase 3 — Tuition payment expiry (P0)

Why: A PENDING Zarinpal tuition checkout blocks the student forever if the callback never runs. Shop already expires in 15 minutes.

Spec stories

Pending tuition payments expire after 15 minutes (reuse shop window unless you extract a constant).

After expiry, a new checkout is allowed.

Callback after expiry with a successful verify sets REFUND_REQUIRED (same idea as shop).

Plan / files

src/pages/api/student/payments/index.ts: treat expired PENDING as failed (or add expiresAt on Payment via Prisma migration if a timestamp is cleaner than encoding in providerReference).

Prefer a real expiresAt DateTime? on Payment + migration; update src/pages/api/student/payments/callback.ts accordingly.

Shared constant with shop (e.g. src/lib/payments.ts CHECKOUT_TTL_MS).

Tests: pending older than TTL does not 409; late success → REFUND_REQUIRED.

Done when: student can retry after 15 minutes; money cannot be applied to a cancelled/overpaid registration.

Phase 4 — Shop reservation consistency (P0)

Why: Checkout cancel/fail decrements reserved without a floor; releaseExpiredShopOrders already uses gte.

Spec stories

Expired, cancelled, and payment-failed orders release stock exactly once.

reserved never goes negative.

Late paid-after-expiry still becomes REFUND_REQUIRED and does not decrement stock.

Plan / files

Extract one releaseOrderReservation(tx, order) used by src/pages/api/shop/orders/index.ts, src/pages/api/shop/orders/callback.ts, and src/lib/shop.ts.

Use updateMany with reserved: { gte: qty } like releaseExpiredShopOrders.

Tests for cancel, gateway fail, expiry, double-callback.

Done when: all reservation paths share one helper; mismatch throws rather than corrupting counts.

Phase 5 — Admin money validation and refund queue (P0 + ops)

Why: PUT /api/admin/students/[id] writes raw amounts/status. REFUND_REQUIRED has no UI.

Spec stories

Admins cannot set paidAmount above totalAmount or illegal status transitions without an explicit reason.

Staff see a queue of shop orders and tuition payments with REFUND_REQUIRED.

Staff can mark an item REFUNDED after handling it outside the app (bank/Zarinpal panel). No gateway refund call.

Plan / files

Zod on src/pages/api/admin/students/[id].ts and session POST/PUT in src/pages/api/admin/sessions/index.ts / [id].ts.

New pages: /admin/refunds + /api/admin/refunds (authorizeAdmin). List Payment.status === 'REFUND_REQUIRED' and ShopOrder.status === 'REFUND_REQUIRED'. PATCH to REFUNDED (add status if missing; shop may need a new status string).

Link from src/pages/admin/index.tsx.

Tests for validation and queue transitions.

Done when: invalid money PUT returns 400; refund queue is usable end-to-end in the browser.

Phase 6 — Contact inbox (missing feature, in scope)

Why: ContactMessage exists; src/pages/contact.tsx only opens mailto:.

Spec stories

Public contact form POSTs to /api/contact (Zod, rate-limit if Phase 10 not done yet: at least honeypot or IP-unaware short-circuit).

Admin /admin/messages lists NEW/READ/ANSWERED.

Keep mailto as a fallback only if the API fails (optional).

Plan / files

API + admin list/detail. Do not log message bodies in console.error.

Tests for validation and authz (unauthenticated POST ok; GET admin-only).

Done when: submitting contact creates a ContactMessage; admin can mark read.

Phase 7 — Attendance (academy ops)

Why: Model exists; nothing creates rows. Admin sessions only display them.

Spec stories

Coach (own program sessions) and admin can mark PRESENT/ABSENT/LATE/EXCUSED per enrolled student.

Student dashboard shows their attendance history.

Cannot mark attendance for users not registered in that session’s program.

Plan / files

POST/PUT /api/admin/sessions/[id]/attendance (admin) and /api/coach/sessions/[id]/attendance (coach scoped by coachId).

UI on src/pages/admin/sessions/[id] (or index expand) and coach dashboard.

Student dashboard section reading Attendance in GSSP select.

Unique (userId, sessionId) already in schema.

Done when: coach can save a roster; student sees it; unauthorized coach gets 403.

Phase 8 — Evaluations (academy ops)

Why: Evaluation is schema-only (seed only deletes).

Spec stories

Coach of the student’s program (or admin) creates a 1–10 scores record with notes.

Student can read their own evaluations; cannot write them.

Plan / files

/api/coach/evaluations and /api/admin/evaluations; student GET on dashboard GSSP.

Zod: scores 1–10.

Coach dashboard list + form; student read-only cards.

Done when: one evaluation round-trips coach → DB → student UI.

Phase 9 — Dashboard split and CMS duplication (maintainability)

Why: src/pages/student/dashboard.tsx is ~1100 lines; CMS APIs are copy-paste without Zod.

Spec stories

Student dashboard composed of section components (profile, enrollments, payments, attendance, evaluations) with unchanged behavior.

Mutating CMS APIs validate with Zod; optional shared createContentHandlers for list/create/update/delete to stop new copy-paste. Do not rewrite every CMS page in one sitting: convert one resource as the template (e.g. testimonials), then 2–3 more if time; leave a checklist in specs/009-.../tasks.md for the rest.

Plan / files

Extract components under src/components/student/.

Homepage: add ISR or Cache-Control on src/pages/index.tsx getServerSideProps (e.g. res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')) so CMS reads are not 12 uncached queries on every hit. Confirm Vercel/standalone behavior before assuming CDN cache.

Done when: student dashboard files are split; testimonials (or chosen resource) use Zod; home sets cache headers; visual check of / and /student/dashboard.

Phase 10 — Docs, crawler, Stripe, rate limit (hygiene)

Why: Docs claim English sub-path i18n that is not in next.config.ts. Crawler uses Math.random and leaks errors. stripe is unused.

Spec stories

Docs match reality: Persian-only, Zarinpal, dual identity, refund queue, attendance/evaluations.

/api/crawler-news: timeout, no error.message to clients, no random likes; if CRAWLER_API_URL missing, return empty news 200 not 500.

Remove unused stripe / micro if nothing imports them (confirm with rg).

Rate-limit /api/auth/login and /api/register (in-memory per instance is acceptable; document multi-instance limitation).

Done when: docs/application.md and PRODUCT.md no longer promise /en; crawler is safe; login is throttled in tests.

Agent operating rules (every phase)

Read specs/constitution.md and that phase’s spec.md before editing.

Touch only files listed in the phase plan unless a type error forces a tiny extra change; record extras in converge notes.

Do not add English UI, Zarinpal refund API, or User-table coach migration.

Prefer existing patterns: getPrisma(), Zod, serializable transactions, formatToman / Persian copy.

Verify: unit tests for APIs; Playwright or browser for UI phases (contact, refunds, attendance, evaluations, student dashboard).

Stop at phase boundary. Converge: checklist of FRs vs git diff.

Suggested later backlog (not this program)

The following proposals do not expand Phases 1–10. Before implementation,
create and review a Spec Kit `spec.md`, clarify its requirements, then create
the phase `plan.md` and atomic `tasks.md` under `specs/NNN-short-name/`. Do not
start product-code changes from this roadmap alone.

Phase 11 — Theme consistency and mobile homepage readability

Why: Day/night theme rendering is inconsistent between pages. The homepage is
too long on mobile, and some typography is oversized or overflows its
components.

Spec stories

- Visitors see consistent colors, contrast, controls, and surfaces in both
  light (day) and dark (night) themes across the site's pages.
- Mobile visitors can scan the homepage, understand the primary actions, and
  read all text without clipping or horizontal overflow.

Plan / candidate files

- Audit theme application and shared tokens in `src/hooks/useThemePreference.ts`,
  `src/pages/_document.tsx`, `src/components/Layout.tsx`, and
  `src/styles/globals.css`; correct affected page and component styles rather
  than adding page-specific theme workarounds.
- Review `src/pages/index.tsx` and its homepage sections. Reduce repeated or
  overly detailed homepage content into concise summaries with links to the
  relevant full pages; retain the primary enrollment action and essential
  information.
- Establish responsive type and spacing rules so headings and body text fit
  their containers at narrow, medium, and desktop widths.

Done when: the theme audit covers every site route and light and dark themes
render consistently across its public, authentication, student, coach, and
admin pages; the homepage has a clearer, shorter mobile reading flow; and
tested viewport sizes have no clipped text or horizontal overflow.

Phase 12 — User profile and CMS image uploads

Why: Profile pictures and page images should be uploaded through the
application instead of requiring externally hosted image URLs.

Spec stories

- Every authenticated account holder can upload or replace their own profile
  picture; users cannot change another account's picture through the ordinary
  profile flow.
- Authorized content editors can upload images used by CMS-managed pages and
  content, including the shop where image URLs are currently required.

Plan / candidate files

- Inspect and extend `src/pages/api/student/profile.ts` and the profile UI in
  `src/pages/student/dashboard.tsx`; include coach and other account profile
  surfaces where those roles can manage a profile.
- Add a shared, authenticated upload/storage flow and connect it to existing
  CMS image fields and forms, including
  `src/pages/admin/content/success-stories/`,
  `src/pages/admin/content/testimonials/`, and shop product management.
- Update `prisma/schema.prisma` and add a migration only if the existing
  profile/content models cannot store the resulting asset reference.
- In the phase spec, choose the durable storage provider and explicit upload
  limits. Require server-side file type and size validation, authorization,
  safe generated storage keys, and cleanup of replaced assets; do not accept
  arbitrary remote image URLs as an upload substitute.

Done when: users can set and replace only their own profile pictures; authorized
editors can upload and use images on supported pages; invalid or unauthorized
uploads are rejected; and uploaded images remain available after deployment
restarts.

Phase 13 — Academy history, honors, and separate testimonials page

Why: The About page needs the academy's history. The current success-stories
page should focus on academy honors and achievements, while reviews and
experiences should have a separate page.

Spec stories

- Visitors can read a CMS-managed history section on `/about`.
- Visitors can browse academy honors and achievements instead of player
  success stories on the current `/success` page.
- Visitors can read reviews and experiences on a separate `/testimonials`
  page, not in the honors and achievements content.

Plan / candidate files

- Extend `src/pages/about.tsx` and the existing About content management
  surfaces under `src/pages/admin/content/about-content/` for the academy
  history.
- Replace the visitor-facing player success-story content in
  `src/pages/success.tsx` and `src/components/SuccessStories.tsx` with
  academy-wide honors and achievements. Update page metadata and site
  navigation in `src/components/Layout.tsx`.
- Move the reviews/experiences presentation to a dedicated
  `src/pages/testimonials.tsx` page using `src/components/Testimonials.tsx`;
  update its metadata and navigation, and remove that box from `/success`.
- Reuse existing CMS data only when it represents the requested academy
  history or verified honors. If existing models cannot represent that
  content, specify and implement the smallest CMS/schema extension. Do not
  invent academy claims or testimonials.

Done when: `/about` presents editable academy history; `/success` presents
academy honors and achievements rather than player stories; `/testimonials`
contains the reviews/experiences section; navigation and metadata match the new
page purposes; and all three pages pass responsive visual checks.

Other backlog proposals

- Real fa/en message catalogs and Next i18n routing.
- Zarinpal refund API.
- Merge coaches into users.
- Password reset (email/SMS codes exist for profile change; there is still no
  “forgot password” on `/login`).

Newsletter subscriber API (model exists, unused).

Parent-only portal vs current student account.

Session waitlist when maxStudents is full.

Strongly recommended future item (not included in Phases 11–13): add
forgot-password on login, because verification SMS/email is already built for
profile changes. Confirm before assigning it a phase.

Phase 14 — Public UX trust, accessibility, navigation, and performance

Why: The public-site audit found a test-named program visible at a misleading
price, raw registration validation text, incomplete payment/registration
outcome states, WCAG contrast and accessible-name findings, an overlong mobile
menu, and empty homepage image sources.

Spec-driven artifacts:

- `specs/014-public-ux-hardening/spec.md`
- `specs/014-public-ux-hardening/plan.md`
- `specs/014-public-ux-hardening/tasks.md`

Scope includes explicit program publication visibility, Persian form and
transaction feedback, server-verified registration success, targeted
accessibility and heading fixes, mobile navigation grouping, homepage image
source validation, and measured production performance. Preserve all
existing program visibility by default; explicitly unpublish only the
audit-observed test record after confirming its identity. Do not change prices
or invent content. Authenticated dashboard redesign remains out of scope.

Done when: each phase passes its validation gate; the scoped public routes
meet WCAG contrast/name/heading checks in both themes; mobile navigation
preserves every destination; payment and registration outcomes cannot report
unverified success; and production LCP/CLS/transfer measurements and any
environment limitations are recorded in the convergence notes.

Phase 15 — Security findings remediation

Why: The security review confirmed an unauthenticated API exposing full
student registration and family/medical data. Dependency auditing also found
high advisories in the runtime and tooling dependency graph, and the installed
Next.js guidance recommends CSP as defense-in-depth; the current headers do
not include one.

Spec-driven artifacts:

- `specs/015-security-hardening/spec.md`
- `specs/015-security-hardening/plan.md`
- `specs/015-security-hardening/tasks.md`

Scope: remove or tightly authorize and minimize the unused `/api/students`
endpoint; remediate high/critical dependency advisories based on reachability;
and stage a tested CSP using Next.js 16.4.2 guidance. Do not treat the CSP gap
as a confirmed vulnerability, broadly expose data to authenticated users, or
upgrade unrelated dependencies.

Done when: no unauthenticated caller can retrieve student or family data;
dependency audit results have no undocumented high/critical exposure; CSP is
validated against the site's critical flows before enforcement; and tests,
typecheck, lint, build, and convergence evidence pass.

Phase 16 — Audit-driven correctness and quality hardening

Why: A broad code review found card subcomponents dropping supported DOM
attributes, a checkout city-loading effect that can act on stale location
state, an unused repository layer, and persistent lint/test diagnostic debt.
The installed Vercel React guidance and current Next.js Pages Router docs were
used; App Router patterns were excluded.

Spec-driven artifacts:

- `specs/016-audit-quality-hardening/spec.md`
- `specs/016-audit-quality-hardening/plan.md`
- `specs/016-audit-quality-hardening/tasks.md`

Scope: restore card attribute forwarding; make checkout city requests
race-safe; remove the repository layer only if it remains unreferenced or
type the required API; improve active form/view-model typing; and clean up
lint/test diagnostics without suppressions. Existing Phase 14 public UX and
Phase 15 security findings remain owned by those phases.

Done when: card prop and out-of-order checkout regressions are covered;
unused abstractions are removed or typed based on verified callers; tracked
first-party lint warnings are resolved or documented; identified React/Vite
test warnings are eliminated; and tests, typecheck, lint, build, and
convergence evidence pass.

## Additional backlog phases — Registration, payments, content UX, and media

These are roadmap items, not authorization to change product code. Before
implementing any phase, create and review its Spec Kit `spec.md`, resolve the
listed decisions, then write its `plan.md` and atomic `tasks.md` under the
matching `specs/NNN-short-name/` directory. Preserve the existing constitution
and stop at each phase boundary.

**Execution dependencies**

- Phase 17 requires Phase 2 registration integrity and Phase 14's signed
  registration-success proof. Do not close Phase 17 until its proof-flow
  restoration, regression tests, and remaining quality gates pass.
- Phase 18 requires the Phase 3–5 tuition-expiry, shop-reservation, and refund
  invariants to be complete or explicitly revalidated before payment lifecycle
  changes.
- Phase 19 requires Phase 11 mobile behavior and Phase 14 navigation and
  accessibility rules. Phase 20 consumes its news detail route and admin-shell
  invariant.
- Phase 20 requires Phase 12 durable upload/reference handling and Phase 19;
  its storage docs and deployment persistence must be reconciled before media
  implementation.
- Phase 21 runs after Phases 17–20, but each feature phase must add its own
  focused tests and quality gates rather than deferring tests to the audit.

### Phase 17 — Registration CAPTCHA and contact activation

**Status:** In progress; the Phase 14 signed registration-success proof is
restored and focused proof/activation tests, typecheck, changed-file lint, and
production build pass. Full-suite and browser/E2E validation remain open in
`specs/017-registration-activation/converge.md`.

**Why:** Public registration currently has no CAPTCHA or post-registration
contact activation flow. Profile verification already supports email and phone
challenges, but it does not activate a newly registered account.

**User stories**

- As a prospective student, I can register only after the server verifies a
  valid Google reCAPTCHA response.
- As a newly registered user, I can activate the account by verifying either
  the registered email address or the registered mobile number.
- As an administrator, I can trust that unverified accounts cannot use
  protected student functionality.

**Functional requirements**

- **FR-17.1 — CAPTCHA:** Use Google reCAPTCHA. Render its challenge in the
  registration flow and verify the submitted token server-side before creating
  an account. Missing, invalid, expired, or failed verification must reject
  registration with a localized response and create no account. Keep the
  secret server-only; configure credentials outside source control. Use the
  Google reCAPTCHA v2 checkbox unless the phase spec documents a concrete
  accessibility or deployment constraint requiring another Google-supported
  mode.
- **FR-17.2 — Activation policy:** Either successful email verification or
  successful mobile verification is sufficient to activate the account.
  Bind a challenge to the new account, channel, and destination; enforce
  expiry, attempt limits, resend limits, and single-use consumption. Reuse
  `VerificationChallenge` and the existing notification/verification
  patterns where they fit, but do not expose an unauthenticated challenge that
  can verify another user's contact.
- **FR-17.3 — Authorization state:** Define and enforce which registration,
  login, profile, and student API actions are available before activation.
  Unverified users must not gain protected student access; they must retain a
  safe way to complete or resend verification. Preserve existing session,
  registration-capacity, duplicate-contact, and registration-success-proof
  invariants. The convergence report records restoration and focused tests of
  the Phase 14 signed proof flow.
- **FR-17.4 — Data compatibility:** Reuse `User.emailVerifiedAt` and
  `User.phoneVerifiedAt` where sufficient. Add schema changes only if the
  activation state cannot be represented safely by verified-contact fields.
- **FR-17.5 — Abuse and error handling:** Apply appropriate registration and
  verification throttling, return actionable Persian errors, and never log
  challenge codes, CAPTCHA secrets, or verification tokens.
- **FR-17.6 — Deterministic CAPTCHA tests:** Mock Google's verification
  boundary in unit/API tests. Cover accepted, rejected, expired, malformed,
  and unavailable-provider responses without requiring live network access or
  CAPTCHA credentials in CI.

**Plan / candidate files**

- Extend `src/pages/register.tsx` and `src/pages/api/register.ts`; preserve
  the Phase 2 serializable capacity check and duplicate-contact handling.
- Reuse or extend `src/pages/api/student/profile/verification.ts`,
  `src/lib/notifications.ts`, and `prisma/schema.prisma` only where their
  current user-scoped verification model is insufficient for a new account.
- Update the relevant registration/session authorization helper and
  `src/pages/api/auth/me.ts` only after defining the pre-activation access
  policy in the phase spec.
- Preserve and test the Phase 14 proof flow in
  `src/lib/registration-confirmation.ts`,
  `src/pages/api/register/confirmation.ts`, and
  `src/pages/registration-success.tsx` (or approved equivalent files); do not
  represent activation guidance alone as preserving proof.
- Add focused tests alongside `src/__tests__/pages/register.test.tsx`,
  `src/__tests__/pages/api/register.test.ts`, and
  `src/__tests__/pages/api/student/profile-verification.test.ts`.

**Dependencies:** Phase 2 registration integrity and Phase 14's
server-verified registration-success flow (restored; focused tests pass).
Treat reCAPTCHA credentials and email/SMS delivery configuration as deployment
dependencies.

**Done when:** Registration cannot create an account without a server-verified
CAPTCHA; either verified contact activates the account exactly once; expired,
replayed, wrong-account, wrong-channel, and over-limit challenges are rejected;
unverified accounts cannot access protected student features; regression tests
prove the Phase 2 capacity and duplicate-contact invariants remain intact; the
Phase 14 signed registration-success proof is restored and tested; and mocked
CAPTCHA tests and browser checks cover registration, activation, resend, and
recovery states.

### Phase 18 — Admin-configurable Iranian payment gateways

**Status:** Implemented for the clarified scope: Zarinpal and Zibal are
configurable providers; Pasargad is explicitly deferred because its official
product/API contract could not be verified. Automated quality gates pass; the
migration has not been applied to a live database. See
`specs/018-admin-configurable-payment-gateways/converge.md`.

**Why:** Payment routes were hard-coded to Zarinpal. The clarified scope adds
Zibal and provider-specific payment configuration while retaining Zarinpal
and deferring unsupported Pasargad integration.

**User stories**

- As a shopper or student, I can pay through any enabled supported gateway.
- As an administrator, I can configure, enable, disable, and choose the
  default between supported Zarinpal and Zibal gateways without exposing
  credentials to users or browser payloads; Pasargad is clearly marked
  deferred and cannot be configured.
- As an operator, I can diagnose payment outcomes without losing or applying a
  payment twice.

**Functional requirements**

- **FR-18.1 — Gateway adapters:** Keep Zarinpal operational and add Zibal as
  a separate typed adapter behind a shared application contract for checkout
  creation and payment verification. Defer Pasargad until its official
  product/API contract and credential requirements can be verified; do not
  infer an API from the bank name alone.
- **FR-18.2 — Admin configuration:** Add an admin-only gateway configuration
  surface for credentials, enablement, and the default gateway. Allow only
  enabled, fully configured providers at checkout. Encrypt persisted
  credentials at rest with a dedicated deployment-managed
  `PAYMENT_CONFIG_ENCRYPTION_KEY`; never return secret values in HTML, API
  responses, logs, or test output. Admin reads return configured/masked state;
  admins can replace or clear a credential without retrieving its current
  value. Validate mutations with Zod. Do not silently fall back to plaintext
  database storage if the encryption key is missing.
- **FR-18.3 — Payment identity and migration:** Persist the selected provider
  unambiguously for each tuition payment and shop order; preserve existing
  Zarinpal references and pending transactions during migration. Do not
  overload a provider authority/reference with another provider's identifier.
- **FR-18.4 — Payment lifecycle:** Keep amount/currency conversion explicit
  for each provider and preserve the constitution's toman/rial rules. Verify
  provider callbacks server-side against the expected amount and transaction.
  Make success, cancellation, failure, duplicate callback, expiry, late
  success, and refund-required handling idempotent and consistent for both
  tuition and shop orders. Never issue an automatic refund API call.
- **FR-18.5 — Provider mocks and after-payment tests:** Mock outbound provider
  HTTP at the adapter boundary for every configured gateway. Test request
  construction, response parsing, transport/provider errors, invalid
  signatures or references, amount mismatch, and verification failures.
  Exercise the shared post-payment state transitions for every provider:
  completed tuition updates the registration balance exactly once; completed
  shop payment marks the order paid exactly once; cancellation/failure does
  not credit or decrement twice; expired or late verified payment enters
  `REFUND_REQUIRED` and does not apply the payment; repeated callbacks are
  idempotent.
- **FR-18.6 — Test inventory evidence:** Record a provider-by-provider matrix
  of mocked checkout, mocked verification, callback, and post-payment
  assertions in the phase's convergence notes. External sandboxes may be used
  as an additional opt-in check, but unit and integration tests must not
  require live gateway credentials or network access.

**Plan / candidate files**

- Refactor `src/lib/zarinpal.ts` behind a shared payment-provider contract;
  add a dedicated Zibal adapter. Keep Pasargad explicitly unsupported.
- Update `src/pages/api/student/payments/index.ts`,
  `src/pages/api/student/payments/callback.ts`,
  `src/pages/api/shop/orders/index.ts`, and
  `src/pages/api/shop/orders/callback.ts` to dispatch through the persisted
  provider identity.
- Add admin configuration UI/API under `src/pages/admin/` and
  `src/pages/api/admin/`; inspect `src/pages/api/admin/shop/settings.ts` and
  the current settings schema before choosing whether a new model or route is
  needed. Use `src/pages/admin/payment-gateways.tsx` and
  `src/pages/api/admin/payment-gateways.ts` for the gateway management
  surface.
- Update `prisma/schema.prisma`, migrations, payment configuration UI, and
  `docs/application.md` only as required by the approved design.
- Extend `src/__tests__/pages/api/student/payments.test.ts`,
  `src/__tests__/pages/api/student/payment-callback.test.ts`, and
  `src/__tests__/pages/api/shop/orders/callback.test.ts`; add adapter unit
  tests under `src/__tests__/lib/`.

**Dependencies:** Phases 3–5 payment expiry, shop reservation, and refund
queue invariants. Complete or explicitly re-validate those phases before
changing shared payment state transitions.

**Done when:** Every supported provider can be configured and selected
according to admin settings; each has isolated mocked request/verify tests;
the provider-by-provider lifecycle matrix covers checkout through settled
post-payment effects for tuition and shop; migrations preserve pending
Zarinpal payments; all amount/currency and secret-handling rules are
documented; and targeted tests plus typecheck, lint, and relevant E2E checks
pass. Unsupported Pasargad behavior remains disabled and is documented.

### Phase 19 — Mobile homepage cards, article details, and admin shell audit

**Status:** Implementation complete; the latest Chromium route sweep passed all
68 authenticated admin routes. Mobile homepage and missing-article browser
checks returned HTTP 500 because the configured database lacks Phase 20's
media migration column; see `specs/019-news-navigation-admin/converge.md`.

**Why:** Mobile visitors need the homepage store and news cards restored.
News “more/read more” actions must lead to the selected article rather than a
generic page, and the shared admin navigation needs an explicit completeness
check across nested sections.

**User stories**

- As a mobile visitor, I can see and open the homepage store and news cards.
- As a visitor, selecting “بیشتر” or “ادامه مطلب” for a news article opens
  that article's dedicated page.
- As an administrator, I can navigate every admin subsection with the shared
  sidebar and top menu available.

**Functional requirements**

- **FR-19.1 — Mobile homepage:** Restore the existing store/product and news
  cards on the homepage at mobile widths; preserve their desktop behavior and
  existing Persian content. Do not replace missing cards with invented
  products, articles, prices, or claims.
- **FR-19.2 — Article navigation:** Every news-card “more/read more” action
  navigates to `/news/[id]`, using the existing stable `NewsArticle.id` (the
  current model has no slug field). The detail route displays only published
  articles, returns a true not-found state for absent or unpublished content,
  and provides page metadata and a return path to news. Product cards continue
  to link to their existing product detail routes.
- **FR-19.3 — Admin route inventory:** Enumerate every page under
  `src/pages/admin/` and verify authenticated admin pages retain both
  `AdminLayout` navigation elements: sidebar and top menu. Unauthenticated
  access may redirect according to current auth behavior but must not render a
  broken or partially laid-out admin page. Record each route and its outcome;
  do not infer coverage from checking only `/admin`.
- **FR-19.4 — Accessibility and responsiveness:** Keep card links keyboard
  operable and semantically named; verify cards remain visible and usable at
  narrow mobile viewports without horizontal overflow.

**Plan / candidate files**

- Inspect and update homepage sections in `src/pages/index.tsx` and
  `src/components/`; preserve the existing store and news data sources.
- Update `src/pages/news.tsx` and the existing news-card components. Add
  `src/pages/news/[id].tsx` and its data/API query; no article detail route
  currently exists.
- Audit `src/components/AdminLayout.tsx` and every route under
  `src/pages/admin/`; add a route/layout regression test and update
  `e2e/` coverage for representative authenticated deep routes plus the
  complete route-inventory evidence.

**Dependencies:** Phase 11's mobile homepage behavior and Phase 14's
public-navigation/accessibility rules. Phase 20 may add routes but must
preserve the AdminLayout invariant established here.

**Done when:** Store and news cards are present and navigable at 320px and
390px; every news “more/read more” link opens its matching published article;
unpublished and missing article routes do not leak content; every current
admin route is accounted for and authenticated subroutes show both sidebar
and top menu; and focused unit/API/browser checks pass.

### Phase 20 — Product/news video uploads, Aparat integration, and site logo

**Status:** Implementation and automated quality gates are complete. Owner
clarifications limit Aparat support to URLs for videos already uploaded by the
editor, approve the standard Aparat embed without guaranteed muted startup,
and supersede Phase 12 storage with Vercel Blob on Vercel plus configured
durable `UPLOADS_DIR` on other production hosts. Browser verification and
real-deployment persistence/migration checks remain open. The admin payment
browser journey passed; the homepage smoke check is blocked by the unapplied
media migration, and a video-specific browser journey was not run. See
`specs/020-video-media-and-site-logo/converge.md`.

**Why:** Product and news forms need managed video media. News already has a
`videoUrl` field, while products do not have a corresponding video field.
Administrators also need a managed website-logo upload.

**User stories**

- As an authorized editor, I can upload a product or news video and manage it
  from the corresponding create/edit form.
- As a visitor, I can play a video with visible controls, mute/unmute it, and
  enter full screen; uploaded videos start muted.
- As an editor, I can provide an existing Aparat video URL from the
  product/news create/edit workflow. Aparat upload is performed outside this
  application.
- As a visitor, I can watch an Aparat video embedded on the relevant product
  or news page.
- As an administrator, I can upload and replace the website logo from an
  admin settings section.

**Functional requirements**

- **FR-20.1 — Upload and storage:** Store uploaded video objects under the
  `/uploads/` URL namespace with server-generated opaque names; never trust or
  concatenate client filenames into paths. Apply server-side size, extension,
  MIME, and file-signature checks, authorization, and safe response headers.
  Local video uploads from CMS forms must be saved through this durable
  `/uploads/` flow.
  Enforce the approved 4 MiB Vercel video limit and 100 MiB limit on other
  production hosts.
- **FR-20.2 — Production durability:** Use Vercel Blob on Vercel and a
  configured durable `UPLOADS_DIR` on other production hosts, superseding
  Phase 12's PostgreSQL-byte decision. Serve assets through stable
  `/uploads/<opaque-id>` routes and verify availability after restart/redeploy
  before rollout. Do not write production media to ephemeral filesystems.
- **FR-20.3 — CMS fields and forms:** Add video asset references and separate
  optional Aparat video references to product and news content without
  treating an arbitrary URL as an uploaded file. Connect both create and edit
  workflows and protect all mutations with existing admin authorization and
  Zod validation. Store an Aparat URL as a separate provider reference.
  Editors upload to Aparat outside this application; this application does
  not call Aparat's upload API or store Aparat credentials.
- **FR-20.4 — Playback:** Render uploaded media and Aparat embeds safely on
  their product/news pages. Uploaded videos expose native or equivalent
  accessible controls for play, pause, volume/mute, and full-screen entry;
  initialize muted. Do not autoplay. Configure Aparat embeds to initialize
  muted and support mute and full-screen controls where its documented player
  API permits. Restrict Aparat URLs to approved HTTPS hosts and use the
  provider-supported embed mechanism; do not inject arbitrary iframe HTML.
  The owner approved the standard Aparat player and controls, accepting that
  muted startup cannot be guaranteed.
- **FR-20.5 — Website logo:** Add an admin-only branding/settings section to
  upload, preview, replace, and remove the site logo using the approved
  durable image-upload flow from Phase 12. Persist a stable asset reference,
  serve it consistently through shared site chrome, and provide a safe
  fallback when no logo is configured.
- **FR-20.6 — Lifecycle and cleanup:** A failed upload or content save must
  not remove the currently published media. Replaced/deleted assets are
  removed only when no content still references them. Preserve text-only
  products and news when no video is configured.

**Plan / candidate files**

- Extend `prisma/schema.prisma` (`NewsArticle.videoUrl` exists and
  `ShopProduct` currently has no video field) with explicit uploaded-video
  and Aparat reference fields; add a migration only after clarifying field
  semantics and how an Aparat upload result is identified.
- Extend `src/pages/admin/content/news-articles/new.tsx`,
  `src/pages/admin/content/news-articles/[id].tsx`,
  `src/pages/admin/shop/index.tsx`, the relevant product API routes under
  `src/pages/api/admin/`, and the shared upload flow under
  `src/pages/api/uploads/`.
- Add/update public rendering in `src/pages/news/[id].tsx` (from Phase 19),
  `src/pages/shop/[slug].tsx`, and the shared branding/header components.
- Add `src/pages/admin/settings/branding.tsx` and
  `src/pages/api/admin/settings/branding.ts`; connect them to the Phase 12
  asset-reference lifecycle and shared site chrome.
- Reconcile deployment guidance in `production.md` and `docs/application.md`
  with the approved durable `/uploads/` URL and backing-store design.
- Add focused API, storage, CMS form, playback, and browser tests. Use
  representative small fixture videos and never commit real media or secrets.

**Dependencies:** Phase 12's approved durable upload/reference lifecycle and
Phase 19's news detail page and shared admin layout. The owner's clarified
storage and Aparat decisions are recorded in the phase spec; actual deployment
persistence remains a rollout check.

**Done when:** Authorized editors can upload, replace, and remove product/news
videos and the site logo; the documented durable store is verified across a
deployment restart/redeploy; video controls include full screen and mute with
muted initial state and no autoplay; Aparat links are validated and embedded
separately from `/uploads/` assets; replacement failures preserve existing
media; and targeted upload/API/UI tests pass.

### Phase 21 — Test completeness and test-suite value audit

**Status:** Audit and unit/typecheck/lint/build gates complete. Chromium passed
all admin routes but two public-page checks are blocked by the configured
database lacking the Phase 20 media migration; deployment persistence remains
unverified. See `specs/021-test-suite-audit/converge.md`.

**Why:** At Phase 21 audit start, the repository had 87 source test files and
420 passing Vitest tests, with 9 Playwright spec files. Rebaseline counts and
behavior during this audit. This phase checks unit/integration test
completeness and removes only tests shown to provide no durable verification
value.

**Functional requirements**

- **FR-21.1 — Coverage inventory:** Inventory unit, API/integration, and
  Playwright tests against critical user flows, including auth and role
  checks, registration/CAPTCHA/activation, student and shop checkout, each
  payment adapter and callback lifecycle, refunds, stock reservation,
  upload authorization/storage, Aparat URL/embed workflows,
  video playback controls, public news/product navigation, and admin route
  layout. Record requirements-to-tests mapping and uncovered behavior.
- **FR-21.2 — Valuable assertions:** Every retained test must assert
  externally meaningful behavior, a required invariant, or a regression.
  Prefer public request/response, database state, UI behavior, and adapter
  contracts over private implementation details.
- **FR-21.3 — Safe test removal:** Remove a test only when it has no meaningful
  assertion, duplicates a stronger test without protecting a distinct
  invariant, or verifies behavior that has intentionally been retired.
  Document each removed test and its reason in `converge.md`; add or retain a
  replacement whenever a unique requirement would otherwise lose coverage.
  Do not remove tests merely to reduce runtime or pass a failing suite.
- **FR-21.4 — No hidden external dependencies:** Keep unit and integration
  suites deterministic and network-isolated; mock all configured payment
  providers, Aparat upload/player boundaries, and delivery services at their
  external boundaries. Keep production/sandbox provider smoke tests opt-in
  and credential-gated.
- **FR-21.5 — Quality gates:** Run the targeted suites, `npm test`,
  `npm run test:coverage`, `npm run typecheck`, `npm run lint`, and relevant
  Playwright tests. Record exact outcomes and explain any environment-blocked
  test; do not report an unrun test as passed.

**Plan / candidate files**

- Review `vitest.config.ts`, `playwright.config.ts`, `package.json`,
  `src/__tests__/`, and `e2e/`; add tests only for documented uncovered
  requirements.
- Update individual test files with their feature owners; do not rewrite
  working tests or suppress diagnostics as a substitute for fixing the cause.
- Record the final requirements-to-tests matrix, removals, and residual gaps
  in `specs/021-test-suite-audit/converge.md`.

**Dependencies:** Phases 17–20 and the test inventory/evidence they produce.

**Done when:** Every in-scope critical requirement maps to at least one
meaningful automated test at the appropriate unit, API/integration, or
browser level; each configured payment provider has mocked request,
verification, callback, and post-payment coverage; test removals are
individually justified without losing unique behavior coverage; all available
quality gates pass; and remaining environment or coverage gaps are explicit.
