import { getPrisma } from '@/lib/db';
import {
  SiteInfoViewModel,
  toOpeningHourViewModel,
  toSocialLinkViewModel,
} from '@/types/viewModels/site';

export async function getSiteInfo(): Promise<SiteInfoViewModel | null> {
  const prisma = await getPrisma();
  const [academy, hours, socialLinks, programs] = await Promise.all([
    prisma.academyInfo.findUnique({ where: { id: 'default' } }),
    prisma.openingHour.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.program.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, ageRange: true },
    }),
  ]);

  if (!academy) return null;

  return {
    name: academy.name,
    tagline: academy.tagline,
    description: academy.description,
    phone: academy.phone,
    email: academy.email,
    privacyEmail: academy.privacyEmail,
    address: academy.address,
    city: academy.city,
    foundedYear: academy.foundedYear,
    officeHours: hours
      .filter((h) => h.type === 'OFFICE')
      .map(toOpeningHourViewModel),
    trainingHours: hours
      .filter((h) => h.type === 'TRAINING')
      .map(toOpeningHourViewModel),
    socialLinks: socialLinks.map(toSocialLinkViewModel),
    programLinks: programs,
  };
}
