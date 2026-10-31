# Phase 6 — Contact inbox implementation plan

## Scope and decisions

Implement only the contact inbox described in `spec.md` and Phase 6 of
`plans/plan.md`. `ContactMessage` already exists with the required contact
fields and a string status defaulting to `NEW`; no schema migration is needed.
The app uses Next.js Pages Router, Prisma, Zod, and the shared
`authorizeAdmin` helper.

- Public submissions use `POST /api/contact`, validate the contact fields with
  Zod, and persist valid messages as `NEW`.
- Include an unadvertised honeypot field. Reject a filled honeypot without
  persisting it. Do not log request bodies or submitted message text.
- Admin inbox reads and status updates use `GET` and `PATCH
  /api/admin/messages`; both require `authorizeAdmin`. Select only the message
  fields needed by the inbox. Support only `NEW`, `READ`, and `ANSWERED`, with
  conditional updates to avoid overwriting a concurrently changed record.
- Replace the current `mailto:`-only contact submit with the API flow. Keep
  the mailto behavior only as a failure fallback; display visible Persian
  validation/result feedback with live announcements.
- Add an admin-only `/admin/messages` page and a link from the admin navigation
  or dashboard.
- Keep all UI in Persian. Do not add rate limiting, notification delivery, or
  other inbox features in this phase.

## Planned files

| File | Change |
| --- | --- |
| `src/pages/api/contact.ts` | Public Zod-validated submission endpoint and honeypot short-circuit |
| `src/pages/api/admin/messages.ts` | Admin-authorized list and NEW/READ/ANSWERED state endpoint |
| `src/pages/contact.tsx` | API-backed form, accessible feedback, honeypot, API-failure mailto fallback |
| `src/pages/admin/messages.tsx` | Admin inbox list and status controls |
| `src/components/AdminLayout.tsx` or `src/pages/admin/index.tsx` | Link to inbox |
| `src/__tests__/pages/api/contact.test.ts` | Validation, spam short-circuit, persistence, no body logging |
| `src/__tests__/pages/api/admin/messages.test.ts` | Admin authorization, list, status validation/transition |
| `src/__tests__/pages/contact.test.tsx` | Accessible fields, API submit, visible errors/success, fallback |
| `src/__tests__/pages/admin/messages.test.tsx` | Inbox rendering and status interaction |
| `e2e/contact-inbox.spec.ts` | Browser coverage for public submission and admin status change |

## Verification

Run focused Phase 6 tests, then `npm test`, `npm run typecheck`, and
`npm run lint`. Attempt browser/e2e verification using the existing Playwright
setup; record the exact outcome and any environment limitation in `converge.md`.
Do not commit.
