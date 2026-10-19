import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { DefaultSeo } from 'next-seo';
import { MotionConfig } from 'framer-motion';
import SEO from '../next-seo.config';
import { SiteProvider } from '@/lib/site-context';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SiteProvider value={pageProps.site ?? null}>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                borderColor: '#10b981',
                backgroundColor: '#f0fdf4',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                borderColor: '#ef4444',
                backgroundColor: '#fef2f2',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
          />
        </MotionConfig>
      </AuthProvider>
    </SiteProvider>
  );
}

export default MyApp;
