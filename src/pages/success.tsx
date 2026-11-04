import type { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import PageHero from '@/components/PageHero';
import SuccessStories from '@/components/SuccessStories';
import { getMilestones } from '@/services/content';
import { withSite, SiteProps } from '@/lib/page-props';

type SuccessPageProps = SiteProps & {
  honors: Awaited<ReturnType<typeof getMilestones>>;
};

function SuccessPage({ honors }: SuccessPageProps) {
  return (
    <Layout
      title="افتخارات آکادمی - آکادمی فوتبال AP"
      description="افتخارات و دستاوردهای آکادمی که پس از بررسی تأیید شده‌اند."
      canonical="https://ap-football.com/success"
    >
      <PageHero
        title="افتخارات و دستاوردهای آکادمی"
        description="رویدادها و افتخارات ثبت‌شده و تأییدشده آکادمی."
        badge="افتخارات آکادمی"
      />
      <SuccessStories honors={honors} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<SuccessPageProps> =
  async () => {
    const honors = await getMilestones();
    return { props: await withSite({ honors }) };
  };

export default SuccessPage;
