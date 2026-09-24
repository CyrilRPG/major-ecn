import Link from 'next/link';
import { Eye, Megaphone } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { chargerAnnonces } from '@/lib/annonces/server';
import { collegesVises } from '@/lib/annonces/concours';
import { AnnouncementsWidget } from '@/components/student/announcements-widget';
import type { PermissionScope } from '@/types/domain';
import { FichesConcours, type LigneFiche } from './fiches-concours';
import { MessagesAnnonces, type LigneMessage } from './messages-annonces';
import { AnciensBlocs } from './anciens-blocs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Annonces' };

type SearchParams = { apercu?: string; voie?: string; formule?: string };

/**
 * Annonces de l'accueil (refonte du 24/09/2026) : des fiches concours par
 * spécialité (structure commune, on ne saisit que ce qui change), des
 * messages libres à l'audience explicite, et un aperçu exact de ce que voit
 * un élève donné.
 */
export default async function AdminAnnoncesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const d = await chargerAnnonces(createAdminClient(), { messagesMasques: true });
  const specialites = d.specialites.map((s) => ({ id: s.id, nom: s.nom }));
  const nomDe = new Map(specialites.map((s) => [s.id, s.nom]));
  const ordre = new Map(specialites.map((s, i) => [s.id, i]));

  const lignes: LigneFiche[] = [...d.fiches.entries()]
    .map(([id, fiche]) => ({ id, nom: nomDe.get(id) ?? id, fiche, heritee: d.heritees.has(id) }))
    .sort((a, b) => (ordre.get(a.id) ?? 999) - (ordre.get(b.id) ?? 999));

  const messages: LigneMessage[] = d.messages.map((m) => ({
    id: m.id, title: m.title, badge_label: m.badge_label, badge_tone: m.badge_tone, icon_key: m.icon_key, visible: m.visible,
    data: m.data, min_offer: m.min_offer, target_scope: m.target_scope, target_colleges: m.target_colleges, voies: m.voies,
  }));

  const anciens = d.anciensBlocs.map((b) => {
    const cs = collegesVises(b);
    return { id: b.id, kind: b.kind, title: b.title, cible: cs.length ? cs.map((c) => nomDe.get(c) ?? c).join(', ') : 'Tous les élèves' };
  });

  // Aperçu : l'accueil d'un élève fictif (spécialité, voie, formule).
  const apercu = sp.apercu ?? (lignes[0]?.id ?? 'all');
  const voie = sp.voie === 'interne' || sp.voie === 'externe' ? sp.voie : null;
  const formule = (['decouverte', 'essentiel', 'intensif', 'approfondi'] as const).find((f) => f === sp.formule) ?? 'intensif';
  const scopeApercu: PermissionScope = apercu === 'all'
    ? { type: 'all', offer: formule, voie }
    : { type: 'college', colleges: [apercu], offer: formule, voie };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Megaphone className="h-5 w-5 text-(--color-primary)" /> Annonces de l’accueil
        </h1>
        <p className="mt-0.5 max-w-3xl text-sm text-(--color-ink-soft)">
          Deux choses seulement : les <strong>fiches concours</strong> (une par spécialité, mises en forme automatiquement)
          et les <strong>messages</strong> ponctuels. L’aperçu à droite montre exactement ce que voit l’élève choisi.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-10">
          <AnciensBlocs blocs={anciens} heritees={d.heritees.size} sections={d.anciennesSections} />
          <FichesConcours lignes={lignes} specialites={specialites} />
          <MessagesAnnonces messages={messages} specialites={specialites} />
        </div>

        <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><Eye className="h-4 w-4 text-(--color-primary)" /> Aperçu élève</h2>
          <form className="grid gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 text-sm" method="get">
            <select name="apercu" defaultValue={apercu} className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5">
              <option value="all">Accès intégral (toutes spécialités)</option>
              {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select name="voie" defaultValue={voie ?? ''} className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5">
                <option value="">Voie non renseignée</option>
                <option value="externe">Voie externe</option>
                <option value="interne">Voie interne</option>
              </select>
              <select name="formule" defaultValue={formule} className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-1.5">
                <option value="decouverte">Découverte</option>
                <option value="essentiel">Essentielle</option>
                <option value="intensif">Intensive</option>
                <option value="approfondi">Approfondie</option>
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-(--color-ink) px-3 py-1.5 text-xs font-bold text-white">Voir l’accueil de cet élève</button>
          </form>
          <div className="rounded-2xl bg-(--color-surface-soft) p-2">
            <AnnouncementsWidget scope={scopeApercu} donnees={d} />
          </div>
          <p className="text-[11px] text-(--color-ink-muted)">
            L’aperçu se met à jour après chaque enregistrement. <Link href="/admin/annonces" className="underline">Réinitialiser</Link>
          </p>
        </aside>
      </div>
    </main>
  );
}
