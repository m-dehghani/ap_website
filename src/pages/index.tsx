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
import ShopSpotlight from '@/components/shop/ShopSpotlight';
import { getCoaches } from '../services/coachService';
import { CoachViewModel } from '@/types/viewModels/coach';

interface HomePageProps {
  coaches: CoachViewModel[];
}

const HomePage: React.FC<HomePageProps> = ({ coaches }) => {
  return (
    <Layout>
      <NextSeo
        title="آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین"
        description="آکادمی فوتبال افشین پیروانی با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد. همین امروز ثبت نام کنید."
        canonical="https://afshin-football.com"
        openGraph={{
          url: 'https://afshin-football.com',
          title:
            'آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین',
          description:
            'آکادمی فوتبال افشین پیروانی با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد.',
          images: [
            {
              url: 'https://afshin-football.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین',
            },
          ],
          site_name: 'آکادمی فوتبال افشین پیروانی',
        }}
        twitter={{
          handle: '@afshin_football',
          site: '@afshin_football',
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
            content: 'آکادمی فوتبال افشین پیروانی',
          },
        ]}
      />

      <div>
        <Hero />
        <ShopSpotlight />
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
