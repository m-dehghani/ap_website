const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const provinces = await prisma.province.findMany({ take: 5, orderBy: { displayOrder: 'asc' } });
  console.log('Provinces:', JSON.stringify(provinces, null, 2));
  const cities = await prisma.city.findMany({ take: 10, include: { province: true } });
  console.log('Cities:', JSON.stringify(cities, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });