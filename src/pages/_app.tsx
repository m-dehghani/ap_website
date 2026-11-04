import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { DefaultSeo } from 'next-seo';
import { MotionConfig } from 'framer-motion';
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
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              ariaProps: {
                role: 'status',
                'aria-live': 'polite',
              },
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
                  borderColor: 'var(--accent-color)',
                  backgroundColor: 'var(--surface-success)',
                },
                iconTheme: {
                  primary: 'var(--accent-color)',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  borderColor: 'var(--primary-color)',
                  backgroundColor: 'var(--surface-error)',
                },
                iconTheme: {
                  primary: 'var(--primary-color)',
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
