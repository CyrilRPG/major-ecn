import Link from 'next/link';
import { LIBELLES_SOURCES, type IndicateursVideo } from '@/lib/marketing/video-evenements';

/**
 * Onglet « Vidéo de présentation » : les trois indicateurs demandés par le
 * client (clics sur Play par source, taux de visionnage complet, taux
 * d'inscription à l'espace découverte après visionnage), sur une période
 * choisie, avec une petite courbe quotidienne. Rendu serveur, aucune donnée
 * personnelle (visiteurs anonymes).
 */

export const PERIODES = [
  { cle: '7', libelle: '7 jours', jours: 7 },
  { cle: '30', libelle: '30 jours', jours: 30 },
  { cle: '90', libelle: '90 jours', jours: 90 },
  { cle: 'tout', libelle: 'Tout', jours: null },
] as const;

const pct = (t: number | null) => (t == null ? '—' : `${(t * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`);

function Carte({ titre, valeur, detail }: { titre: string; valeur: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">{titre}</p>
      <p className="mt-2 text-3xl font-black tabular-nums text-(--color-ink)">{valeur}</p>
      <p className="mt-1 text-xs text-(--color-ink-soft)">{detail}</p>
    </div>
  );
}

/** Courbe quotidienne : lectures (bordeaux) et visionnages complets (bleu nuit). */
function Courbe({ jours }: { jours: IndicateursVideo['parJour'] }) {
  if (jours.length < 2) return <p className="text-xs text-(--color-ink-muted)">Pas encore assez de jours pour tracer une courbe.</p>;
  const L = 720;
  const H = 140;
  const max = Math.max(1, ...jours.map((j) => Math.max(j.lectures, j.clics)));
  const x = (i: number) => (i / (jours.length - 1)) * (L - 20) + 10;
  const y = (v: number) => H - 16 - (v / max) * (H - 32);
  const trace = (k: 'lectures' | 'complets' | 'clics') => jours.map((j, i) => `${x(i)},${y(j[k])}`).join(' ');
  return (
    <figure>
      <svg viewBox={`0 0 ${L} ${H}`} className="h-40 w-full" role="img" aria-label="Clics, lectures et visionnages complets par jour">
        <line x1="10" x2={L - 10} y1={H - 16} y2={H - 16} stroke="currentColor" className="text-(--color-border)" />
        <polyline points={trace('clics')} fill="none" stroke="#C9CED9" strokeWidth="2" />
        <polyline points={trace('lectures')} fill="none" stroke="#C0112E" strokeWidth="2.5" />
        <polyline points={trace('complets')} fill="none" stroke="#14254E" strokeWidth="2.5" />
        <text x="10" y={H - 2} fontSize="11" fill="#7A8499">{jours[0].jour}</text>
        <text x={L - 10} y={H - 2} fontSize="11" fill="#7A8499" textAnchor="end">{jours.at(-1)!.jour}</text>
        <text x="10" y="12" fontSize="11" fill="#7A8499">max {max}</text>
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-4 text-xs text-(--color-ink-soft)">
        <span><span className="mr-1 inline-block h-2 w-3 rounded-sm bg-[#C9CED9] align-middle" />Clics sur Play</span>
        <span><span className="mr-1 inline-block h-2 w-3 rounded-sm bg-[#C0112E] align-middle" />Lectures</span>
        <span><span className="mr-1 inline-block h-2 w-3 rounded-sm bg-[#14254E] align-middle" />Visionnages complets</span>
      </figcaption>
    </figure>
  );
}

export function IndicateursVideoPanneau({ ind, periode, erreur }: { ind: IndicateursVideo; periode: string; erreur: string | null }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-bold text-(--color-ink)">Période</span>
        {PERIODES.map((p) => (
          <Link
            key={p.cle}
            href={`/admin/calendrier-evc?onglet=video&periode=${p.cle}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${periode === p.cle ? 'bg-(--color-ink) text-white' : 'border border-(--color-border) text-(--color-ink-soft)'}`}
          >
            {p.libelle}
          </Link>
        ))}
      </div>
      {erreur && <p className="rounded-lg bg-[#FDECEC] px-3 py-2 text-sm text-[#B91C1C]">Lecture des événements impossible : {erreur}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Carte titre="Clics sur Play" valeur={String(ind.clicsPlay)} detail={`${ind.lectures} lecture(s) effectivement démarrée(s)`} />
        <Carte titre="Taux de visionnage complet" valeur={pct(ind.tauxComplet)} detail={`${ind.visiteursComplet} visiteur(s) jusqu’à la fin / ${ind.visiteursPlay} ayant lancé la vidéo`} />
        <Carte titre="Inscription après visionnage" valeur={pct(ind.tauxInscription)} detail={`${ind.visiteursInscrits} inscrit(s) à l’espace découverte / ${ind.visiteursPlay} ayant lancé la vidéo`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h3 className="text-sm font-bold text-(--color-ink)">Clics sur Play par source</h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {ind.clicsParSource.map((s) => (
                <tr key={s.source} className="border-b border-(--color-border) last:border-0">
                  <td className="py-2 text-(--color-ink-soft)">{LIBELLES_SOURCES[s.source]}</td>
                  <td className="py-2 text-right font-bold tabular-nums text-(--color-ink)">{s.clics}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="mt-5 text-sm font-bold text-(--color-ink)">Progression (visiteurs distincts)</h3>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {([['25 %', ind.paliers.p25], ['50 %', ind.paliers.p50], ['75 %', ind.paliers.p75], ['Fin', ind.visiteursComplet]] as const).map(([l, v]) => (
                <tr key={l} className="border-b border-(--color-border) last:border-0">
                  <td className="py-2 text-(--color-ink-soft)">A atteint {l}</td>
                  <td className="py-2 text-right font-bold tabular-nums text-(--color-ink)">{v}</td>
                </tr>
              ))}
              <tr><td className="py-2 text-(--color-ink-soft)">Clics sur le bouton de fin</td><td className="py-2 text-right font-bold tabular-nums text-(--color-ink)">{ind.clicsFin}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h3 className="mb-3 text-sm font-bold text-(--color-ink)">Par jour (heure de Paris)</h3>
          <Courbe jours={ind.parJour} />
        </div>
      </div>
      <p className="text-[11px] text-(--color-ink-muted)">
        Taux calculés en visiteurs distincts (identifiant aléatoire du navigateur, aucune donnée personnelle). Une inscription
        compte si elle suit la première lecture du même navigateur. Sources : hero (image ou lien « Découvrir la
        plateforme »), page /visite-guidee, et /visite-guidee ouverte depuis un e-mail (lien avec jeton d’accès).
      </p>
    </div>
  );
}
