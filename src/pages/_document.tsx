import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fa-IR" dir="rtl">
      <Head>
        <meta name="theme-color" content="#0284c7" />
        <meta
          name="description"
          content="آکادمی فوتبال افشین پیروانی - بهترین آموزش فوتبال برای همه سنین"
        />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Google Fonts for Persian */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="آکادمی فوتبال افشین پیروانی" />
        <meta
          name="keywords"
          content="فوتبال, آکادمی فوتبال, آموزش فوتبال, تمرین فوتبال, مربی فوتبال, ورزش"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="آکادمی فوتبال افشین پیروانی" />
        <meta
          property="og:description"
          content="بهترین آموزش فوتبال برای همه سنین"
        />
        <meta property="og:site_name" content="آکادمی فوتبال افشین پیروانی" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="آکادمی فوتبال افشین پیروانی" />
        <meta
          property="twitter:description"
          content="بهترین آموزش فوتبال برای همه سنین"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsActivityLocation',
              name: 'آکادمی فوتبال افشین پیروانی',
              description: 'بهترین آموزش فوتبال برای همه سنین',
              sport: 'فوتبال',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'شیراز',
                addressCountry: 'IR',
              },
            }),
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
