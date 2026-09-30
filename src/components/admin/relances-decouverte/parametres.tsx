'use client';

import * as React from 'react';
import { Loader2, PauseCircle, PlayCircle, RotateCcw, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateHeure } from '@/lib/decouverte/dates';
import { liensDuJeton, rendreEmailDecouverte } from '@/lib/decouverte/emails';
import { CHAMPS_EDITABLES, MODELES_DEFAUT, modeleEffectif, surchargeDepuisModele, validerModele, type Modele } from '@/lib/decouverte/modeles';
import { libelleDureeLong } from '@/lib/marketing/visite-guidee';
import type { DroitsDecouverte } from '@/lib/decouverte/droits';
import { REGLE_ATTRIBUTION_LABEL, TYPES_MODELE, TYPE_ENVOI_LABEL, validerParametres, type ModeleSurcharge, type Parametres, type RegleAttribution, type TypeModele } from '@/lib/decouverte/types';
import { API, appelJson, champ, Libelle, Message, Panneau } from './commun';

/**
 * Paramétrage (cahier §4, §23, §30) — administrateurs : délais R1/R2/R3,
 * activation des niveaux et de la campagne « ancien accès », écart minimal,
 * seuil « ancien accès », maximum de relances, règle et fenêtre
 * d'attribution, validité des liens, lien vidéo, pause globale ; édition des
 * modèles avec aperçu en direct et e-mail de test. Chaque enregistrement est
 * tracé (avant / après) dans le Journal.
 */
export function ParametresModule({ initial, droits, onEnregistre }: { initial: Parametres; droits: DroitsDecouverte; onEnregistre: (p: Parametres) => void }) {
  const [p, setP] = React.useState<Parametres>(initial);
  const [type, setType] = React.useState<TypeModele>('R1');
  const [occupe, setOccupe] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [emailTest, setEmailTest] = React.useState('');
  const lecture = !droits.parametrer;

  const modele = React.useMemo(() => modeleEffectif(type, p.modeles), [type, p.modeles]);
  const erreursModele = validerModele(type, modele);
  const apercu = React.useMemo(() => {
    const r = rendreEmailDecouverte(type, modele, { prenom: 'Sara', dureeVideo: libelleDureeLong(), validiteJours: p.validiteLienJours }, liensDuJeton('https://www.major-ecn.fr', 'APERCU'));
    // Les visuels sont servis par ce site (même version que le code).
    const origine = typeof window !== 'undefined' ? window.location.origin : 'https://www.major-ecn.fr';
    return { ...r, html: r.html.split('https://www.major-ecn.fr/email/').join(`${origine}/email/`) };
  }, [type, modele, p.validiteLienJours]);

  const majModele = (champ: keyof ModeleSurcharge, valeur: string) => {
    const m: Modele = { ...modele, [champ]: champ === 'paragraphes' ? valeur.split('\n').map((x) => x.trim()).filter(Boolean) : valeur };
    setP({ ...p, modeles: { ...p.modeles, [type]: surchargeDepuisModele(type, m) } });
  };

  async function enregistrer(suivant: Parametres = p) {
    const e = validerParametres(suivant);
    if (e.length) { setErreur(e.join(' ')); return; }
    setOccupe(true); setErreur(null); setInfo(null);
    try {
      const r = await appelJson<Parametres>(`${API}/parametres`, { method: 'PUT', body: suivant });
      setP(r); onEnregistre(r);
      setInfo(`Paramètres enregistrés (version ${r.version}). Statuts et échéances recalculés.`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setOccupe(false);
    }
  }

  async function test() {
    setOccupe(true); setErreur(null); setInfo(null);
    try {
      await appelJson(`${API}/test`, { body: { type, email: emailTest, surcharge: p.modeles[type] ?? null } });
      setInfo(`E-mail de test « ${TYPE_ENVOI_LABEL[type]} » envoyé à ${emailTest} (objet préfixé [TEST]).`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Envoi du test impossible');
    } finally {
      setOccupe(false);
    }
  }

  const nombre = (cle: 'ecartMinJours' | 'seuilAncienJours' | 'maxRelances' | 'attributionFenetreJours' | 'validiteLienJours', label: string, aide: string, max: number) => (
    <Libelle label={label} aide={aide}><input type="number" min={0} max={max} className={champ} disabled={lecture} value={p[cle]} onChange={(e) => setP({ ...p, [cle]: Number(e.target.value) })} /></Libelle>
  );

  return (
    <div className="space-y-4">
      <Message erreur={erreur} info={info} />
      {lecture && <p className="text-sm text-(--color-ink-soft)">Lecture seule : le paramétrage est réservé aux administrateurs.</p>}

      <Panneau titre="Pause globale" description="En pause, AUCUN e-mail de relance ne part (envois groupés, individuels, exceptionnels) ; les statuts restent calculés et signalés."
        action={droits.parametrer ? (
          <Button variant={p.pause ? 'primary' : 'danger'} disabled={occupe} onClick={() => void enregistrer({ ...p, pause: !p.pause })}>
            {p.pause ? <><PlayCircle /> Reprendre les envois</> : <><PauseCircle /> Mettre en pause</>}
          </Button>
        ) : undefined}>
        <p className="text-sm font-semibold" style={{ color: p.pause ? '#B45309' : '#1E6B3E' }}>{p.pause ? 'Envois en pause' : 'Envois actifs'}</p>
      </Panneau>

      <Panneau titre="Cadence et règles" description={`Version ${p.version}${p.updatedAt ? ` · modifiée le ${formatDateHeure(p.updatedAt)}` : ''}. Toute modification recalcule immédiatement statuts et échéances (jour calendaire de Paris).`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(['R1', 'R2', 'R3'] as const).map((n) => (
            <div key={n} className="flex items-end gap-2">
              <Libelle label={`Délai ${n} (jours après l’accès initial)`} className="flex-1"><input type="number" min={1} max={730} className={champ} disabled={lecture} value={p.delais[n]} onChange={(e) => setP({ ...p, delais: { ...p.delais, [n]: Number(e.target.value) } })} /></Libelle>
              <label className="flex h-10 items-center gap-1.5 text-sm"><input type="checkbox" disabled={lecture} checked={p.actifs[n]} onChange={(e) => setP({ ...p, actifs: { ...p.actifs, [n]: e.target.checked } })} /> actif</label>
            </div>
          ))}
          {nombre('ecartMinJours', 'Écart minimal entre deux relances (jours)', 'Toute relance compte, y compris l’ancien système.', 365)}
          {nombre('seuilAncienJours', 'Seuil « ancien accès » (jours sans aucune R)', 'Au-delà, jamais relancé → campagne de réactivation.', 3650)}
          <div className="flex items-end gap-2">
            {nombre('maxRelances', 'Nombre maximal de relances R', 'Aucune R4/R5 : 3 au plus.', 3)}
            <label className="flex h-10 items-center gap-1.5 text-sm"><input type="checkbox" disabled={lecture} checked={p.actifs.ancien_acces} onChange={(e) => setP({ ...p, actifs: { ...p.actifs, ancien_acces: e.target.checked } })} /> ancien accès actif</label>
          </div>
          <Libelle label="Règle d’attribution" aide="Quand plusieurs relances ont précédé la première connexion.">
            <select className={champ} disabled={lecture} value={p.attributionRegle} onChange={(e) => setP({ ...p, attributionRegle: e.target.value as RegleAttribution })}>
              {(Object.keys(REGLE_ATTRIBUTION_LABEL) as RegleAttribution[]).map((r) => <option key={r} value={r}>{REGLE_ATTRIBUTION_LABEL[r]}</option>)}
            </select>
          </Libelle>
          {nombre('attributionFenetreJours', 'Fenêtre d’attribution (jours)', 'Relances plus anciennes : non attribuées.', 365)}
          {nombre('validiteLienJours', 'Validité des liens d’accès (jours)', 'Au-delà : page « Recevoir un nouveau lien ».', 365)}
          <Libelle label="Lien vidéo" aide="Page du site (ex. /visite-guidee) ou URL https ; le parcours d’accès suit sur une page du site."><input className={champ} disabled={lecture} value={p.lienVideo} onChange={(e) => setP({ ...p, lienVideo: e.target.value })} /></Libelle>
        </div>
        {droits.parametrer && <div className="mt-4 flex justify-end"><Button disabled={occupe} onClick={() => void enregistrer()}>{occupe ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer</Button></div>}
      </Panneau>

      <Panneau titre="Modèles d’e-mail" description="Textes par défaut = cahier des charges. Variables : {{prenom}} (« Bonjour, » sans prénom), {{duree_video}}, {{validite}}. Le mot « récemment » est refusé.">
        <div className="mb-3 flex flex-wrap gap-1">
          {TYPES_MODELE.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`rounded-full border px-3 py-1 text-sm ${t === type ? 'border-(--color-primary) bg-(--color-primary-soft) font-semibold' : 'border-(--color-border)'}`}>{TYPE_ENVOI_LABEL[t]}</button>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            {CHAMPS_EDITABLES.filter((c) => (c.cle !== 'ligneVideo' && c.cle !== 'ligneVideoIntro') || MODELES_DEFAUT[type].video).map((c) => (
              <Libelle key={c.cle} label={c.label}>
                {c.multi
                  ? <textarea className={`${champ} h-28 py-2`} disabled={lecture} value={modele.paragraphes.join('\n')} onChange={(e) => majModele('paragraphes', e.target.value)} />
                  : <input className={champ} disabled={lecture} value={String(modele[c.cle as keyof Modele] ?? '')} onChange={(e) => majModele(c.cle, e.target.value)} />}
              </Libelle>
            ))}
            {erreursModele.length > 0 && <Message erreur={erreursModele.join(' ')} />}
            <div className="flex flex-wrap gap-2">
              {droits.parametrer && <Button size="sm" disabled={occupe || erreursModele.length > 0} onClick={() => void enregistrer()}><Save /> Enregistrer les modèles</Button>}
              {droits.parametrer && <Button size="sm" variant="outline" disabled={occupe} onClick={() => { const m = { ...p.modeles }; delete m[type]; setP({ ...p, modeles: m }); }}><RotateCcw /> Texte par défaut</Button>}
            </div>
            {droits.gerer && (
              <div className="flex flex-col gap-2 rounded-lg border border-(--color-border) p-3 sm:flex-row sm:items-end">
                <Libelle label="E-mail de test (objet [TEST], aucun effet sur les candidats)" className="flex-1"><input type="email" className={champ} value={emailTest} onChange={(e) => setEmailTest(e.target.value)} placeholder="adresse@exemple.fr" /></Libelle>
                <Button size="sm" variant="secondary" disabled={occupe || !emailTest.includes('@') || erreursModele.length > 0} onClick={() => void test()}><Send /> Envoyer le test</Button>
              </div>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs text-(--color-ink-muted)">Objet : <strong className="text-(--color-ink)">{apercu.subject}</strong> · Préheader : {apercu.preheader}</p>
            <iframe title="Aperçu de l’e-mail" srcDoc={apercu.html} className="h-[720px] w-full rounded-lg border border-(--color-border) bg-white" sandbox="allow-same-origin allow-popups" />
          </div>
        </div>
      </Panneau>
    </div>
  );
}
