import type { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import PageHero from '@/components/PageHero';
import Testimonials from '@/components/Testimonials';
import { getTestimonials } from '@/services/content';
import { withSite, SiteProps } from '@/lib/page-props';

type TestimonialsPageProps = SiteProps & {
  testimonials: Awaited<ReturnType<typeof getTestimonials>>;
};

function TestimonialsPage({ testimonials }: TestimonialsPageProps) {
  return (
    <Layout
      title="نظرات و تجربه‌ها - آکادمی فوتبال AP"
      description="دیدگاه‌ها و تجربه‌های ثبت‌شده درباره آکادمی فوتبال AP."
      canonical="https://ap-football.com/testimonials"
    >
      <PageHero
        title="نظرات و تجربه‌ها"
        description="دیدگاه‌های ثبت‌شده درباره تجربه حضور در آکادمی."
        badge="نظرات"
      />
      <Testimonials testimonials={testimonials} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<TestimonialsPageProps> =
  async () => {
    const testimonials = await getTestimonials('GENERAL');
    return { props: await withSite({ testimonials }) };
  };

export default TestimonialsPage;
