import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { GuidePopup } from '@/components/marketing/guide-popup';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/json-ld';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-manus relative isolate flex min-h-screen flex-col bg-(--color-surface) font-sans text-(--color-ink)">
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <GuidePopup />
    </div>
  );
}
