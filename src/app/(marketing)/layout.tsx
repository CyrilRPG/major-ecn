import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { GuidePopup } from '@/components/marketing/guide-popup';
import { FloatingLauncher } from '@/components/marketing/profil-evc/floating-launcher';
import { ProfilPopup } from '@/components/marketing/profil-evc/profil-popup';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/seo/json-ld';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-manus relative isolate flex min-h-screen flex-col overflow-x-hidden bg-(--color-surface) font-sans text-(--color-ink)">
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      {/* Lanceur flottant unique (speed-dial) : déploie Guide + Profil EVC. */}
      <FloatingLauncher />
      {/* Popup du guide méthodologie — monté pour écouter l'événement
          open-guide-popup (boutons « Télécharger »). Auto-affichage désactivé. */}
      <GuidePopup />
      {/* Popup du diagnostic « Profil EVC » — auto-déclenché (exit-intent +
          scroll 55%) et ouvrable via l'événement open-profil-popup. */}
      <ProfilPopup />
    </div>
  );
}
