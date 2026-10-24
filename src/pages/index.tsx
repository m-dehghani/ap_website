import React from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CoachSpotlight from '@/components/CoachSpotlight';
import SuccessStories from '@/components/SuccessStories';
import NewsUpdates from '@/components/NewsUpdates';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import ShopSpotlight from '@/components/shop/ShopSpotlight';
import { getCoaches } from '@/services/coachService';
import { CoachViewModel } from '@/types/viewModels/coach';
import {
  getHeroContents,
  getHeroAchievements,
  getFeaturesContent,
  getFeatureStats,
  getStatistics,
  getTestimonials,
  getSuccessStories,
  getMilestones,
  getNewsCategories,
  getFeaturedNewsArticles,
  getCTAContent,
} from '@/services/content';
import { HeroContentViewModel, HeroAchievementViewModel, FeaturesContentViewModel, FeatureStatItemViewModel, StatisticViewModel, CTAContentViewModel } from '@/types/viewModels/content';
import { withSite, SiteProps } from '@/lib/page-props';
import { SuccessAchievementViewModel, SuccessTestimonialViewModel, AnimatedStatisticViewModel, SuccessMilestoneViewModel } from '@/types/viewModels/content';

interface HomePageProps extends SiteProps {
  coaches: CoachViewModel[];
  heroContents: HeroContentViewModel[];
  heroAchievements: HeroAchievementViewModel[];
  featuresContent: FeaturesContentViewModel[];
  featureStats: FeatureStatItemViewModel[];
  statistics: Record<string, StatisticViewModel>;
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
  successStories: Awaited<ReturnType<typeof getSuccessStories>>;
  milestones: Awaited<ReturnType<typeof getMilestones>>;
  featuredNews: Awaited<ReturnType<typeof getFeaturedNewsArticles>>;
  newsCategories: Awaited<ReturnType<typeof getNewsCategories>>;
  ctaContent: CTAContentViewModel | null;
}

const HomePage: React.FC<HomePageProps> = ({
  coaches,
  heroContents,
  heroAchievements,
  featuresContent,
  featureStats,
  statistics,
  testimonials,
  successStories,
  milestones,
  featuredNews,
  newsCategories,
  ctaContent,
  site,
}) => {
  // Prepare hero slides data
  const slides = heroContents.map((content) => ({
    title: content.title,
    subtitle: content.subtitle,
    description: content.description,
    cta: { label: content.ctaLabel, href: content.ctaHref },
    ctaSecondary: { label: content.ctaSecondaryLabel, href: content.ctaSecondaryHref },
    bgGradient: content.bgGradient,
    stats: content.stats,
    statLabels: content.statLabels,
  }));

  const achievements = heroAchievements.map(a => ({
    icon: a.icon,
    number: a.number,
    label: a.label,
    color: a.color,
    bg: a.bg,
    position: a.position,
  }));

  const statLabels = heroContents[0]?.statLabels ?? {};

  // Prepare features data
  const features = featuresContent.map(f => ({
    icon: f.icon,
    title: f.title,
    description: f.description,
    color: f.color,
    bgColor: f.bgColor,
    iconColor: f.iconColor,
    stats: f.stats,
  }));

  const featureStatsData = featureStats.map(s => ({
    number: s.number,
    label: s.label,
    description: s.description ?? '',
    icon: s.icon,
    color: s.color,
  }));

  // Prepare CTA data
  const ctaData = ctaContent ? {
    title: ctaContent.title,
    description: ctaContent.description,
    primaryCTA: { label: ctaContent.primaryCTALabel, href: ctaContent.primaryCTAHref },
    secondaryCTA: { label: ctaContent.secondaryCTALabel, href: ctaContent.secondaryCTAHref },
  } : {
    title: 'آماده شروع سفر فوتبال خود هستید؟',
    description: 'به صدها بازیکنی بپیوندید که با آموزش حرفه‌ای، بازی خود را متحول کرده‌اند.',
    primaryCTA: { label: 'همین امروز شروع کنید', href: '/register' },
    secondaryCTA: { label: 'رزرو بازدید', href: '/contact' },
  };

  // Convert success stories to the expected format
  const stories: SuccessAchievementViewModel[] = successStories.map(s => ({
    id: s.id,
    playerName: s.playerName,
    age: s.age,
    date: s.date,
    program: s.programName ?? '',
    achievement: s.achievement,
    description: s.description,
    quote: s.quote ?? '',
    stats: s.stats,
    coach: s.coachName ?? '',
  }));

  // Convert testimonials to the expected format
  const successTestimonials: SuccessTestimonialViewModel[] = testimonials.map(t => ({
    id: t.id,
    name: t.name,
    role: t.role,
    program: t.programName ?? '',
    rating: t.rating,
    text: t.content,
    date: t.date ?? '',
    improvement: t.improvement ?? '',
  }));

  // Convert statistics to animated stats
  const stats: AnimatedStatisticViewModel[] = Object.values(statistics).map(s => ({
    number: s.value,
    label: s.label,
    description: s.description ?? '',
    icon: 'TrophyIcon',
    color: 'text-primary-600',
  }));

  const successMilestones: SuccessMilestoneViewModel[] = milestones.map((milestone) => ({
    year: String(milestone.year),
    event: milestone.title,
    description: milestone.description,
  }));

  return (
    <Layout site={site}>
      <NextSeo
        title={site?.name ?? 'آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین'}
        description={site?.description ?? 'آکادمی فوتبال افشین پیروانی با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد. همین امروز ثبت نام کنید.'}
        canonical={site?.domain ?? 'https://afshin-football.com'}
        openGraph={{
          url: site?.domain ?? 'https://afshin-football.com',
          title: site?.name ?? 'آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین',
          description: site?.description ?? 'آکادمی فوتبال افشین پیروانی با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد.',
          images: [
            {
              url: `${site?.domain ?? 'https://afshin-football.com'}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: 'آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین',
            },
          ],
          site_name: site?.name ?? 'آکادمی فوتبال افشین پیروانی',
        }}
        twitter={{
          handle: '@afshin_football',
          site: '@afshin_football',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'فوتبال, آکادمی فوتبال, آموزش فوتبال, تمرین فوتبال, مربی فوتبال, ورزش, تهران',
          },
          {
            name: 'author',
            content: 'آکادمی فوتبال افشین پیروانی',
          },
        ]}
      />

      <div>
        <Hero slides={slides} achievements={achievements} statLabels={statLabels} />
        <ShopSpotlight />
        <Features features={features} stats={featureStatsData} />
        <CoachSpotlight coaches={coaches} />
        <SuccessStories stories={stories} testimonials={successTestimonials} statistics={stats} milestones={successMilestones} />
        <NewsUpdates categories={newsCategories} articles={featuredNews} />
        <Testimonials testimonials={testimonials} stats={stats} />
        <CTA content={ctaData} />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const [
    coaches,
    heroContents,
    heroAchievements,
    featuresContent,
    featureStats,
    statistics,
    testimonials,
    successStories,
    milestones,
    featuredNews,
    newsCategories,
    ctaContent,
  ] = await Promise.all([
    getCoaches(),
    getHeroContents(),
    getHeroAchievements(),
    getFeaturesContent(),
    getFeatureStats(),
    getStatistics(),
    getTestimonials('GENERAL'),
    getSuccessStories(),
    getMilestones(),
    getFeaturedNewsArticles(6),
    getNewsCategories(),
    getCTAContent(),
  ]);

  return {
    props: await withSite({
      coaches,
      heroContents,
      heroAchievements,
      featuresContent,
      featureStats,
      statistics,
      testimonials,
      successStories,
      milestones,
      featuredNews,
      newsCategories,
      ctaContent,
    }),
  };
};

export default HomePage;