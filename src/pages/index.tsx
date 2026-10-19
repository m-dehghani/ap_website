import React from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CoachSpotlight from '../components/CoachSpotlight';
import SuccessStories from '../components/SuccessStories';
import NewsUpdates from '../components/NewsUpdates';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import { getCoaches } from '../services/coachService';
import { CoachViewModel } from '@/types/viewModels/coach';

interface HomePageProps {
  coaches: CoachViewModel[];
}

const HomePage: React.FC<HomePageProps> = ({ coaches }) => {
  return (
    <Layout>
      <NextSeo
        title="آکادمی فوتبال AP - بهترین آموزش فوتبال برای همه سنین"
        description="آکادمی فوتبال AP با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد. همین امروز ثبت نام کنید."
        canonical="https://ap-football.com"
        openGraph={{
          url: 'https://ap-football.com',
          title: 'آکادمی فوتبال AP - بهترین آموزش فوتبال برای همه سنین',
          description:
            'آکادمی فوتبال AP با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد.',
          images: [
            {
              url: 'https://ap-football.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'آکادمی فوتبال AP',
            },
          ],
          site_name: 'آکادمی فوتبال AP',
        }}
        twitter={{
          handle: '@ap_football',
          site: '@ap_football',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content:
              'فوتبال, آکادمی فوتبال, آموزش فوتبال, تمرین فوتبال, مربی فوتبال, ورزش, تهران',
          },
          {
            name: 'author',
            content: 'آکادمی فوتبال AP',
          },
        ]}
      />

      <div>
        <Hero />
        <Features />
        {/* ProgramsPage removed - requires database connection. Add it back when DB is configured. */}
        <CoachSpotlight coaches={coaches} />
        <SuccessStories />
        <NewsUpdates />
        <Testimonials />
        <CTA />
      </div>
    </Layout>
  );
};

export default HomePage;

export async function getServerSideProps() {
  const coaches = await getCoaches();
  return {
    props: {
      coaches,
    },
  };
}
