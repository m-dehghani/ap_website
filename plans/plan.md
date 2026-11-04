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
