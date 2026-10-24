import React from 'react';
import Layout from '@/components/Layout';
import SuccessStories from '@/components/SuccessStories';
import PageHero from '@/components/PageHero';

const SuccessPage: React.FC = () => (
  <Layout
    title="داستان‌های موفقیت - آکادمی فوتبال افشین پیروانی"
    description="افتخارات، تجربه‌ها و مسیر پیشرفت بازیکنان آکادمی فوتبال افشین پیروانی."
    canonical="https://ap-football.com/success"
  >
    <PageHero
      title="داستان‌های موفقیت"
      description="افتخارات، تجربه‌ها و مسیر پیشرفت بازیکنان آکادمی فوتبال افشین پیروانی."
      badge="پیشرفت بازیکنان"
    />
    <SuccessStories />
  </Layout>
);

export default SuccessPage;
