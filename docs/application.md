# AP Football Academy — Website Application

## Overview

**Package**: `@ap-football-academy/website`
**Framework**: Next.js 16 (Pages Router)
**Language**: TypeScript
**Styling**: Tailwind CSS v4
**Database**: PostgreSQL (via Prisma ORM)
**Payments**: Zarinpal (student dashboard checkout)
**Authentication**: Custom session-based auth (bcryptjs)
**i18n**: Persian (`fa`, default) and English (`en`) — sub-path routing
**Location**: Shiraz, Iran

---

## Purpose

This is the public-facing website for **AP Football Academy** (آکادمی فوتبال AP), a football (soccer) training academy located in Shiraz, Iran. The website serves as:

1. **Marketing / Landing Page** — Showcases the academy, its programs, coaches, success stories, and news
2. **Registration Portal** — Allows visitors to browse programs and register online
3. **Student Dashboard** — Authenticated area for students to view schedules, attendance, evaluations, and payment history
4. **News Hub** — Displays football news updates (including a crawler-based news feed)

---

## Architecture

### Rendering Model

The application uses **Next.js Pages Router** (not App Router). This is the traditional file-system based routing approach in Next.js.

**Key implications of Pages Router:**

- Routing is file-system based: each file in `src/pages/` becomes a route
- Data fetching uses `getStaticProps` (build-time) or `getServerSideProps` (request-time)
- API routes live in `src/pages/api/`
- Custom app/document components in `_app.tsx` and `_document.tsx`
- **No Server Components** — all components are Client Components (or SSR)
- **No Route Handlers** — API logic is in `pages/api/` files

### Data Fetching Patterns

#### `getStaticProps` (Static Site Generation)
- Runs at **build time** — page is prerendered to HTML/JSON
- Use when: data available at build time, page needs to be fast/SEO-friendly
- Props are cached and served from CDN
- **Cannot** access request data (query params, headers)
- In development (`next dev`), runs on every request
- Can be combined with ISR (`revalidate`) for periodic revalidation

#### `getServerSideProps` (Server-Side Rendering)
- Runs on **every request** — renders page at request time
- Use when: need personalized data, auth headers, geolocation
- Has access to `req` and `res` objects
- Can set `Cache-Control` headers for caching
- **Cannot** be used with static exports

#### API Routes
- Files in `src/pages/api/` → `/api/*`
- Handler signature: `export default function handler(req: NextApiRequest, res: NextApiResponse)`
- Same-origin only by default (no CORS headers)
- Body auto-parsed (max `1mb` default)
- Support dynamic routes: `pages/api/post/[pid].ts`
- **Cannot** be used with static exports

### Environment Variables

| Pattern | Scope | Example |
|---------|-------|---------|
| `NEXT_PUBLIC_*` | Client + Server | `NEXT_PUBLIC_APP_NAME` |
| Other names | Server only | `DATABASE_URL`, `JWT_SECRET`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` |

Access via `process.env.VARIABLE_NAME`. Defined in `.env.local` (local), `.env.production` (production), or deployment platform.

> **Important**: Variables without `NEXT_PUBLIC_` prefix are **not** available in client-side code.

The student checkout also needs `NEXT_PUBLIC_SITE_URL` (or the existing
`NEXT_PUBLIC_APP_URL`) set to the public site origin for Zarinpal's callback.
Set `ZARINPAL_SANDBOX=true` for sandbox requests; otherwise the production
gateway is used. Keep `ZARINPAL_MERCHANT_ID` server-only. Program prices and
registration balances are stored in toman and converted to rial when sent to
Zarinpal. Apply the student-payment Prisma migration before deploying.

### Student verification and staff messaging

Profile email, phone, and password changes use one-time codes sent with
Kavenegar (SMS) and Resend (email). Staff email/SMS notifications use the same
providers. Configure these server-only variables before enabling those
workflows:

| Variable | Purpose |
|----------|---------|
| `KAVENEGAR_API_KEY` | Kavenegar SMS API key |
| `KAVENEGAR_SENDER` | Optional registered sender number |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Verified sender, for example `AP Academy <notify@example.com>` |

Missing provider configuration is returned to the user as an explicit delivery
error; messages and verification codes are never logged. Apply the latest
profile-verification Prisma migration before deploying. Marketing campaigns are
limited to students who opted in through their profile; coaches can only
message students in their own programs.

### Academy shop

The `/shop` storefront supports public browsing and guest checkout. Product
prices, sale prices, shipping fees, and order totals are stored in toman;
Zarinpal receives rial amounts. Each SKU/size/color variant tracks physical
stock, pending reservations, and completed sales separately. Checkout reserves
stock for 15 minutes; the Zarinpal callback verifies the total before decrementing
stock. Expired reservations are released during subsequent catalog/checkout
activity. A successful payment received after an expired reservation is flagged
for manual refund follow-up rather than overselling inventory.

Run `npx prisma migrate deploy` before deployment. To grant shop management
access to an existing user, first apply the migration, then update that user's
database role, for example:

```sql
UPDATE "users" SET "role" = 'SHOP_MANAGER' WHERE "email" = 'manager@example.com';
```

Shop managers can manage products,
orders, reviews, and the configurable shipping fee; regular academy admin users
can also access the shop panel. Product and review media are validated HTTPS
URLs because the project does not currently configure an upload/storage service.
Ratings and reviews are accepted only from signed-in students whose account is
attached to a paid order for that product; submissions remain unpublished until
a shop manager approves them. Guest favorites are stored in that browser only.

### Internationalization (i18n)

- **Locales**: `fa` (default), `en`
- **Strategy**: Sub-path routing (`/fa/...`, `/en/...`)
- Default locale (`fa`) has **no prefix**
- Automatic locale detection from `Accept-Language` header or `NEXT_LOCALE` cookie
- The `NEXT_LOCALE` cookie takes priority over `Accept-Language` header
- `Link` component supports `locale` prop for locale transitions
- `useRouter()` provides `locale`, `locales`, `defaultLocale` properties
- `getStaticProps`/`getServerSideProps` receive `locale` in context
- `hreflang` meta tags should be added manually for SEO

---

## Project Structure

```
apps/website/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── CoachSpotlight.tsx
│   │   ├── CTA.tsx
│   │   ├── EnhancedNewsUpdates.tsx
│   │   ├── Features.tsx
│   │   ├── FootballNewsDashboard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Layout.tsx
│   │   ├── NewsUpdates.tsx
│   │   ├── PageHero.tsx
│   │   ├── Programs.tsx
│   │   ├── SuccessStories.tsx
│   │   └── Testimonials.tsx
│   ├── config/              # Configuration files (currently empty)
│   ├── lib/                 # Shared utilities and database clients
│   │   ├── db.ts            # Prisma client (browser-safe)
│   │   └── db-server.ts     # Prisma client (server-only)
│   ├── pages/               # Next.js Pages Router routes
│   │   ├── _app.tsx         # Custom App wrapper (layout, providers, styles)
│   │   ├── _document.tsx    # Custom Document (HTML, Google Fonts)
│   │   ├── index.tsx        # Homepage / Landing page
│   │   ├── about.tsx        # About page
│   │   ├── coaches.tsx      # Coaches listing
│   │   ├── contact.tsx      # Contact page
│   │   ├── cookies.tsx      # Cookies policy
│   │   ├── news.tsx         # News page
│   │   ├── privacy.tsx      # Privacy policy
│   │   ├── programs.tsx     # Programs listing
│   │   ├── register.tsx     # Registration page
│   │   ├── success.tsx      # Success stories
│   │   ├── terms.tsx        # Terms of service
│   │   └── api/             # API routes (→ /api/*)
│   │       ├── crawler-news.ts   # News crawler endpoint
│   │       ├── programs.ts       # Programs API
│   │       ├── register.ts      # Registration endpoint
│   │       ├── students.tsx     # Legacy program lookup API
│   │       └── student/         # Authenticated profile, enrollment and payment APIs
│   ├── services/            # Business logic / service layer
│   │   └── programs_svc.ts  # Program-related services
│   └── styles/
│       └── globals.css      # Global CSS (Tailwind directives)
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   ├── seed.ts              # Database seed script
│   ├── migrations/          # Prisma migrations
│   └── generated/           # Generated Prisma client
├── public/                  # Static assets (images, fonts, etc.)
├── e2e/                     # Playwright end-to-end tests
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── package.json
└── .env                     # Environment variables
```

---

## Pages Router — Routing Reference

### File-system Routing

| File | Route |
|------|-------|
| `pages/index.tsx` | `/` |
| `pages/about.tsx` | `/about` |
| `pages/coaches.tsx` | `/coaches` |
| `pages/contact.tsx` | `/contact` |
| `pages/cookies.tsx` | `/cookies` |
| `pages/news.tsx` | `/news` |
| `pages/privacy.tsx` | `/privacy` |
| `pages/programs.tsx` | `/programs` |
| `pages/register.tsx` | `/register` |
| `pages/success.tsx` | `/success` |
| `pages/terms.tsx` | `/terms` |

With i18n, each page is also available at `/{locale}/...` (e.g., `/en/about`, `/fa/about`).

### Dynamic Routes

Bracket notation creates dynamic routes:
- `pages/programs/[id].tsx` → `/programs/:id`
- `pages/[...slug].tsx` → catch-all route

### Custom App & Document

- **`_app.tsx`**: Wraps all pages. Handles layout, auth providers, global styles, and i18n setup.
- **`_document.tsx`**: Custom HTML document. Loads Google Fonts.

### Layout Pattern

The app uses a **Custom App** pattern (`_app.tsx`) to wrap all pages with a shared `Layout` component. This preserves state between page transitions (React reconciliation).

Per-page layouts can be defined using the `getLayout` pattern:
```tsx
Page.getLayout = function getLayout(page) {
  return <AlternativeLayout>{page}</AlternativeLayout>
}
```

---

## Database Schema (Prisma)

The application uses **PostgreSQL** with **Prisma ORM**.

### Models

| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Auth users (students, admins, coaches) |
| `Coach` | `coaches` | Academy coaches |
| `Program` | `programs` | Training programs |
| `Schedule` | `Schedules` | Program schedules (day/time) |
| `Registration` | `registrations` | User program registrations |
| `Payment` | `payments` | Payment records |
| `Session` | `sessions` | Individual training sessions |
| `Attendance` | `attendance` | Session attendance records |
| `Evaluation` | `evaluations` | Student evaluations |

### Key Relations

- `User` → `Registration[]`, `Payment[]`, `Attendance[]`, `Evaluation[]`
- `Coach` → `Program[]`, `Session[]`, `Evaluation[]`
- `Program` → `Coach` (many-to-one), `Schedule[]`, `Registration[]`, `Session[]`
- `Registration` → `User`, `Program`, `Payment[]`
- `Session` → `Program`, `Coach`, `Attendance[]`

### Enum Values (stored as strings)

- **User roles**: `STUDENT`, `ADMIN`, `COACH`
- **Registration status**: `PENDING`, `APPROVED`, `CANCELLED`, `COMPLETED`
- **Payment status**: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- **Payment method**: `ONLINE`, `CASH`, `BANK_TRANSFER`
- **Session status**: `SCHEDULED`, `ONGOING`, `COMPLETED`, `CANCELLED`
- **Attendance status**: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`

### Prisma Client Setup

Two client instances exist:

| File | Usage |
|------|-------|
| `lib/db.ts` | Browser-safe (client components) — limited operations |
| `lib/db-server.ts` | Server-only (API routes, `getServerSideProps`) — full Prisma client |

> **Note**: Prisma client should **never** be imported directly in client components in production. Use API routes or `getServerSideProps` for data access.

---

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/crawler-news` | GET/POST | News crawler endpoint |
| `/api/get-session` | GET | Retrieve session data |
| `/api/programs` | GET | Fetch programs list |
| `/api/register` | POST | Handle user registration |
| `/api/students` | GET | Student data (authenticated) |
| `/api/webhook` | POST | Stripe webhook handler |

### API Route Patterns

```tsx
// Standard API route
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    // Handle POST
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// Dynamic route: pages/api/programs/[id].ts
export default function handler(req, res) {
  const { id } = req.query  // dynamic param
}

// Catch-all: pages/api/news/[...slug].ts
export default function handler(req, res) {
  const { slug } = req.query  // always an array
}
```

### API Route Config

```tsx
export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },  // default
  },
  maxDuration: 5,  // max execution time (seconds)
}
```

To disable body parsing (e.g., for webhook verification):
```tsx
export const config = {
  api: { bodyParser: false },
}
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` (16.2.10) | Framework (Pages Router) |
| `react` / `react-dom` (19.2.7) | UI library |
| `@prisma/client` (7.9.0) | Database ORM |
| `@prisma/adapter-pg` | PostgreSQL adapter |
| `pg` | PostgreSQL driver |
| `tailwindcss` (4.3.2) | Utility CSS framework |
| `@tailwindcss/postcss` | Tailwind PostCSS plugin (v4) |
| `framer-motion` | Animation library |
| `@heroicons/react` | Icon library |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Form handling & validation |
| `stripe` | Payment processing |
| `bcryptjs` | Password hashing |
| `next-seo` | SEO meta tag management |
| `react-hot-toast` | Toast notifications |
| `dotenv` | Environment variable loading |

---

## Build & Dev Commands

```bash
# Development
pnpm dev              # Start dev server (default)
pnpm dev:turbopack    # Start dev server with Turbopack (faster HMR)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code quality
pnpm lint             # Run ESLint
```

---

## Testing

- **E2E tests**: Playwright (`e2e/` directory)
- **Config**: `playwright.config.ts`

---

## Security Headers (configured in `next.config.ts`)

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Powered-By` | (removed) | Hide server info |

---

## Image Optimization

Remote images are allowed from:
- `images.unsplash.com`
- `res.cloudinary.com`

Configure in `next.config.ts` under `images.remotePatterns`.

---

## Important Notes for Future Development

### Pages Router vs App Router

This project uses the **Pages Router**. For new features, consider:

- **App Router** (`app/` directory) supports Server Components, Route Handlers, and Streaming SSR
- Pages Router uses `getStaticProps`/`getServerSideProps` for data fetching
- App Router uses Server Components (default) and Route Handlers (`route.ts`) for APIs
- API Routes (`pages/api/`) **cannot** be used with static exports; App Router Route Handlers can
- The Pages Router docs are in `node_modules/next/dist/docs/02-pages/`

### TypeScript Types for Pages Router

```tsx
import type { GetStaticProps, GetServerSideProps, NextPage } from 'next'
import type { InferGetStaticPropsType, InferGetServerSidePropsType } from 'next'

// With getStaticProps
export const getStaticProps: GetStaticProps<{ title: string }> = async () => {
  return { props: { title: 'Hello' } }
}
export default function Page({ title }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <h1>{title}</h1>
}

// With getServerSideProps
export const getServerSideProps: GetServerSideProps<{ data: string }> = async () => {
  return { props: { data: 'Hello' } }
}
export default function Page({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <p>{data}</p>
}
```

### Layout Pattern with TypeScript

```tsx
// pages/_app.tsx
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  return getLayout(<Component {...pageProps} />)
}
```

### i18n Usage

```tsx
// In pages with getStaticProps / getServerSideProps
export async function getStaticProps({ locale }) {
  // locale is 'fa' or 'en'
  const data = await fetchData(locale)
  return { props: { data } }
}

// Link with locale
import Link from 'next/link'
<Link href="/about" locale="en">About in English</Link>

// Router
import { useRouter } from 'next/router'
const router = useRouter()
router.push('/about', '/about', { locale: 'en' })
router.push({ pathname: '/about', query: {} }, '/about', { locale: 'en' })

// Access locale
router.locale       // current locale
router.locales     // all supported locales
router.defaultLocale  // 'fa'
```

### getStaticProps vs getServerSideProps Decision Guide

| Use `getStaticProps` when... | Use `getServerSideProps` when... |
|------------------------------|----------------------------------|
| Data is available at build time | Need personalized user data |
| Page must be fast/SEO-friendly | Need authorization headers |
| Data can be publicly cached | Need geolocation at request time |
| Using a headless CMS | Data changes per request |
| Can use ISR (`revalidate`) | Cannot static-generate the page |

### Best Practices

1. **Prefer `getStaticProps` with ISR** over `getServerSideProps` for performance
2. **Share data fetching logic** via `lib/` to avoid duplication between `getStaticProps` and API routes
3. **Never put Prisma client in client components** — use API routes or `getServerSideProps`
4. **Validate API route bodies** at runtime — `NextApiRequest.body` is `any`
5. **Add `hreflang` meta tags** manually for i18n SEO (Next.js doesn't auto-generate them)
6. **Use `NEXT_LOCALE` cookie** to persist user's language preference
7. **Server-only env vars** should not leak to client — verify with [next-code-elimination tool](https://next-code-elimination.vercel.app/)

---

## Public Pages Summary

| Page | Route | Data Source | Auth Required |
|------|-------|-------------|---------------|
| Home | `/` | Static + API | No |
| About | `/about` | Static | No |
| Programs | `/programs` | API (`/api/programs`) | No |
| Coaches | `/coaches` | Static | No |
| News | `/news` | API (crawler) | No |
| Contact | `/contact` | Static | No |
| Register | `/register` | API (`/api/register`) | No |
| Success Stories | `/success` | Static | No |
| Privacy | `/privacy` | Static | No |
| Terms | `/terms` | Static | No |
| Cookies | `/cookies` | Static | No |

---

*Last updated: 2025-01-29*
*This document covers the `apps/website` project. Other projects in the monorepo will be documented separately.*
