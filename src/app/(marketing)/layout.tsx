import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-manus relative isolate flex min-h-screen flex-col bg-(--color-surface) font-sans text-(--color-ink)">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
