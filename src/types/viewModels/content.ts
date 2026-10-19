/**
 * Content View Models
 * Presentation layer models for content data
 */

export interface StatisticViewModel {
  key: string;
  value: string;
  label: string;
  description: string | null;
}

export interface AnimatedStatisticViewModel {
  number: string;
  label: string;
  description?: string;
  icon: string;
  color: string;
}

export interface FeatureViewModel {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  iconColor: string;
  stats: string;
}

export interface SuccessAchievementViewModel {
  id: string | number;
  playerName: string;
  age: string | number;
  date: string;
  program: string;
  achievement: string;
  description: string;
  quote: string;
  stats: { goals: number; assists: number; matches: number };
  coach: string;
}

export interface SuccessTestimonialViewModel {
  id: string | number;
  name: string;
  role: string;
  program: string;
  rating: number;
  text: string;
  date: string;
  improvement: string;
}

export interface SuccessMilestoneViewModel {
  year: string;
  event: string;
  description: string;
}

export interface TestimonialViewModel {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string | null;
  rating: number;
  improvement: string | null;
  date: string | null;
  programName: string | null;
}

export interface SuccessStoryViewModel {
  id: string;
  playerName: string;
  age: number;
  achievement: string;
  description: string;
  quote: string | null;
  date: string;
  programName: string | null;
  coachName: string | null;
  stats: { goals: number; assists: number; matches: number };
}

export interface MilestoneViewModel {
  id: string;
  year: number;
  title: string;
  description: string;
}

export interface StaffMemberViewModel {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export interface FacilityViewModel {
  id: string;
  category: string;
  name: string;
}

export interface NewsCategoryViewModel {
  slug: string;
  name: string;
  icon: string;
}

export interface NewsArticleViewModel {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  author: string;
  image: string | null;
  tags: string[];
  readTimeMinutes: number;
  likes: number;
  comments: number;
  featured: boolean;
  publishedAt: string;
}

export interface NewsCardViewModel
  extends Omit<
    NewsArticleViewModel,
    'id' | 'image' | 'readTimeMinutes' | 'publishedAt'
  > {
  id: string | number;
  date: string;
  image: string;
  readTime: string;
  source?: string;
  url?: string;
  entities?: {
    players: string[];
    teams: string[];
    coaches: string[];
    matches: string[];
  };
  sentiment?: {
    score: number;
    label: string;
  };
  isTransferNews?: boolean;
  importanceScore?: number;
}

export type NewsContentType = 'news' | 'video' | 'gallery';

export type NewsArticleCardViewModel = Pick<
  NewsCardViewModel,
  | 'id'
  | 'title'
  | 'excerpt'
  | 'date'
  | 'author'
  | 'category'
  | 'tags'
  | 'likes'
  | 'comments'
  | 'readTime'
  | 'featured'
> & {
  content: string;
  type: NewsContentType;
  image?: string;
};

export function toStatisticViewModel(stat: Record<string, any>): StatisticViewModel {
  return {
    key: stat.key,
    value: stat.value,
    label: stat.label,
    description: stat.description,
  };
}

export function toTestimonialViewModel(testimonial: Record<string, any>): TestimonialViewModel {
  return {
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    content: testimonial.content,
    image: testimonial.image,
    rating: testimonial.rating,
    improvement: testimonial.improvement,
    date: testimonial.date?.toISOString() ?? null,
    programName: testimonial.program?.name ?? null,
  };
}

export function toSuccessStoryViewModel(story: Record<string, any>): SuccessStoryViewModel {
  return {
    id: story.id,
    playerName: story.playerName,
    age: story.age,
    achievement: story.achievement,
    description: story.description,
    quote: story.quote,
    date: story.date.toISOString(),
    programName: story.program?.name ?? null,
    coachName: story.coach
      ? `${story.coach.firstName} ${story.coach.lastName}`
      : null,
    stats: {
      goals: story.goals,
      assists: story.assists,
      matches: story.matches,
    },
  };
}

export function toMilestoneViewModel(milestone: Record<string, any>): MilestoneViewModel {
  return {
    id: milestone.id,
    year: milestone.year,
    title: milestone.title,
    description: milestone.description,
  };
}

export function toStaffMemberViewModel(staff: Record<string, any>): StaffMemberViewModel {
  return {
    id: staff.id,
    name: staff.name,
    role: staff.role,
    bio: staff.bio,
    initials: staff.initials,
  };
}

export function toFacilityViewModel(facility: Record<string, any>): FacilityViewModel {
  return {
    id: facility.id,
    category: facility.category,
    name: facility.name,
  };
}

export function toNewsCategoryViewModel(category: Record<string, any>): NewsCategoryViewModel {
  return {
    slug: category.slug,
    name: category.name,
    icon: category.icon,
  };
}

export function toNewsArticleViewModel(article: Record<string, any>): NewsArticleViewModel {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    type: article.type,
    author: article.author,
    image: article.image,
    tags: article.tags || [],
    readTimeMinutes: article.readTimeMinutes,
    likes: article.likes,
    comments: article.comments,
    featured: article.featured,
    publishedAt: article.publishedAt.toISOString(),
  };
}