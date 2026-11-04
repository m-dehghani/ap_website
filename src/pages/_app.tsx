import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { DefaultSeo } from 'next-seo';
import { MotionConfig } from 'framer-motion';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SEO from '../next-seo.config';
import { SiteProvider } from '@/lib/site-context';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useThemePreference } from '@/hooks/useThemePreference';
import '@/styles/globals.css';

function AccountThemePreference() {
  const { user, loading } = useAuth();
  const { setThemePreference } = useThemePreference();

  useEffect(() => {
    if (!loading && user) {
      setThemePreference(user.themePreference ?? 'system');
    }
  }, [loading, setThemePreference, user]);

  return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  useThemePreference();

  return (
    <SiteProvider value={pageProps.site ?? null}>
      <AuthProvider>
        <AccountThemePreference />
        <MotionConfig reducedMotion="user">
          <DefaultSeo {...SEO} />
          <Component {...pageProps} />
          <SpeedInsights />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
            background: 'var(--surface-background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              style: {
                borderColor: '#10b981',
              backgroundColor: 'var(--surface-success)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                borderColor: '#ef4444',
                backgroundColor: 'var(--surface-error)',
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
