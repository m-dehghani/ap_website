import { createContext, useContext } from 'react';
import { SiteInfoViewModel } from '@/types/viewModels/site';

const SiteContext = createContext<SiteInfoViewModel | null>(null);

export const SiteProvider = SiteContext.Provider;

// Null on pages without getServerSideProps (e.g. the 404 page); render fallbacks then.
export function useSite(): SiteInfoViewModel | null {
  return useContext(SiteContext);
}
