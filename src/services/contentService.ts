import { getPrisma } from '@/lib/db';
import {
  FacilityViewModel,
  MilestoneViewModel,
  NewsArticleViewModel,
  NewsCategoryViewModel,
  StaffMemberViewModel,
  StatisticViewModel,
  SuccessStoryViewModel,
  TestimonialViewModel,
} from '@/types/viewModels/content';

export async function getStatistics(): Promise<Record<string, StatisticViewModel>> {
  const prisma = await getPrisma();
  const rows = await prisma.statistic.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return Object.fromEntries(
    rows.map(({ key, value, label, description }) => [
      key,
      { key, value, label, description },
    ]),
  );
}

export async function getTestimonials(
  category: 'GENERAL' | 'SUCCESS',
): Promise<TestimonialViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.testimonial.findMany({
    where: { category, isPublished: true },
    include: { program: { select: { name: true } } },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    content: t.content,
    image: t.image,
    rating: t.rating,
    improvement: t.improvement,
    date: t.date?.toISOString() ?? null,
    programName: t.program?.name ?? null,
  }));
}

export async function getSuccessStories(): Promise<SuccessStoryViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.successStory.findMany({
    where: { isPublished: true },
    include: {
      program: { select: { name: true } },
      coach: { select: { firstName: true, lastName: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map((s) => ({
    id: s.id,
    playerName: s.playerName,
    age: s.age,
    achievement: s.achievement,
    description: s.description,
    quote: s.quote,
    date: s.date.toISOString(),
    programName: s.program?.name ?? null,
    coachName: s.coach ? `${s.coach.firstName} ${s.coach.lastName}` : null,
    stats: { goals: s.goals, assists: s.assists, matches: s.matches },
  }));
}

export async function getMilestones(): Promise<MilestoneViewModel[]> {
  const prisma = await getPrisma();
  return prisma.milestone.findMany({
    select: { id: true, year: true, title: true, description: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getStaffMembers(): Promise<StaffMemberViewModel[]> {
  const prisma = await getPrisma();
  return prisma.staffMember.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true, bio: true, initials: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getFacilities(): Promise<FacilityViewModel[]> {
  const prisma = await getPrisma();
  return prisma.facility.findMany({
    select: { id: true, category: true, name: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getNewsCategories(): Promise<NewsCategoryViewModel[]> {
  const prisma = await getPrisma();
  return prisma.newsCategory.findMany({
    select: { slug: true, name: true, icon: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getNewsArticles(limit?: number): Promise<NewsArticleViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.newsArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map((n) => ({
    id: n.id,
    title: n.title,
    excerpt: n.excerpt,
    content: n.content,
    category: n.category,
    type: n.type,
    author: n.author,
    image: n.image,
    tags: n.tags,
    readTimeMinutes: n.readTimeMinutes,
    likes: n.likes,
    comments: n.comments,
    featured: n.featured,
    publishedAt: n.publishedAt.toISOString(),
  }));
}
