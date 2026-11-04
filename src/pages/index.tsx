import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
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
  getTestimonials,
  getMilestones,
  getNewsCategories,
  getNewsArticles,
  getCTAContent,
} from '@/services/content';
import { HeroContentViewModel, HeroAchievementViewModel, FeaturesContentViewModel, FeatureStatItemViewModel, CTAContentViewModel } from '@/types/viewModels/content';
import { withSite, SiteProps } from '@/lib/page-props';
import { normalizeClubColorClasses } from '@/lib/brand-colors';

interface HomePageProps extends SiteProps {
  coaches: CoachViewModel[];
  heroContents: HeroContentViewModel[];
  heroAchievements: HeroAchievementViewModel[];
  featuresContent: FeaturesContentViewModel[];
  featureStats: FeatureStatItemViewModel[];
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
  milestones: Awaited<ReturnType<typeof getMilestones>>;
  recentNews: Awaited<ReturnType<typeof getNewsArticles>>;
  newsCategories: Awaited<ReturnType<typeof getNewsCategories>>;
  ctaContent: CTAContentViewModel | null;
}

const HomePage: React.FC<HomePageProps> = ({
  coaches,
  heroContents,
  heroAchievements,
  featuresContent,
  featureStats,
  testimonials,
  milestones,
  recentNews,
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
    bgGradient: normalizeClubColorClasses(content.bgGradient),
    stats: content.stats,
    statLabels: content.statLabels,
  }));

  const achievements = heroAchievements.map(a => ({
    icon: a.icon,
    number: a.number,
    label: a.label,
    color: normalizeClubColorClasses(a.color),
    bg: normalizeClubColorClasses(a.bg),
    position: a.position,
  }));

  const statLabels = heroContents[0]?.statLabels ?? {};

  // Prepare features data
  const features = featuresContent.map(f => ({
    icon: f.icon,
    title: f.title,
    description: f.description,
    color: normalizeClubColorClasses(f.color),
    bgColor: normalizeClubColorClasses(f.bgColor),
    iconColor: normalizeClubColorClasses(f.iconColor),
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

      <div className="home-page">
        <Hero
          slides={slides}
          achievements={achievements}
          statLabels={statLabels}
          recentNews={recentNews.slice(0, 3)}
        />
        <nav
          aria-label="دسترسی سریع به بخش‌های آکادمی"
          className="border-t border-slate-200 bg-slate-50 py-8 md:hidden"
        >
          <div className="container-custom">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              دسترسی سریع
            </h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-4">
              {[
                {
                  label: 'برنامه‌ها',
                  summary: 'جزئیات دوره‌ها و برنامه‌های آموزشی',
                  href: '/programs',
                },
                {
                  label: 'مربیان',
                  summary: 'معرفی مربیان آکادمی',
                  href: '/coaches',
                },
                {
                  label: 'اخبار',
                  summary: 'تازه‌های آکادمی',
                  href: '/news',
                },
                {
                  label: 'درباره آکادمی',
                  summary: 'اطلاعات بیشتر درباره آکادمی',
                  href: '/about',
                },
                {
                  label: 'ثبت‌نام',
                  summary: 'فرم درخواست عضویت',
                  href: '/register',
                  primary: true,
                },
              ].map(({ label, summary, href, primary }) => (
                <li key={href} className="py-2">
                  <Link
                    href={href}
                    className={
                      primary
                        ? 'btn btn-primary min-h-11 w-full flex-col gap-0'
                        : 'flex min-h-11 flex-col items-start justify-center font-semibold text-slate-700 hover:text-primary-700 focus-visible:underline'
                    }
                  >
                    <span>{label}</span>
                    <span
                      className={
                        primary
                          ? 'text-xs font-normal text-white/85'
                          : 'text-xs font-normal text-slate-500'
                      }
                    >
                      {summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <ShopSpotlight />
        <NewsUpdates categories={newsCategories} articles={recentNews} />
        <div className="hidden md:block">
          <Features features={features} stats={featureStatsData} />
          <CoachSpotlight coaches={coaches} />
          <SuccessStories honors={milestones} />
          <Testimonials testimonials={testimonials} />
          <CTA content={ctaData} />
        </div>
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
    testimonials,
    milestones,
    recentNews,
    newsCategories,
    ctaContent,
  ] = await Promise.all([
    getCoaches(),
    getHeroContents(),
    getHeroAchievements(),
    getFeaturesContent(),
    getFeatureStats(),
    getTestimonials('GENERAL'),
    getMilestones(),
    getNewsArticles(6),
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
      testimonials,
      milestones,
      recentNews,
      newsCategories,
      ctaContent,
    }),
  };
};

export default HomePage;