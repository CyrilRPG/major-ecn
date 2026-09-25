'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SVGProps } from 'react';
import { ChevronRight, PencilLine, Settings, Stethoscope, Trash2, UserRound } from 'lucide-react';
import { ArenaBars as BarChart3 } from './experience-icons';

/** Couronne de laurier (édition), au trait des pictogrammes lucide. */
function Laurel(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 20c-3.5-2-5.5-5.5-5-10M16 20c3.5-2 5.5-5.5 5-10" />
    <path d="M4.5 15.5c1.5.2 2.8-.4 3.4-1.6-1.4-.5-2.8-.1-3.4 1.6ZM3.2 11.8c1.4-.2 2.4-1.2 2.6-2.5-1.4 0-2.4.9-2.6 2.5ZM19.5 15.5c-1.5.2-2.8-.4-3.4-1.6 1.4-.5 2.8-.1 3.4 1.6ZM20.8 11.8c-1.4-.2-2.4-1.2-2.6-2.5 1.4 0 2.4.9 2.6 2.5Z" />
  </svg>;
}
import { ArenaAvatar } from '@/components/arena/arena-avatar';
import { changePseudo, deleteMyAccount, logoutArena, setMarketingConsent } from '@/app/(arena)/arena/[slug]/actions';
import { CONSENT_MARKETING } from '@/lib/arena/texts';
import type { Distinction } from '@/lib/arena/performance';
import { FormError } from './form-ui';

/**
 * « Mon compte Arena » — maquette client du 24/09/2026 (14_50_00) : carte de
 * profil (médaillon, pseudonyme, e-mail, « Modifier mon profil »), spécialité ·
 * édition · participation, consentement n° 2 (§3.1, jamais pré-coché), liste
 * du compte, déconnexion et suppression du compte (§3.1). « Modifier mon
 * profil » ouvre le changement de pseudonyme tant qu'aucune manche n'est
 * jouée ; ensuite il l'explique. « Gérer mes préférences » mène au
 * consentement. Aucun bouton mort.
 */
export function SpaceSettings({
  slug, pseudo, avatarSeed, rank, distinction, marketing, canChangePseudo, email, specialty, edition, played, roundsTotal = 3,
}: {
  slug: string; pseudo: string; avatarSeed: string; rank?: number | null; distinction?: Distinction | null; marketing: boolean; canChangePseudo: boolean; email: string;
  specialty?: string; edition?: string; played?: number; roundsTotal?: number;
}) {
  const router = useRouter();
  const [newPseudo, setNewPseudo] = useState(pseudo);
  const [consent, setConsent] = useState(marketing);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const consentRef = useRef<HTMLInputElement>(null);
  const participation = played !== undefined ? `${played} / ${roundsTotal} manche${roundsTotal > 1 ? 's' : ''}` : null;
  const editionLabel = edition?.trim() ? edition.replace(/^(édition|edition)\s+/i, '').replace(/^./, (c) => c.toUpperCase()) : null;

  return (
    <div className="ev-account">
      <div className="ev-account-card">
        <div className="ev-account-id">
          <ArenaAvatar seed={avatarSeed} rank={rank} distinction={distinction} size={80} title={pseudo} />
          <div>
            <p className="ev-account-pseudo">{pseudo}</p>
            <p className="ev-account-mail">{email}</p>
          </div>
          <button type="button" className="ev-account-edit" aria-expanded={editing} aria-controls="ev-account-editor" onClick={() => { setEditing(!editing); setInfo(null); setError(null); }}>
            <PencilLine aria-hidden />Modifier mon profil
          </button>
        </div>
        {(specialty || editionLabel || participation) && (
          <dl className="ev-account-facts">
            {specialty && <div><dt>Spécialité</dt><dd>{specialty}</dd></div>}
            {editionLabel && <div><dt>Édition</dt><dd>{editionLabel}</dd></div>}
            {participation && <div><dt>Participation</dt><dd className="ev-account-big">{participation}</dd></div>}
          </dl>
        )}
        {editing && (
          <div id="ev-account-editor" className="ev-account-editor">
            {canChangePseudo ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null); setInfo(null);
                  start(async () => {
                    const r = await changePseudo(slug, newPseudo);
                    if (r.ok) { setInfo('Pseudonyme mis à jour.'); setEditing(false); router.refresh(); } else setError(r.error);
                  });
                }}
              >
                <label htmlFor="sp-pseudo">Pseudonyme <small>Modifiable jusqu’à votre première manche.</small></label>
                <div>
                  <input id="sp-pseudo" minLength={3} maxLength={24} value={newPseudo} onChange={(e) => setNewPseudo(e.target.value)} autoComplete="nickname" />
                  <button type="submit" className="ev-btn ev-btn--gold ev-btn--sm ev-btn--square" disabled={pending || newPseudo.trim() === pseudo}>Enregistrer</button>
                </div>
              </form>
            ) : (
              <p>Votre pseudonyme et votre médaillon sont fixés depuis votre première manche : ils vous suivent jusqu’au classement final. Votre adresse e-mail reste privée et n’apparaît jamais dans le classement.</p>
            )}
          </div>
        )}
      </div>

      <div className="ev-account-block">
        <p className="ev-account-title">Informations Major ECN</p>
        <label className="ev-account-consent">
          <input
            ref={consentRef}
            id="ev-pref-marketing"
            type="checkbox"
            checked={consent}
            disabled={pending}
            onChange={(e) => {
              const v = e.target.checked;
              setConsent(v);
              start(async () => { const r = await setMarketingConsent(slug, v); if (!r.ok) { setError(r.error); setConsent(!v); } });
            }}
          />
          <span>{CONSENT_MARKETING}</span>
        </label>
      </div>

      <div className="ev-account-block">
        <p className="ev-account-title ev-account-title--gold">Mon compte Arena</p>
        <dl className="ev-account-list">
          <div><UserRound aria-hidden /><dt>Pseudo</dt><dd>{pseudo}</dd></div>
          {specialty && <div><Stethoscope aria-hidden /><dt>Spécialité</dt><dd>{specialty}</dd></div>}
          {editionLabel && <div><Laurel aria-hidden /><dt>Édition</dt><dd>{editionLabel}</dd></div>}
          {participation && <div><BarChart3 aria-hidden /><dt>Participation</dt><dd>{participation}</dd></div>}
          <div>
            <Settings aria-hidden /><dt>Paramètres</dt>
            <dd>
              <button type="button" onClick={() => { const el = consentRef.current; if (!el) return; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus({ preventScroll: true }); el.closest('label')?.classList.add('is-flash'); window.setTimeout(() => el.closest('label')?.classList.remove('is-flash'), 1600); }}>
                Gérer mes préférences <ChevronRight aria-hidden />
              </button>
            </dd>
          </div>
        </dl>
      </div>

      <FormError>{error}</FormError>
      {info && <p className="ev-account-info" role="status">{info}</p>}

      <div className="ev-account-exit">
        <button type="button" className="ev-account-logout" disabled={pending} onClick={() => start(async () => { await logoutArena(); router.push(`/arena/${slug}`); router.refresh(); })}>Se déconnecter</button>
        {!confirmDelete && (
          <button type="button" className="ev-account-delete" onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden /> Supprimer mon compte et mes données
          </button>
        )}
      </div>
      {confirmDelete && (
        <div className="ev-account-confirm" role="alertdialog" aria-labelledby="ev-delete-q">
          <p id="ev-delete-q">Votre identité sera effacée définitivement et vous ne pourrez plus jouer les manches restantes. Vos réponses sont anonymisées. Confirmer ?</p>
          <div>
            <button type="button" className="ev-btn ev-btn--red ev-btn--sm" disabled={pending} onClick={() => start(async () => { const r = await deleteMyAccount(slug); if (r.ok) { router.push(`/arena/${slug}`); router.refresh(); } else setError(r.error); })}>Supprimer définitivement</button>
            <button type="button" className="ev-btn ev-btn--ghost ev-btn--sm" onClick={() => setConfirmDelete(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
