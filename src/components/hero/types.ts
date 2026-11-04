import type { NewsArticleViewModel } from '@/types/viewModels/content';

export interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  bgGradient: string;
  stats: Record<string, string>;
  statLabels?: Record<string, string>;
}

export interface HeroAchievement {
  icon: string;
  number: string;
  label: string;
  color: string;
  bg: string;
  position: string;
}

export interface HeroProps {
  slides: HeroSlide[];
  achievements: HeroAchievement[];
  statLabels: Record<string, string>;
  recentNews: NewsArticleViewModel[];
}
