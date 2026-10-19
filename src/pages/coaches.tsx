import React from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import CoachSpotlight from '../components/CoachSpotlight';
import PageHero from '../components/PageHero';
import { getCoaches } from '@/services/coachService';
import { CoachViewModel } from '@/types/viewModels/coach';

interface CoachesPageProps {
  coaches: CoachViewModel[];
}

const CoachesPage: React.FC<CoachesPageProps> = ({ coaches }) => {
  return (
    <Layout
      title="مربیان - آکادمی فوتبال AP"
      description="آشنایی با تیم مربیگری حرفه‌ای آکادمی فوتبال AP. مربیان فیفا، تجربه بین‌المللی و تخصص در آموزش فوتبال."
      canonical="https://ap-football.com/coaches"
      openGraph={{
        title: 'مربیان - آکادمی فوتبال AP',
        description: 'آشنایی با تیم مربیگری حرفه‌ای آکادمی فوتبال AP',
        images: [
          {
            url: 'https://ap-football.com/images/coaches-og.jpg',
            width: 1200,
            height: 630,
            alt: 'مربیان آکادمی فوتبال AP',
          },
        ],
      }}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'مربی فوتبال, مربی فیفا, آموزش فوتبال حرفه‌ای, مربی با تجربه, تیم مربیگری',
          },
        ]}
      />
      <PageHero
        title="مربیان آکادمی فوتبال AP"
        description="با تیم مربیگری حرفه‌ای ما آشنا شوید؛ مربیانی با تجربه در آموزش بازیکنان در هر سطح."
        badge="تیم مربیگری"
      />
      <CoachSpotlight coaches={coaches} />
    </Layout>
  );
};

export default CoachesPage;

export async function getServerSideProps() {
  const coaches = await getCoaches();
  return {
    props: {
      coaches,
    },
  };
} 