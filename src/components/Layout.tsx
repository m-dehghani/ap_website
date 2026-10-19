import React from 'react';
import { NextSeo } from 'next-seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/constants/app';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  noindex?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = APP_CONFIG.seo.defaultTitle,
  description = APP_CONFIG.seo.defaultDescription,
  canonical,
  openGraph,
  noindex = false,
}) => {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={canonical}
        noindex={noindex}
        openGraph={{
          type: 'website',
          locale: 'fa_IR',
          site_name: APP_CONFIG.name,
          title: openGraph?.title || title,
          description: openGraph?.description || description,
          images: openGraph?.images || [
            {
              url: `${APP_CONFIG.domain}${APP_CONFIG.seo.ogImage}`,
              width: 1200,
              height: 630,
              alt: APP_CONFIG.name,
            },
          ],
        }}
        twitter={{
          handle: APP_CONFIG.seo.twitterHandle,
          site: APP_CONFIG.seo.twitterHandle,
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[{
            name: 'keywords',
            content: 'فوتبال, آکادمی فوتبال, آموزش فوتبال, تمرین فوتبال, مربی فوتبال, ورزش, تهران',
          },
          {
            name: 'author',
            content: APP_CONFIG.name,
          },
          {
            name: 'robots',
            content: noindex ? 'noindex, nofollow' : 'index, follow',
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0',
          },
        ]}
      />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;