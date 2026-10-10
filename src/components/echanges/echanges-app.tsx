'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Inbox, Library, Loader2, Lock, MessagesSquare, Search, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContexteDTO, ResultatRechercheDTO, ResumeEchangesDTO } from '@/lib/echanges/types';
import { api, depuisCourt } from './api';
import { Conversation } from './conversation';
import { Pastille } from './elements';
import { Feuille } from './feuille';
import { PanneauBibliotheque, PanneauRecherche } from './panneaux';
import { rafraichirResumeEchanges } from './raccourcis';

function initiales(nom: string): string {
  return nom.split(/[\s—–-]+/).filter((m) => /\p{L}|\d/u.test(m)).slice(0, 2).map((m) => m.charAt(0).toUpperCase()).join('');
}

export function EchangesApp({ groupeId = null, canal = 'discussion', autour = null, contexte = null, estStaff = false }: {
  groupeId?: string | null;
  canal?: 'discussion' | 'annonces';
  autour?: string | null;
  contexte?: ContexteDTO | null;
  estStaff?: boolean;
}) {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeEchangesDTO | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [panneau, setPanneau] = useState<null | 'recherche' | 'bibliotheque'>(null);

  const charger = useCallback(() => {
    api<ResumeEchangesDTO>('/api/echanges').then((r) => { setResume(r); setErreur(null); }).catch((e) => setErreur(e instanceof Error ? e.message : 'Échanges indisponibles.'));
  }, []);
  useEffect(() => {
    charger();
    const t = window.setInterval(() => { if (document.visibilityState === 'visible') charger(); }, 30_000);
    const v = () => { if (document.visibilityState === 'visible') charger(); };
    document.addEventListener('visibilitychange', v);
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', v); };
  }, [charger]);

  const surLu = useCallback(() => { charger(); rafraichirResumeEchanges(); }, [charger]);

  // Un seul groupe : ouverture directe (l'élève retrouve tout de suite sa promotion, §1).
  useEffect(() => {
    if (!groupeId && resume && resume.groupes.length === 1 && resume.groupes[0].droits.lire && window.matchMedia('(min-width: 1024px)').matches) {
      router.replace(`/echanges/${resume.groupes[0].id}`);
    }
  }, [groupeId, resume, router]);

  const ouvrirResultat = (r: ResultatRechercheDTO) => {
    setPanneau(null);
    if (r.source === 'bibliotheque') { setPanneau('bibliotheque'); return; }
    if (r.groupeId) router.push(`/echanges/${r.groupeId}?m=${r.id}${r.canal === 'annonces' ? '&canal=annonces' : ''}`);
  };

  const groupeCourant = resume?.groupes.find((g) => g.id === groupeId);
  const enseignant = resume?.groupes.some((g) => g.role === 'enseignant');

  const liste = (
    <div className="flex h-full min-h-0 flex-col bg-(--color-surface)">
      <div className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3">
        <MessagesSquare className="h-5 w-5 text-[#E4002B]" />
        <h1 className="flex-1 text-[17px] font-bold text-(--color-ink)">Échanges</h1>
        <button type="button" onClick={() => setPanneau('recherche')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft)" aria-label="Rechercher dans les échanges"><Search className="h-5 w-5" /></button>
        <Link href="/profil/notifications" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft)" aria-label="Mes notifications"><Settings2 className="h-5 w-5" /></Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {(enseignant || (resume?.questionsATraiter ?? 0) > 0) && (
          <Link href="/echanges/questions" className="flex items-center gap-3 border-b border-(--color-border) bg-[#102C5F]/5 px-4 py-3 hover:bg-[#102C5F]/10">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102C5F] text-white"><Inbox className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block text-[14.5px] font-bold">Questions qui me sont adressées</span><span className="block text-[12.5px] text-(--color-ink-soft)">À traiter et traitées</span></span>
            <Pastille n={resume?.questionsATraiter ?? 0} />
          </Link>
        )}
        {resume && resume.groupes.some((g) => g.bibliotheque && g.droits.lire) && (
          <button type="button" onClick={() => setPanneau('bibliotheque')} className="flex w-full items-center gap-3 border-b border-(--color-border) px-4 py-3 text-left hover:bg-(--color-surface-soft)">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white"><Library className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block text-[14.5px] font-bold">📚 Réponses des enseignants</span><span className="block text-[12.5px] text-(--color-ink-soft)">Bibliothèque pédagogique validée par Major ECN</span></span>
          </button>
        )}
        {!resume && !erreur && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-(--color-ink-muted)" /></div>}
        {erreur && <p className="px-4 py-8 text-center text-[14px] text-(--color-ink-soft)">{erreur}</p>}
        {resume && resume.groupes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <MessagesSquare className="mx-auto h-10 w-10 text-(--color-ink-muted)" />
            <p className="mt-3 text-[15px] font-semibold text-(--color-ink)">Aucun espace d’échanges pour le moment</p>
            <p className="mt-1 text-[13.5px] text-(--color-ink-soft)">Votre messagerie de promotion apparaîtra ici dès que Major ECN l’aura ouverte pour votre inscription.</p>
          </div>
        )}
        <ul>
          {resume?.groupes.map((g) => {
            const actif = g.id === groupeId;
            const n = g.nonLus.discussion + g.nonLus.annonces;
            return (
              <li key={g.id}>
                <Link href={`/echanges/${g.id}`} aria-current={actif ? 'page' : undefined}
                  className={cn('flex items-center gap-3 border-b border-(--color-border) px-4 py-3 transition-colors', actif ? 'bg-(--color-primary-soft)' : 'hover:bg-(--color-surface-soft)')}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#102C5F] text-[15px] font-bold text-white">{initiales(g.nom)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-bold text-(--color-ink)">{g.nom}</span>
                      {g.statut === 'cloturee' && <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[10.5px] font-bold text-amber-800">Clôturée</span>}
                      {g.statut === 'brouillon' && <span className="shrink-0 rounded bg-(--color-surface-sunken) px-1.5 text-[10.5px] font-bold">Brouillon</span>}
                      {g.dernierMessage && <span className="ml-auto shrink-0 text-[11.5px] text-(--color-ink-muted)">{depuisCourt(g.dernierMessage.at)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] text-(--color-ink-soft)">
                        {!g.droits.lire ? <><Lock className="mr-1 inline h-3 w-3" />{g.droits.motif}</>
                          : g.dernierMessage ? <><span className="font-semibold">{g.dernierMessage.auteur}</span> : {g.dernierMessage.extrait}</>
                            : g.promotion ?? g.specialiteNom ?? 'Aucun message pour le moment'}
                      </span>
                      {g.nonLus.reponsesEnseignant > 0 && <span className="inline-flex items-center gap-0.5 rounded-full bg-[#102C5F] px-1.5 text-[10.5px] font-bold text-white"><GraduationCap className="h-3 w-3" />{g.nonLus.reponsesEnseignant}</span>}
                      <Pastille n={n} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {estStaff && (
          <p className="px-4 py-4 text-center text-[12.5px] text-(--color-ink-muted)">
            <Link href="/admin/echanges" className="font-semibold underline">Back-office des échanges</Link>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className={cn('h-full w-full border-r border-(--color-border) lg:block lg:w-[360px] lg:shrink-0', groupeId ? 'hidden' : 'block')}>
        {liste}
      </aside>
      <section className={cn('h-full min-w-0 flex-1', groupeId ? 'block' : 'hidden lg:block')}>
        {groupeId ? (
          <Conversation
            key={groupeId}
            groupeId={groupeId}
            canalInitial={canal}
            autourInitial={autour}
            contexteInitial={contexte}
            nonLusAnnonces={groupeCourant?.nonLus.annonces ?? 0}
            nonLusDiscussion={groupeCourant?.nonLus.discussion ?? 0}
            onRetour={() => router.push('/echanges')}
            onLu={surLu}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-(--color-surface-soft) p-8 text-center">
            <MessagesSquare className="h-12 w-12 text-(--color-ink-muted)" />
            <p className="text-[15px] font-semibold text-(--color-ink)">Sélectionnez une conversation</p>
            <p className="max-w-sm text-[13.5px] text-(--color-ink-soft)">Échangez avec votre promotion, posez vos questions et taguez un enseignant avec @ pour qu’il vous réponde.</p>
          </div>
        )}
      </section>
      <Feuille ouvert={panneau === 'recherche'} onFermer={() => setPanneau(null)} titre="🔎 Rechercher dans les échanges" large>
        {panneau === 'recherche' && <PanneauRecherche groupeId={null} onOuvrir={ouvrirResultat} />}
      </Feuille>
      <Feuille ouvert={panneau === 'bibliotheque'} onFermer={() => setPanneau(null)} titre="📚 Réponses des enseignants" large>
        {panneau === 'bibliotheque' && <PanneauBibliotheque />}
      </Feuille>
    </div>
  );
}
