/**
 * Server-only Prisma client.
 * Import this only from API routes, getServerSideProps/getStaticProps, services
 * and scripts. Pages Router strips getServerSideProps (and imports used only
 * there) from the client bundle, so pages may import it for data fetching.
 */

import type { PrismaClient } from '../../prisma/generated/client';

// Reuse one client across hot reloads in development to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as {
  prismaPromise?: Promise<PrismaClient>;
};

async function createPrisma(): Promise<PrismaClient> {
  // Dynamic imports keep pg and the generated client out of any client bundle.
  const { PrismaClient } = await import('../../prisma/generated/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createPrisma().catch((error) => {
      globalForPrisma.prismaPromise = undefined;
      throw error;
    });
  }
  return globalForPrisma.prismaPromise;
}
