import { SiteChrome } from '@/components/layout/site-chrome';

/** Layout for every public page (marketing + shop + account). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
