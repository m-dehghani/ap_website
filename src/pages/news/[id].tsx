import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import Layout from '@/components/Layout';
import VideoPlayer from '@/components/VideoPlayer';
import { getPublishedNewsArticleById } from '@/services/content';
import type { NewsArticleViewModel } from '@/types/viewModels/content';
import { withSite, type SiteProps } from '@/lib/page-props';

interface NewsArticlePageProps extends SiteProps {
  article: NewsArticleViewModel;
}

export const getServerSideProps: GetServerSideProps<
  NewsArticlePageProps
> = async ({ params }) => {
  const id = params?.id;
  if (typeof id !== 'string' || id.length === 0) {
    return { notFound: true };
  }

  const article = await getPublishedNewsArticleById(id);
  if (!article) return { notFound: true };

  return {
    props: await withSite({ article }),
  };
};

export default function NewsArticlePage({
  article,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <NextSeo
        title={article.title}
        description={article.excerpt}
        openGraph={{
          type: 'article',
          title: article.title,
          description: article.excerpt,
        }}
      />
      <main className="container-custom py-10 sm:py-14">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <Link
            href="/news"
            className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-primary-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          >
            بازگشت به اخبار
          </Link>
          {article.image && (
            <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={article.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}
          <header className="mb-8">
            <h1 className="text-2xl font-bold leading-relaxed text-slate-900 sm:text-3xl">
              {article.title}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              {article.publishedAt.slice(0, 10)} · {article.author}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-slate-700">
              {article.excerpt}
            </p>
          </header>
          <VideoPlayer
            title={article.title}
            uploadedVideoUrl={article.uploadedVideoUrl}
            aparatVideoUrl={article.aparatVideoUrl}
          />
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-800">
            {article.content}
          </div>
        </article>
      </main>
    </Layout>
  );
}
