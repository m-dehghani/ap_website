import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import SuccessStories from '@/components/SuccessStories';
import PageHero from '@/components/PageHero';
import {
  getSuccessStories,
  getTestimonials,
  getStatistics,
  getMilestones,
} from '@/services/content';
import { withSite, SiteProps } from '@/lib/page-props';
import {
  SuccessAchievementViewModel,
  SuccessTestimonialViewModel,
  AnimatedStatisticViewModel,
  SuccessMilestoneViewModel,
} from '@/types/viewModels/content';

interface SuccessPageProps extends SiteProps {
  stories: Awaited<ReturnType<typeof getSuccessStories>>;
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
  statistics: Awaited<ReturnType<typeof getStatistics>>;
  milestones: Awaited<ReturnType<typeof getMilestones>>;
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  stories,
  testimonials,
  statistics,
  milestones,
}) => {
  const successStories: SuccessAchievementViewModel[] = stories.map((s) => ({
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

  const successTestimonials: SuccessTestimonialViewModel[] = testimonials.map(
    (t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      program: t.programName ?? '',
      rating: t.rating,
      text: t.content,
      date: t.date ?? '',
      improvement: t.improvement ?? '',
    }),
  );

  const stats: AnimatedStatisticViewModel[] = Object.values(statistics).map(
    (s) => ({
      number: s.value,
      label: s.label,
      description: s.description ?? '',
      icon: 'TrophyIcon',
      color: 'text-primary-600',
    }),
  );

  const successMilestones: SuccessMilestoneViewModel[] = milestones.map(
    (m) => ({
      year: String(m.year),
      event: m.title,
      description: m.description,
    }),
  );

  return (
    <Layout
      title="داستان‌های موفقیت - آکادمی فوتبال AP"
      description="افتخارات، تجربه‌ها و مسیر پیشرفت بازیکنان آکادمی فوتبال AP."
      canonical="https://ap-football.com/success"
    >
      <PageHero
        title="داستان‌های موفقیت"
        description="افتخارات، تجربه‌ها و مسیر پیشرفت بازیکنان آکادمی فوتبال AP."
        badge="پیشرفت بازیکنان"
      />
      <SuccessStories
        stories={successStories}
        testimonials={successTestimonials}
        statistics={stats}
        milestones={successMilestones}
      />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<
  SuccessPageProps
> = async () => {
  const [stories, testimonials, statistics, milestones] = await Promise.all([
    getSuccessStories(),
    getTestimonials('SUCCESS'),
    getStatistics(),
    getMilestones(),
  ]);

  return {
    props: await withSite({
      stories,
      testimonials,
      statistics,
      milestones,
    }),
  };
};

export default SuccessPage;
