import Link from 'next/link';
import { redirect } from 'next/navigation';
import { acteurBackOffice, fileModeration, peut } from '@/lib/echanges/serveur/admin';
import type { Capacite } from '@/lib/echanges/regles';
import { FileValidation } from '@/components/admin/echanges/moderation/file-validation';
import { Signalements } from '@/components/admin/echanges/moderation/signalements';
import { Blocages } from '@/components/admin/echanges/moderation/blocages';
import { Mesures } from '@/components/admin/echanges/moderation/mesures';
import { PanneauRgpd } from '@/components/admin/echanges/moderation/panneau-rgpd';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Onglet = 'validation' | 'signalements' | 'blocages' | 'mesures' | 'rgpd';

const ONGLETS: { id: Onglet; label: string; requis: Capacite[] }[] = [
  { id: 'validation', label: 'File de validation', requis: ['moderer'] },
  { id: 'signalements', label: 'Signalements', requis: ['signalements'] },
  { id: 'blocages', label: 'Tentatives bloquées', requis: ['moderer'] },
  { id: 'mesures', label: 'Mesures en cours', requis: ['sanctionner', 'moderer', 'signalements'] },
  { id: 'rgpd', label: 'RGPD', requis: ['rgpd'] },
];

/** Instant de référence du rendu (mesures échues). */
const instant = () => Date.now();

/**
 * Modération des Échanges (CDC §45-57, §95, §135-140) : file de validation,
 * signalements, tentatives bloquées, mesures en cours et, pour le Super
 * Admin, droits RGPD. Un modérateur restreint ne voit que ses promotions.
 */
export default async function ModerationPage({ searchParams }: { searchParams: Promise<{ onglet?: string; historique?: string }> }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'moderer') && !peut(a, 'signalements')) redirect('/admin/echanges');

  const sp = await searchParams;
  const disponibles = ONGLETS.filter((o) => o.requis.some((c) => peut(a, c)));
  const onglet = disponibles.find((o) => o.id === sp.onglet)?.id ?? disponibles[0].id;
  const historique = sp.historique === '1';
  const file = await fileModeration(a, { historique });
  const capacites = [...a.capacites];

  const compteurs: Partial<Record<Onglet, number>> = {
    validation: file.enAttente.length,
    signalements: historique ? undefined : file.signalements.length,
    blocages: historique ? undefined : file.blocages.length,
    mesures: file.sanctions.length,
  };

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-1.5" aria-label="Rubriques de modération">
        {disponibles.map((o) => {
          const actif = o.id === onglet;
          const n = compteurs[o.id];
          const qs = new URLSearchParams({ onglet: o.id });
          if (historique && (o.id === 'signalements' || o.id === 'blocages')) qs.set('historique', '1');
          return (
            <Link
              key={o.id}
              href={`/admin/echanges/moderation?${qs.toString()}`}
              aria-current={actif ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors focus-ring',
                actif ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)',
              )}
            >
              {o.label}
              {typeof n === 'number' && n > 0 && (
                <span className={cn('rounded-full px-1.5 text-[11.5px] font-semibold', actif ? 'bg-white/20 text-white' : 'bg-(--color-primary-soft) text-(--color-primary)')}>{n}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {onglet === 'validation' && <FileValidation messages={file.enAttente} peutModerer={peut(a, 'moderer')} />}
      {onglet === 'signalements' && (
        <Signalements signalements={file.signalements} historique={historique} peutTraiter={peut(a, 'signalements')} capacites={capacites} />
      )}
      {onglet === 'blocages' && <Blocages blocages={file.blocages} historique={historique} peutModerer={peut(a, 'moderer')} />}
      {onglet === 'mesures' && <Mesures mesures={file.sanctions} peutSanctionner={peut(a, 'sanctionner')} maintenant={instant()} />}
      {onglet === 'rgpd' && <PanneauRgpd />}
    </div>
  );
}
