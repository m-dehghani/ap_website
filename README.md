# AP Football Academy Website

Standalone Next.js Pages Router application using PostgreSQL and Prisma.

## Requirements

- Node.js 22 or later
- PostgreSQL

## Local development

1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env` and set values for your environment.
3. Generate the Prisma client: `npx prisma generate`
4. Apply database migrations: `npx prisma migrate deploy`
5. Seed demo data: `npx prisma db seed`
6. Start the development server: `npm run dev`

The seed script requires `SEED_DEMO_PASSWORD` to be at least 12 characters.
It clears and replaces the seed-managed tables, so do not run it against a
database whose data you want to preserve. Production seeding is blocked unless
`ALLOW_DEMO_SEED_USERS=true` is explicitly set.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The build command generates the Prisma client before running the Next.js build,
so clean deployments (including Vercel) do not need the generated client checked
into source control.

GitHub Actions runs these checks on pushes and pull requests to `main`.
