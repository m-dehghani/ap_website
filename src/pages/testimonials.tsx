import type { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import PageHero from '@/components/PageHero';
import SuccessStories from '@/components/SuccessStories';
import Testimonials from '@/components/Testimonials';
import { getMilestones, getTestimonials } from '@/services/content';
import { withSite, SiteProps } from '@/lib/page-props';

type TestimonialsPageProps = SiteProps & {
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
  honors: Awaited<ReturnType<typeof getMilestones>>;
};

function TestimonialsPage({ testimonials, honors }: TestimonialsPageProps) {
  return (
    <Layout
      title="نظرات و افتخارات - آکادمی فوتبال AP"
      description="دیدگاه‌های ثبت‌شده و افتخارات تأییدشده آکادمی فوتبال AP."
      canonical="https://ap-football.com/testimonials"
    >
      <PageHero
        title="نظرات و افتخارات آکادمی"
        description="دیدگاه‌های ثبت‌شده و افتخارات تأییدشده آکادمی."
        badge="آکادمی فوتبال AP"
      />
      <SuccessStories honors={honors} />
      <Testimonials testimonials={testimonials} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<TestimonialsPageProps> =
  async () => {
    const [testimonials, honors] = await Promise.all([
      getTestimonials('GENERAL'),
      getMilestones(),
    ]);
    return { props: await withSite({ testimonials, honors }) };
  };

export default TestimonialsPage;
