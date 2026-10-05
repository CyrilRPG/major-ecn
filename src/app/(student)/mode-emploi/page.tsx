import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Compass, Lock, RotateCcw } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { CHECKUP_STUDENT_ENABLED, PEDAGO_ENGINE_STUDENT_ENABLED, PLAN_STUDENT_ENABLED, SUIVI_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { planAvailableFor } from '@/lib/plan/service';
import { chargerPriseEnMain } from '@/lib/student/prise-en-main';
import { FAMILLES, ORDRE_MENU, RUBRIQUES, type RubriqueCle } from '@/lib/student/rubriques';
import { Panel, SectionTitle, StudentHero, StudentPage, heroGhost } from '@/components/student/ui/page-kit';
import { BoutonTutoriel } from '@/components/student/guide/bouton-tutoriel';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Mode d’emploi' };
export const dynamic = 'force-dynamic';

/** La boucle pédagogique, étape par étape (rubriques : registre lib/student/rubriques). */
const BOUCLE_DETAIL: { titre: string; texte: string; auto: string; rubriques: RubriqueCle[] }[] = [
  {
    titre: 'Mesurer',
    texte: 'Un EVC Check-up chronométré situe votre niveau, item par item. Ensuite, chaque question que vous faites précise la mesure.',
    auto: 'Vos lacunes sont repérées sans rien avoir à noter.',
    rubriques: ['checkup'],
  },
  {
    titre: 'Prioriser',
    texte: 'Chaque item reçoit un état : à revoir, à consolider, en bonne voie, maîtrisé — avec sa raison.',
    auto: 'Une erreur déclenche toujours du travail ; deux difficultés distinctes signalent une lacune.',
    rubriques: ['priorites'],
  },
  {
    titre: 'Planifier',
    texte: 'Le planning répartit le travail jusqu’à l’EVC selon vos disponibilités ; l’accueil en tire votre programme du jour.',
    auto: 'Le programme se réorganise tout seul après vos résultats.',
    rubriques: ['planning', 'accueil'],
  },
  {
    titre: 'Réviser et s’entraîner',
    texte: 'Révisions ciblées sur vos items à revoir, révision transversale du jour, entraînement sur vos erreurs, épreuves blanches, méthodologie.',
    auto: 'Chaque réponse repart dans la boucle et met à jour vos priorités.',
    rubriques: ['transversales', 'entrainement', 'epreuves', 'parcours'],
  },
];

const JOURNEE: { titre: string; texte: string }[] = [
  { titre: 'Ouvrez l’accueil', texte: 'Votre programme du jour est prêt, avec sa durée ; une alerte vous prévient si votre rythme décroche.' },
  { titre: 'Commencez votre journée', texte: 'Le bouton « Commencer ma journée » ouvre la première activité ; chaque activité dit pourquoi elle est là.' },
  { titre: 'Faites la révision du jour', texte: '15 à 25 minutes de révision transversale pour entretenir les spécialités déjà étudiées.' },
  { titre: 'Le soir, rien à faire', texte: 'Tout est enregistré : priorités et planning se réorganisent pour demain. Pas le temps ? « Reporter le reste » dans Mon planning.' },
];

const APRES_ERREUR: string[] = [
  'Vous ratez une question sur un item.',
  'Une révision est proposée ; deux difficultés distinctes font passer l’item « À revoir en priorité ».',
  'La révision ciblée arrive dans votre programme du jour et dans votre planning.',
  'Réussie, l’item remonte ; des réactivations à J+7, J+14, J+30 et J+60 le consolident.',
];

/**
 * Mode d'emploi de la plateforme : la boucle pédagogique, la journée type,
 * ce qui se passe après une erreur, les premiers pas de l'élève (état réel)
 * et chaque rubrique expliquée (registre lib/student/rubriques).
 */
export default async function ModeEmploiPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const decouverte = scope.offer === 'decouverte' && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  const staff = profile.role !== 'student';
  const engine = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED) && !decouverte;
  const checkup = moteurOuvert(profile, CHECKUP_STUDENT_ENABLED) && !decouverte;
  const [planning, parcours] = await Promise.all([
    staff ? Promise.resolve(true) : PLAN_STUDENT_ENABLED ? planAvailableFor(profile.permission_scope).catch(() => false) : Promise.resolve(false),
    staff ? Promise.resolve(true) : fetchContentAccessForScope(scope).then((a) => a.parcoursMajor && hasMedecineGeneraleAccess(profile.permission_scope)).catch(() => false),
  ]);
  const premiersPas = !staff && !decouverte
    ? await chargerPriseEnMain(user.id, {
      tutorielVu: !!(profile as { tutoriel_video_vu_at?: string | null }).tutoriel_video_vu_at,
      ouverts: { checkup, moteur: engine, planning },
      toujours: true,
    }).catch(() => null)
    : null;

  const ouverte = (cle: RubriqueCle): boolean => {
    switch (cle) {
      case 'planning': return planning;
      case 'priorites': return PEDAGO_ENGINE_STUDENT_ENABLED || staff;
      case 'checkup': return CHECKUP_STUDENT_ENABLED || staff;
      case 'parcours': return parcours;
      case 'rendez-vous': return SUIVI_STUDENT_ENABLED && !decouverte;
      default: return true;
    }
  };
  const verrouillee = (cle: RubriqueCle) => decouverte && cle !== 'accueil' && cle !== 'parcours' && cle !== 'mode-emploi';

  return (
    <StudentPage>
      <StudentHero
        icon={Compass}
        eyebrow="Mode d’emploi"
        title="Comment fonctionne Major ECN"
        subtitle="Une boucle simple : mesurer, prioriser, planifier, réviser. Chaque résultat la relance, et votre préparation s’ajuste toute seule."
        actions={<BoutonTutoriel className={heroGhost} />}
      />

      {/* La boucle */}
      <section aria-labelledby="me-boucle" className="space-y-4">
        <SectionTitle id="me-boucle" eyebrow="La méthode" title="Une boucle, quatre gestes" description="Vous n’avez rien à paramétrer : chaque étape alimente la suivante." />
        <ol className="grid gap-3 lg:grid-cols-4">
          {BOUCLE_DETAIL.map((b, i) => (
            <li key={b.titre} className="relative flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#E4002B,#F97316)] font-(family-name:--font-jakarta) text-[15px] font-extrabold text-white shadow-[0_8px_18px_-10px_rgba(228,0,43,0.9)]">{i + 1}</span>
                <span className="font-(family-name:--font-jakarta) text-[17px] font-extrabold text-[#14254E]">{b.titre}</span>
              </span>
              <p className="mt-2.5 text-[13px] leading-relaxed text-(--color-ink-soft)">{b.texte}</p>
              <p className="mt-2 rounded-lg bg-[#FDF4F5] px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-[#8B0E22]">{b.auto}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {b.rubriques.filter(ouverte).map((cle) => {
                  const r = RUBRIQUES[cle];
                  return verrouillee(cle) ? (
                    <span key={cle} className="inline-flex items-center gap-1 rounded-full bg-(--color-surface-soft) px-2.5 py-1 text-[11.5px] font-semibold text-(--color-ink-muted)"><Lock className="h-3 w-3" aria-hidden /> {r.label}</span>
                  ) : (
                    <Link key={cle} href={r.href} className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2.5 py-1 text-[11.5px] font-semibold text-[#14254E] transition-colors hover:border-[#C0112E]/40 hover:bg-[#FDF4F5] focus-ring">
                      <r.Icon className="h-3.5 w-3.5 text-[#8B0E22]" aria-hidden /> {r.label}
                    </Link>
                  );
                })}
              </div>
              {i < BOUCLE_DETAIL.length - 1 && (
                <span aria-hidden className="absolute -right-[13px] top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white text-[#C0112E] shadow-(--shadow-soft) ring-1 ring-(--color-border) lg:grid">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-2.5 rounded-2xl bg-[linear-gradient(90deg,#0E1626_0%,#2A1130_60%,#2D0518_100%)] px-4 py-3 text-[13px] font-medium text-white/85">
          <RotateCcw className="h-4 w-4 shrink-0 text-[#F5C84B]" aria-hidden />
          Vos résultats repartent dans la boucle : vos priorités se mettent à jour, votre planning et votre programme du jour suivent.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Journée type */}
        <Panel aria-labelledby="me-journee">
          <SectionTitle id="me-journee" eyebrow="Au quotidien" title="Votre journée type" />
          <ol className="mt-4 space-y-3">
            {JOURNEE.map((j, i) => (
              <li key={j.titre} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FDF4F5] text-[12px] font-black text-[#8B0E22]">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#14254E]">{j.titre}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-(--color-ink-soft)">{j.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Après une erreur */}
        <Panel aria-labelledby="me-erreur">
          <SectionTitle id="me-erreur" eyebrow="Un exemple" title="Ce qui se passe après une erreur" />
          <ol className="mt-4 space-y-2">
            {APRES_ERREUR.map((t, i) => (
              <li key={t} className="relative flex gap-3 pb-2">
                <span className={cn('relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-black', i === APRES_ERREUR.length - 1 ? 'bg-green-600 text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) ring-1 ring-(--color-border)')}>
                  {i === APRES_ERREUR.length - 1 ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {i < APRES_ERREUR.length - 1 && <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-12px)] w-0.5 bg-(--color-border)" />}
                <p className="pt-1 text-[13px] leading-relaxed text-(--color-ink)">{t}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Premiers pas (état réel) */}
      {premiersPas && (
        <Panel aria-labelledby="me-premiers-pas">
          <SectionTitle
            id="me-premiers-pas"
            eyebrow="Vos premiers pas"
            title={premiersPas.terminee ? 'Prise en main terminée, bravo !' : `Prise en main : ${premiersPas.faites}/${premiersPas.total}`}
            description="Les étapes se cochent d’elles-mêmes, d’après ce que vous avez réellement fait."
          />
          <ol className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {premiersPas.etapes.map((e, i) => (
              <li key={e.cle} className={cn('flex flex-col rounded-xl border p-3', e.fait ? 'border-green-200 bg-green-50/60' : 'border-(--color-border) bg-(--color-surface)')}>
                <p className="flex items-center gap-2">
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black', e.fait ? 'bg-green-600 text-white' : 'bg-[linear-gradient(135deg,#E4002B,#F97316)] text-white')}>
                    {e.fait ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                  </span>
                  <span className="text-sm font-bold text-[#14254E]">{e.titre}</span>
                  {e.fait && <span className="sr-only">(fait)</span>}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-snug text-(--color-ink-soft)">{e.pourquoi}</p>
                {!e.fait && (e.href ? (
                  <Link href={e.href} className="mt-auto inline-flex items-center gap-1 pt-2 text-[12.5px] font-bold text-[#C0112E] hover:underline">{e.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
                ) : (
                  <BoutonTutoriel className="mt-auto inline-flex items-center gap-1 pt-2 text-left text-[12.5px] font-bold text-[#C0112E] hover:underline">{e.cta}</BoutonTutoriel>
                ))}
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {/* Toutes les rubriques */}
      <section aria-labelledby="me-rubriques" className="space-y-5">
        <SectionTitle id="me-rubriques" eyebrow="Le menu" title="Toutes les rubriques, à quoi elles servent" description="Le menu est rangé comme votre méthode : piloter, s’entraîner, et vos outils." />
        {FAMILLES.map((f) => {
          const cles = ORDRE_MENU[f.cle].filter((c) => c !== 'mode-emploi' && ouverte(c));
          if (cles.length === 0) return null;
          return (
            <div key={f.cle}>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B0E22]">{f.titre}</h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cles.map((cle) => {
                  const r = RUBRIQUES[cle];
                  const verrou = verrouillee(cle);
                  const corps = (
                    <>
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FDF4F5] text-[#8B0E22]"><r.Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                        <span className="min-w-0 flex-1 font-(family-name:--font-jakarta) text-[15px] font-extrabold text-[#14254E]">{r.label}</span>
                        {verrou ? <Lock className="h-4 w-4 shrink-0 text-(--color-ink-muted)" aria-label="Réservé aux formules" /> : <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" aria-hidden />}
                      </span>
                      <span className="mt-2 block text-[13px] leading-relaxed text-(--color-ink-soft)">{r.role}</span>
                      <span className="mt-2 block text-[12px] leading-snug text-(--color-ink-muted)"><strong className="font-semibold text-(--color-ink-soft)">Quand :</strong> {r.quand}</span>
                    </>
                  );
                  return (
                    <li key={cle}>
                      {verrou ? (
                        <div className="flex h-full flex-col rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-4 opacity-80">{corps}</div>
                      ) : (
                        <Link href={r.href} className="group flex h-full flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-[#C0112E]/30 hover:shadow-(--shadow-lifted) focus-ring">{corps}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </StudentPage>
  );
}
