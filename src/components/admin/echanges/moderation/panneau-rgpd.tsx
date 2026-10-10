'use client';

import * as React from 'react';
import { AlertTriangle, Download, Eraser, Search, ShieldCheck } from 'lucide-react';
import { rechercherEleves, rgpdEffacement, rgpdExport } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, EnteteCarte, Libelle, Toast, useMessage, Vide } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';

type Eleve = { id: string; nom: string; email: string | null };

/** Téléchargement local d'un objet JSON (aucun envoi vers un service tiers). */
function telechargerJson(donnees: unknown, nom: string) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Droits RGPD dans le module (§95), réservé au Super Admin : export des
 * données d'un candidat (droit d'accès) et effacement définitif de ses
 * contenus (droit à l'effacement), confirmé en tapant EFFACER. Les groupes
 * sous conservation légale sont épargnés et signalés.
 */
export function PanneauRgpd() {
  const [q, setQ] = React.useState('');
  const [resultats, setResultats] = React.useState<Eleve[] | null>(null);
  const [recherche, setRecherche] = React.useState(false);
  const [choisi, setChoisi] = React.useState<Eleve | null>(null);
  const [confirmation, setConfirmation] = React.useState('');
  const [enCours, setEnCours] = React.useState<'export' | 'effacement' | null>(null);
  const [bilan, setBilan] = React.useState<string | null>(null);
  const [message, setMessage] = useMessage();
  const ids = { q: React.useId(), conf: React.useId() };

  const chercher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) { setMessage('Saisissez au moins 2 caractères.'); return; }
    setRecherche(true);
    try {
      setResultats(await rechercherEleves(q));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Recherche impossible.');
    }
    setRecherche(false);
  };

  const choisir = (e: Eleve) => { setChoisi(e); setConfirmation(''); setBilan(null); };

  const exporter = async () => {
    if (!choisi) return;
    setEnCours('export');
    const r = await rgpdExport(choisi.id).catch((e: unknown) => ({ ok: false as const, erreur: e instanceof Error ? e.message : 'Export impossible.' }));
    setEnCours(null);
    if (!r.ok) { setMessage(r.erreur); return; }
    telechargerJson(r.data ?? {}, `echanges-rgpd-${choisi.id}-${new Date().toISOString().slice(0, 10)}.json`);
    setMessage('Export téléchargé (consigné au journal d’audit).');
  };

  const effacer = async () => {
    if (!choisi || confirmation !== 'EFFACER') return;
    setEnCours('effacement');
    const r = await rgpdEffacement(choisi.id, confirmation).catch((e: unknown) => ({ ok: false as const, erreur: e instanceof Error ? e.message : 'Effacement impossible.' }));
    setEnCours(null);
    if (!r.ok) { setMessage(r.erreur); return; }
    const purges = r.data?.purges ?? 0;
    const conserves = r.data?.conserves ?? 0;
    setConfirmation('');
    setBilan(`${purges} message${purges > 1 ? 's' : ''} purgé${purges > 1 ? 's' : ''} définitivement${conserves > 0 ? ` ; ${conserves} conservé${conserves > 1 ? 's' : ''} (groupes sous conservation légale)` : ''}. Réactions, lectures et pièces jointes effacées.`);
  };

  return (
    <Carte>
      <EnteteCarte icone={ShieldCheck} titre="RGPD — données d’un candidat" />
      <p className="px-4 pb-3 text-[13px] text-(--color-ink-soft) sm:px-5">
        Droit d’accès (export JSON de tout ce que le module conserve sur la personne) et droit à l’effacement. Chaque opération est inscrite au journal d’audit.
      </p>

      <div className="grid gap-5 px-4 pb-5 sm:px-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="min-w-0">
          <form onSubmit={(e) => void chercher(e)}>
            <Libelle htmlFor={ids.q}>Rechercher un candidat</Libelle>
            <div className="flex gap-2">
              <input id={ids.q} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, prénom ou e-mail" className={champ} />
              <Bouton type="submit" variante="contour" enCours={recherche} aria-label="Rechercher"><Search /></Bouton>
            </div>
          </form>
          {resultats && (
            resultats.length === 0 ? (
              <Vide className="px-0">Aucun candidat trouvé.</Vide>
            ) : (
              <ul className="mt-2 max-h-80 divide-y divide-(--color-border) overflow-y-auto rounded-lg border border-(--color-border)">
                {resultats.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => choisir(e)}
                      aria-pressed={choisi?.id === e.id}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-[13px] transition-colors focus-ring',
                        choisi?.id === e.id ? 'bg-(--color-primary-soft) text-(--color-primary)' : 'hover:bg-(--color-surface-soft)',
                      )}
                    >
                      <span className="block font-medium">{e.nom}</span>
                      {e.email && <span className="block break-all text-[12px] text-(--color-ink-muted)">{e.email}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="min-w-0">
          {!choisi ? (
            <Vide className="rounded-lg border border-dashed border-(--color-border)">Choisissez un candidat pour exporter ou effacer ses données.</Vide>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-semibold text-(--color-ink)">{choisi.nom}</p>
                {choisi.email && <p className="break-all text-[12.5px] text-(--color-ink-muted)">{choisi.email}</p>}
              </div>

              <section className="rounded-lg border border-(--color-border) p-3.5">
                <h3 className="text-[14px] font-semibold text-(--color-ink)">Export des données</h3>
                <p className="mt-1 text-[12.5px] text-(--color-ink-soft)">
                  Messages, promotions, réactions, mesures, signalements effectués, tentatives bloquées, lectures, pièces jointes, questions aux enseignants et préférences de notification.
                </p>
                <Bouton className="mt-2.5" taille="sm" variante="contour" enCours={enCours === 'export'} onClick={() => void exporter()}>
                  <Download /> Télécharger l’export (.json)
                </Bouton>
              </section>

              <section className="rounded-lg border border-[#F5C2C0] bg-[#FCE4E4]/40 p-3.5">
                <h3 className="flex items-center gap-1.5 text-[14px] font-semibold text-[#B42318]"><AlertTriangle className="h-4 w-4" /> Effacement définitif</h3>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[12.5px] text-(--color-ink)">
                  <li>Le texte de tous ses messages et leurs versions antérieures est <strong>purgé sans retour possible</strong> (aucune restauration).</li>
                  <li>Ses pièces jointes sont supprimées du stockage ; ses réactions et lectures sont effacées.</li>
                  <li>Ses questions en attente auprès des enseignants sont annulées.</li>
                  <li>Les messages des promotions sous <strong>conservation légale</strong> sont conservés et comptés à part.</li>
                  <li>Le compte Major ECN du candidat n’est pas supprimé.</li>
                </ul>
                <div className="mt-3">
                  <Libelle htmlFor={ids.conf} aide="pour confirmer">Tapez EFFACER</Libelle>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id={ids.conf}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="EFFACER"
                      className={cn(champ, 'sm:max-w-[12rem]')}
                    />
                    <Bouton variante="danger" taille="md" disabled={confirmation !== 'EFFACER'} enCours={enCours === 'effacement'} onClick={() => void effacer()}>
                      <Eraser /> Effacer définitivement
                    </Bouton>
                  </div>
                </div>
                {bilan && <p role="status" className="mt-3 rounded-md bg-[#E6F4EA] px-3 py-2 text-[12.5px] text-[#1F7A3E]">{bilan}</p>}
              </section>
            </div>
          )}
        </div>
      </div>
      <Toast message={message} />
    </Carte>
  );
}
