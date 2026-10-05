import Link from 'next/link';
import { CheckCircle2, Clock, Lock, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { planSerif } from '@/components/student/plan/v4/fonts';
import { resourcesData } from '@/lib/plan/pages';
import { pageEnv } from '../_env';

export const metadata = { title: 'Ressources — Mon planning' };

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const fmt = (d: string) => { const [, m, day] = d.split('-').map(Number); return `${day === 1 ? '1er' : day} ${MONTHS[m - 1]}`; };

/**
 * Bibliothèque des coachings du Parcours du Major (§23-§29) : des ressources,
 * jamais des items. Leur publication n'ajoute rien au planning ; le
 * planificateur les propose quand elles servent un besoin du jour.
 */
export default async function RessourcesPage() {
  const env = await pageEnv();
  const { enabled, rows } = await resourcesData(env);
  return (
    <>
      <PlanPageTitle subtitle="Les coachings du Parcours du Major, au service de votre programme." daysLeft={null} />
      {!enabled ? (
        <p className="pl-card mt-[18px] px-5 py-4 text-[14.5px] text-(--pl-text)">Aucune ressource de ce type n’est encore ouverte pour votre préparation ou votre formule.</p>
      ) : (
        <ul className="mt-[18px] grid gap-[12px] md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="pl-card flex gap-3 px-[18px] py-[14px]">
              <span className={cn('grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full', r.state === 'completed' ? 'bg-(--pl-green-bg) text-(--pl-green)' : r.state === 'current' ? 'bg-(--pl-rose-100) text-(--pl-bordeaux)' : 'bg-(--pl-info) text-(--pl-muted)')}>
                {r.state === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : r.state === 'current' ? <PlayCircle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-(--pl-bordeaux)">
                  Coaching {r.numero ?? ''} · {r.type}
                  {r.isNew && <span className="ml-2 rounded-full bg-[#fff1d6] px-2 py-0.5 text-[10.5px] text-[#8a5a14]">Nouveau</span>}
                </p>
                <h2 className={cn(planSerif.className, 'mt-0.5 text-[16.5px] font-bold leading-snug text-(--pl-ink)')}>{r.title}</h2>
                <p className="mt-1 text-[13px] text-(--pl-muted)">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />{r.minutes} min
                  {r.methodology ? ' · méthodologie' : r.items.length > 0 ? ` · ${r.items.slice(0, 3).join(', ')}${r.items.length > 3 ? '…' : ''}` : ''}
                </p>
                <p className="mt-1 text-[13px] text-(--pl-text)">
                  {r.state === 'completed' ? 'Terminé' : r.state === 'current' ? 'Disponible' : r.state === 'locked_date' && r.publishedOn ? `Ouverture le ${fmt(r.publishedOn)}` : 'Terminez le coaching précédent pour le débloquer'}
                </p>
              </div>
              {(r.state === 'current' || r.state === 'completed') && r.numero && (
                <Link href={`/parcours/${r.numero}`} className="self-center rounded-full border border-(--pl-pill) px-3 py-1.5 text-[13px] font-semibold text-(--pl-pill)">{r.state === 'completed' ? 'Revoir' : 'Ouvrir'}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-[16px] text-[12.5px] text-(--pl-muted)">Regarder ou lire un coaching ne modifie jamais votre niveau : seule sa partie évaluative réalisée compte.</p>
    </>
  );
}
