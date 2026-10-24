import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import Programs from '../components/Programs';
import type { GetServerSideProps } from 'next';
import { getPrograms } from '@/services/programService';
import { withSite, SiteProps } from '@/lib/page-props';
import { ProgramViewModel } from '@/types/viewModels/program';

interface ProgramsPageProps extends SiteProps {
  programs: ProgramViewModel[];
}

function ProgramsPage({ programs }: ProgramsPageProps) {
  return (
    <Layout
      title="برنامه‌های آموزشی - آکادمی فوتبال افشین پیروانی"
      description="برنامه‌های آموزشی جامع فوتبال برای تمام سنین از 8 تا 30 سال. مربیان حرفه‌ای، امکانات مدرن و روش‌های آموزشی نوین."
      canonical="https://ap-football.com/programs"
      openGraph={{
        title: 'برنامه‌های آموزشی - آکادمی فوتبال افشین پیروانی',
        description:
          'برنامه‌های آموزشی جامع فوتبال برای تمام سنین از 8 تا 30 سال',
        images: [
          {
            url: 'https://ap-football.com/images/programs-og.jpg',
            width: 1200,
            height: 630,
            alt: 'برنامه‌های آموزشی آکادمی فوتبال افشین پیروانی',
          },
        ],
      }}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'keywords',
            content:
              'برنامه آموزشی فوتبال, کلاس فوتبال, آموزش فوتبال کودکان, آموزش فوتبال نوجوانان, آموزش فوتبال بزرگسالان',
          },
        ]}
      />
      <Programs programs={programs} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<
  ProgramsPageProps
> = async () => ({
  props: await withSite({ programs: await getPrograms() }),
});

export default ProgramsPage;
