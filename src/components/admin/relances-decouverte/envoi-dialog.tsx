'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Send, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TYPE_COURT, type TypeRelance } from '@/lib/decouverte/types';
import type { Preparation, Progression } from '@/lib/decouverte/serveur';
import { API, appelJson, Message, nouvelleCle } from './commun';
import { rafraichirResumeRelances } from './use-resume';

/**
 * Envoi contrôlé (cahier §10, §11, §12, §26) :
 *  1. préparation par le SERVEUR (contrôle de chaque candidat, modèle choisi
 *     automatiquement, ventilation R1/R2/R3/ancien accès, exclus et raisons) ;
 *  2. confirmation explicite (total + ventilation) ;
 *  3. envoi par lots, avec barre de progression (chaque e-mail est recontrôlé
 *     juste avant son départ) ;
 *  4. bilan : envoyés, exclus et raisons, échecs et erreurs.
 * Une clé d'idempotence est générée à l'ouverture : double clic, rafraîchissement
 * ou requête rejouée renvoient la MÊME opération, jamais deux e-mails.
 */

export type DemandeDialog =
  | { type: 'groupe' | 'individuel'; candidatIds: string[] }
  | { type: 'exceptionnel'; candidatIds: string[]; typeForce: TypeRelance }
  | { reprendre: string };

type Etape = 'preparation' | 'confirmation' | 'envoi' | 'bilan' | 'erreur';

const LIBELLE_VENTILATION: Array<[string, string]> = [['R1', 'R1'], ['R2', 'R2'], ['R3', 'R3'], ['ancien_acces', 'Ancien accès']];

export function EnvoiDialog({ demande, onFermer }: { demande: DemandeDialog | null; onFermer: (envoye: boolean) => void }) {
  // Composant remonté à chaque ouverture (clé fournie par le parent) : état initial propre.
  const [etape, setEtape] = React.useState<Etape>(() => (demande && 'reprendre' in demande ? 'envoi' : 'preparation'));
  const [prep, setPrep] = React.useState<Preparation | null>(null);
  const [prog, setProg] = React.useState<Progression | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [confirme, setConfirme] = React.useState(false);
  const [commentaire, setCommentaire] = React.useState('');
  const cle = React.useRef<string>('');
  const arret = React.useRef(false);
  const aEnvoye = React.useRef(false);

  const executer = React.useCallback(async (opId: string, motif?: string) => {
    arret.current = false;
    try {
      let p = await appelJson<Progression>(`${API}/operations/${opId}`);
      setEtape('envoi');
      setErreur(null);
      if (p.operation.statut === 'preparee') p = await appelJson<Progression>(`${API}/operations/${opId}`, { body: { action: 'confirmer', commentaire: motif || null } });
      setProg(p);
      aEnvoye.current = true;
      while (p.restants > 0 && p.operation.statut === 'en_cours' && !arret.current) {
        p = await appelJson<Progression>(`${API}/operations/${opId}`, { body: { action: 'executer' } });
        setProg(p);
        if (p.pause) { setErreur('Les envois ont été mis en pause dans les paramètres : l’opération reprendra quand la pause sera levée (Journal → Reprendre).'); break; }
      }
      setEtape('bilan');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Envoi interrompu');
      setEtape('erreur');
    } finally {
      rafraichirResumeRelances();
    }
  }, []);

  React.useEffect(() => {
    if (!demande) return;
    aEnvoye.current = false;
    cle.current = nouvelleCle();
    if ('reprendre' in demande) { const opId = demande.reprendre; void Promise.resolve().then(() => executer(opId)); return; }
    (async () => {
      try {
        const p = await appelJson<Preparation>(`${API}/operations`, {
          body: { cle: cle.current, candidatIds: demande.candidatIds, type: demande.type, typeForce: demande.type === 'exceptionnel' ? demande.typeForce : null },
        });
        setPrep(p);
        if (p.statut === 'en_cours') await executer(p.operationId);
        else if (p.statut === 'terminee' || p.statut === 'annulee') { setProg(await appelJson<Progression>(`${API}/operations/${p.operationId}`)); setEtape('bilan'); }
        else setEtape('confirmation');
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Préparation impossible');
        setEtape('erreur');
      }
    })();
  }, [demande, executer]);

  async function annuler() {
    if (prep && etape === 'confirmation') {
      await appelJson(`${API}/operations/${prep.operationId}`, { body: { action: 'annuler' } }).catch(() => null);
    }
    arret.current = true;
    onFermer(aEnvoye.current);
  }

  const exceptionnel = !!demande && !('reprendre' in demande) && demande.type === 'exceptionnel';
  const pct = prog && prog.total > 0 ? Math.round(((prog.total - prog.restants) / prog.total) * 100) : 0;

  return (
    <Dialog open={!!demande} onOpenChange={(o) => { if (!o && etape !== 'envoi') void annuler(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exceptionnel ? 'Relance manuelle exceptionnelle' : 'Envoi des relances'}</DialogTitle>
          <DialogDescription>
            Chaque candidat est recontrôlé par le serveur juste avant son e-mail : connexion, désinscription, compte, adresse, échéance, doublon.
          </DialogDescription>
        </DialogHeader>

        {etape === 'preparation' && (
          <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Contrôle de la sélection par le serveur…</p>
        )}

        {etape === 'confirmation' && prep && (
          <div className="space-y-4">
            <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
              <p className="text-sm text-(--color-ink-soft)">E-mails qui partiront</p>
              <p className="text-3xl font-semibold tabular-nums text-(--color-ink)">{prep.total}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {LIBELLE_VENTILATION.map(([k, l]) => (
                  <span key={k} className="rounded-full border border-(--color-border) bg-(--color-surface) px-2.5 py-0.5">{l} : <strong className="tabular-nums">{prep.ventilation[k] ?? 0}</strong></span>
                ))}
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">Exclus : <strong className="tabular-nums">{prep.ventilation.exclus ?? 0}</strong></span>
              </div>
            </div>
            {prep.exclus.length > 0 && (
              <details className="rounded-lg border border-(--color-border) p-3 text-sm">
                <summary className="cursor-pointer font-medium">{prep.exclus.length} candidat(s) exclu(s) — voir les raisons</summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {prep.exclus.map((x) => <li key={x.candidatId}><strong>{x.nom}</strong> — {x.raison}</li>)}
                </ul>
              </details>
            )}
            {prep.avertissements.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="mb-1 flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Avertissements</p>
                <ul className="list-disc space-y-0.5 pl-5">{prep.avertissements.flatMap((a) => a.messages.map((m, i) => <li key={`${a.candidatId}-${i}`}>{m}</li>))}</ul>
              </div>
            )}
            {exceptionnel && prep.total > 0 && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={confirme} onChange={(e) => setConfirme(e.target.checked)} />
                <span>Je confirme cette relance exceptionnelle{demande && 'typeForce' in demande ? ` (${TYPE_COURT[demande.typeForce]})` : ''} malgré les avertissements. Elle sera tracée à mon nom.</span>
              </label>
            )}
            {exceptionnel && (
              <input className="h-10 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm" placeholder="Motif (facultatif, visible dans la timeline)" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} maxLength={500} />
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => void annuler()}>Annuler</Button>
              <Button onClick={() => { setEtape('envoi'); void executer(prep.operationId, commentaire); }} disabled={prep.total === 0 || (exceptionnel && !confirme)}>
                <Send /> Confirmer l’envoi de {prep.total} e-mail{prep.total > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {(etape === 'envoi' || etape === 'bilan' || etape === 'erreur') && prog && (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm"><span>{etape === 'envoi' ? 'Envoi en cours…' : 'Opération terminée'}</span><span className="tabular-nums">{prog.total - prog.restants} / {prog.total}</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-(--color-surface-soft)"><div className="h-full rounded-full bg-(--color-primary) transition-all" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/30"><CheckCircle2 className="mx-auto h-4 w-4 text-emerald-700" /><p className="text-xl font-semibold tabular-nums">{prog.envoyes}</p><p className="text-xs">envoyés</p></div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/40 dark:bg-amber-950/30"><AlertTriangle className="mx-auto h-4 w-4 text-amber-700" /><p className="text-xl font-semibold tabular-nums">{prog.exclus}</p><p className="text-xs">exclus</p></div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900/40 dark:bg-red-950/30"><XCircle className="mx-auto h-4 w-4 text-red-700" /><p className="text-xl font-semibold tabular-nums">{prog.echecs}</p><p className="text-xs">échecs</p></div>
            </div>
            {Object.keys(prog.envoyesParType).length > 0 && (
              <p className="text-sm">Envoyés par modèle : {Object.entries(prog.envoyesParType).map(([t, n]) => `${TYPE_COURT[t as TypeRelance] ?? t} ${n}`).join(' · ')}</p>
            )}
            {prog.raisonsExclusion.length > 0 && (
              <div className="text-sm"><p className="font-medium">Exclus et raisons</p><ul className="mt-1 list-disc space-y-0.5 pl-5">{prog.raisonsExclusion.map((r) => <li key={r.raison}>{r.raison} — {r.nombre}</li>)}</ul></div>
            )}
            {prog.erreurs.length > 0 && (
              <div className="text-sm text-red-700 dark:text-red-300"><p className="font-medium">Échecs et erreurs</p><ul className="mt-1 list-disc space-y-0.5 pl-5">{prog.erreurs.map((r) => <li key={r.erreur}>{r.erreur} — {r.nombre}</li>)}</ul></div>
            )}
            {etape === 'bilan' && prog.details.length > 0 && prog.details.length <= 300 && (
              <details className="rounded-lg border border-(--color-border) p-3 text-sm">
                <summary className="cursor-pointer font-medium">Détail par candidat</summary>
                <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">{prog.details.map((d) => <li key={d.candidatId}><strong>{d.nom}</strong> ({d.email}) — {d.statut === 'envoye' ? `envoyé (${d.type})` : d.statut === 'exclu' ? `exclu : ${d.raison}` : d.statut === 'echec' ? `échec : ${d.raison}` : 'en attente'}</li>)}</ul>
              </details>
            )}
          </div>
        )}

        <Message erreur={erreur} />
        {etape === 'erreur' && prep && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onFermer(aEnvoye.current)}>Fermer</Button>
            <Button onClick={() => { setEtape('envoi'); void executer(prep.operationId); }}>Reprendre l’envoi</Button>
          </div>
        )}
        {etape === 'erreur' && !prep && demande && 'reprendre' in demande && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onFermer(aEnvoye.current)}>Fermer</Button>
            <Button onClick={() => { setEtape('envoi'); void executer(demande.reprendre); }}>Reprendre l’envoi</Button>
          </div>
        )}
        {etape === 'bilan' && <div className="flex justify-end"><Button onClick={() => onFermer(true)}>Fermer</Button></div>}
        {etape === 'envoi' && <p className="text-xs text-(--color-ink-muted)">Gardez cette fenêtre ouverte. Si elle se ferme, l’opération se reprend depuis le Journal sans renvoyer aux destinataires déjà servis.</p>}
      </DialogContent>
    </Dialog>
  );
}
