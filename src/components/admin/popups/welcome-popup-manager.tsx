'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveWelcomePopupAction, deleteWelcomePopupAction } from '@/app/admin/popups/welcome-actions';
import { WELCOME_PAR_DEFAUT } from '@/lib/student/welcome';

export type WelcomeConfigRow = {
  id: string;
  collegeId: string | null;
  active: boolean;
  titre: string;
  accroche: string;
  intro: string;
  demarrageActif: boolean;
  demarrageIntro: string;
  demarrageColleges: string[];
};

export type CollegeOption = { id: string; nom: string };

/**
 * Popup d'accueil « Bienvenue sur Major ECN » : une configuration par défaut,
 * et autant de variantes que de spécialités. Chaque élève reçoit celle de sa
 * spécialité si elle existe, sinon celle par défaut.
 */
export function WelcomePopupManager({
  configs,
  colleges,
}: {
  configs: WelcomeConfigRow[];
  colleges: CollegeOption[];
}) {
  const [creation, setCreation] = useState(false);
  const dejaConfigures = new Set(configs.map((c) => c.collegeId));
  const disponibles = colleges.filter((c) => !dejaConfigures.has(c.id));

  return (
    <div className="space-y-4">
      {configs.length === 0 && !creation && (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune configuration : le popup d’origine s’affiche pour tout le monde.
        </p>
      )}

      {configs.map((c) => (
        <Carte
          key={c.id}
          config={c}
          colleges={colleges}
          collegesDisponibles={disponibles}
          onFini={() => setCreation(false)}
        />
      ))}

      {creation ? (
        <Carte
          config={{
            id: '',
            collegeId: disponibles[0]?.id ?? null,
            active: true,
            titre: WELCOME_PAR_DEFAUT.titre,
            accroche: WELCOME_PAR_DEFAUT.accroche,
            intro: WELCOME_PAR_DEFAUT.intro,
            demarrageActif: true,
            demarrageIntro: WELCOME_PAR_DEFAUT.demarrageIntro,
            demarrageColleges: [],
          }}
          colleges={colleges}
          collegesDisponibles={disponibles}
          nouvelle
          onFini={() => setCreation(false)}
        />
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setCreation(true)}>
          <Plus />
          {configs.some((c) => c.collegeId === null) ? 'Ajouter une spécialité' : 'Ajouter une configuration'}
        </Button>
      )}
    </div>
  );
}

function Carte({
  config, colleges, collegesDisponibles, nouvelle = false, onFini,
}: {
  config: WelcomeConfigRow;
  colleges: CollegeOption[];
  collegesDisponibles: CollegeOption[];
  nouvelle?: boolean;
  onFini: () => void;
}) {
  const router = useRouter();
  const [etat, setEtat] = useState<WelcomeConfigRow>(config);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const set = <K extends keyof WelcomeConfigRow>(k: K, v: WelcomeConfigRow[K]) => {
    setOk(false);
    setEtat((prev) => ({ ...prev, [k]: v }));
  };

  function enregistrer() {
    setError(null);
    start(async () => {
      const res = await saveWelcomePopupAction({
        id: etat.id || null,
        collegeId: etat.collegeId,
        active: etat.active,
        titre: etat.titre,
        accroche: etat.accroche,
        intro: etat.intro,
        demarrageActif: etat.demarrageActif,
        demarrageIntro: etat.demarrageIntro,
        demarrageColleges: etat.demarrageColleges,
      });
      if ('error' in res) return setError(res.error);
      setOk(true);
      onFini();
      router.refresh();
    });
  }

  function supprimer() {
    if (!etat.id) { onFini(); return; }
    if (!confirm('Supprimer cette configuration ?')) return;
    start(async () => {
      const res = await deleteWelcomePopupAction(etat.id);
      if ('error' in res) return setError(res.error);
      router.refresh();
    });
  }

  const nomCollege = etat.collegeId
    ? colleges.find((c) => c.id === etat.collegeId)?.nom ?? etat.collegeId
    : 'Par défaut (toutes les autres spécialités)';

  const champ = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm';

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {nouvelle ? (
          <select
            value={etat.collegeId ?? ''}
            onChange={(e) => set('collegeId', e.target.value || null)}
            className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm font-semibold"
          >
            <option value="">Par défaut (toutes les autres spécialités)</option>
            {collegesDisponibles.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-bold text-(--color-ink)">{nomCollege}</p>
        )}
        <label className="flex items-center gap-2 text-sm text-(--color-ink)">
          <input
            type="checkbox"
            checked={etat.active}
            onChange={(e) => set('active', e.target.checked)}
            className="h-4 w-4 accent-(--color-primary)"
          />
          Afficher le popup
        </label>
      </div>

      <div className="space-y-2">
        <input className={champ} value={etat.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Titre" />
        <input className={champ} value={etat.accroche} onChange={(e) => set('accroche', e.target.value)} placeholder="Accroche" />
        <textarea className={champ} rows={2} value={etat.intro} onChange={(e) => set('intro', e.target.value)} placeholder="Texte d’introduction" />

        <label className="flex items-center gap-2 pt-1 text-sm text-(--color-ink)">
          <input
            type="checkbox"
            checked={etat.demarrageActif}
            onChange={(e) => set('demarrageActif', e.target.checked)}
            className="h-4 w-4 accent-(--color-primary)"
          />
          Afficher la section « Par où commencer ? »
        </label>

        {etat.demarrageActif && (
          <div className="space-y-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
            <textarea
              className={champ}
              rows={2}
              value={etat.demarrageIntro}
              onChange={(e) => set('demarrageIntro', e.target.value)}
              placeholder="Phrase d’introduction de la section"
            />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
              Spécialités conseillées, dans l’ordre
            </p>
            <div className="flex flex-wrap gap-1.5">
              {colleges.map((c) => {
                const rang = etat.demarrageColleges.indexOf(c.id);
                const choisi = rang >= 0;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      set('demarrageColleges', choisi
                        ? etat.demarrageColleges.filter((x) => x !== c.id)
                        : [...etat.demarrageColleges, c.id])
                    }
                    className={
                      'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ' +
                      (choisi
                        ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                        : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-sand-100)')
                    }
                  >
                    {choisi && <span className="mr-1 tabular-nums">{rang + 1}.</span>}
                    {c.nom}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-(--color-ink-muted)">
              Aucune spécialité cochée : la section n’apparaît pas (sauf sur la configuration par
              défaut, qui conserve les six spécialités transversales d’origine).
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={enregistrer} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : ok ? <CheckCircle2 /> : null}
          Enregistrer
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={supprimer} disabled={pending} className="text-(--color-danger)">
          <Trash2 />
          {nouvelle ? 'Annuler' : 'Supprimer'}
        </Button>
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    </div>
  );
}
