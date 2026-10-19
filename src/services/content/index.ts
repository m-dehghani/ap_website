/**
 * Content Service
 * Centralized service for fetching content data
 * Replaces hardcoded data in components
 */

import { getPrisma } from '@/lib/db';
import {
  StatisticViewModel,
  TestimonialViewModel,
  SuccessStoryViewModel,
  MilestoneViewModel,
  StaffMemberViewModel,
  FacilityViewModel,
  NewsCategoryViewModel,
  NewsArticleViewModel,
  toTestimonialViewModel,
  toSuccessStoryViewModel,
  toMilestoneViewModel,
  toStaffMemberViewModel,
  toFacilityViewModel,
  toNewsCategoryViewModel,
  toNewsArticleViewModel,
} from '@/types/viewModels/content';

export async function getStatistics(): Promise<
  Record<string, StatisticViewModel>
> {
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
  category: 'GENERAL' | 'SUCCESS' = 'GENERAL',
): Promise<TestimonialViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.testimonial.findMany({
    where: { category, isPublished: true },
    include: { program: { select: { name: true } } },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map(toTestimonialViewModel);
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
  return rows.map(toSuccessStoryViewModel);
}

export async function getMilestones(): Promise<MilestoneViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.milestone.findMany({
    select: { id: true, year: true, title: true, description: true },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map(toMilestoneViewModel);
}

export async function getStaffMembers(): Promise<StaffMemberViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.staffMember.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true, bio: true, initials: true },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map(toStaffMemberViewModel);
}

export async function getFacilities(): Promise<FacilityViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.facility.findMany({
    select: { id: true, category: true, name: true },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map(toFacilityViewModel);
}

export async function getNewsCategories(): Promise<NewsCategoryViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.newsCategory.findMany({
    select: { slug: true, name: true, icon: true },
    orderBy: { displayOrder: 'asc' },
  });
  return rows.map(toNewsCategoryViewModel);
}

export async function getNewsArticles(
  limit?: number,
): Promise<NewsArticleViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.newsArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map(toNewsArticleViewModel);
}

export async function getFeaturedNewsArticles(
  limit = 2,
): Promise<NewsArticleViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.newsArticle.findMany({
    where: { isPublished: true, featured: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map(toNewsArticleViewModel);
}

export async function getNewsArticlesByCategory(
  category: string,
  limit?: number,
): Promise<NewsArticleViewModel[]> {
  const prisma = await getPrisma();
  const rows = await prisma.newsArticle.findMany({
    where: { isPublished: true, category },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map(toNewsArticleViewModel);
}
