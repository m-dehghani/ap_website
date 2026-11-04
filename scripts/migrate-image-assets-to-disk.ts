import 'dotenv/config';
import { getPrisma } from '@/lib/db';
import { migrateImageAssetsToDisk } from '@/lib/migrate-image-assets';

async function main() {
  const prisma = await getPrisma();
  try {
    const count = await migrateImageAssetsToDisk(prisma);
    console.info(`Migrated ${count} legacy image assets to configured storage.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Image asset migration failed:', error);
  process.exitCode = 1;
});
