'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ArenaAvatar } from '@/components/arena/arena-avatar';
import { changePseudo, choisirAvatar, deleteMyAccount, logoutArena, setMarketingConsent } from '@/app/(arena)/arena/[slug]/actions';
import { AVATARS_PLANCHE } from '@/components/arena/avatars';
import { CONSENT_MARKETING } from '@/lib/arena/texts';
import { ArenaButton, ARENA, BODY, DISPLAY } from './arena-ui';
import { CheckRow, Field, FormError, TextInput } from './form-ui';

/** Réglages de l'espace participant : avatar, pseudonyme (avant la 1re manche), consentement n° 2, suppression du compte (§3.1). */
export function SpaceSettings({
  slug, pseudo, avatarSeed, marketing, canChangePseudo, email,
}: { slug: string; pseudo: string; avatarSeed: string; marketing: boolean; canChangePseudo: boolean; email: string }) {
  const router = useRouter();
  const [seed, setSeed] = useState(avatarSeed);
  const [newPseudo, setNewPseudo] = useState(pseudo);
  const [consent, setConsent] = useState(marketing);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [choixOuvert, setChoixOuvert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span className="rounded-full" style={{ boxShadow: `0 0 0 2px ${ARENA.lineStrong}` }}><ArenaAvatar seed={seed} size={64} title={pseudo} /></span>
        <div>
          <p className="text-lg font-extrabold" style={{ fontFamily: DISPLAY }}>{pseudo}</p>
          <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{email}</p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: ARENA.textSoft, fontFamily: BODY }}
            aria-expanded={choixOuvert}
            onClick={() => setChoixOuvert((v) => !v)}
          >
            Changer d’avatar
          </button>
        </div>
      </div>

      {choixOuvert && (
        <div role="radiogroup" aria-label="Choisir un avatar" className="grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-2.5">
          {AVATARS_PLANCHE.map((a) => {
            const on = a.id === seed;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={on}
                title={a.label}
                aria-label={a.label}
                disabled={pending}
                onClick={() => start(async () => { const r = await choisirAvatar(slug, a.id); if (r.ok) setSeed(r.seed); else setError(r.error); })}
                className="rounded-full p-0.5 transition-transform hover:scale-105"
                style={{ boxShadow: on ? `0 0 0 2.5px ${ARENA.red}, 0 0 20px rgba(228,0,43,0.5)` : `0 0 0 1.5px ${ARENA.lineStrong}` }}
              >
                <ArenaAvatar seed={a.id} size={44} title={a.label} />
              </button>
            );
          })}
        </div>
      )}

      {canChangePseudo && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null); setInfo(null);
            start(async () => {
              const r = await changePseudo(slug, newPseudo);
              if (r.ok) { setInfo('Pseudonyme mis à jour.'); router.refresh(); } else setError(r.error);
            });
          }}
        >
          <Field label="Pseudonyme" htmlFor="sp-pseudo" hint="Modifiable jusqu’à votre première manche.">
            <TextInput id="sp-pseudo" minLength={3} maxLength={24} value={newPseudo} onChange={(e) => setNewPseudo(e.target.value)} />
          </Field>
          <ArenaButton type="submit" variant="ghost" disabled={pending || newPseudo.trim() === pseudo}>Enregistrer</ArenaButton>
        </form>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Informations Major ECN</p>
        <CheckRow
          checked={consent}
          onChange={(v) => {
            setConsent(v);
            start(async () => { const r = await setMarketingConsent(slug, v); if (!r.ok) { setError(r.error); setConsent(!v); } });
          }}
        >
          {CONSENT_MARKETING}
        </CheckRow>
      </div>

      <FormError>{error}</FormError>
      {info && <p className="text-sm font-bold" style={{ fontFamily: BODY }}>{info}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-2" style={{ borderTop: `1px solid ${ARENA.line}` }}>
        <ArenaButton variant="ghost" className="mt-4" disabled={pending} onClick={() => start(async () => { await logoutArena(); router.push(`/arena/${slug}`); router.refresh(); })}>Se déconnecter</ArenaButton>
        {!confirmDelete ? (
          <button type="button" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: ARENA.textMuted, fontFamily: BODY }} onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Supprimer mon compte et mes données
          </button>
        ) : (
          <div className="mt-4 w-full rounded-xl p-4" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.35)' }}>
            <p className="text-sm" style={{ fontFamily: BODY }}>Votre identité sera effacée définitivement et vous ne pourrez plus jouer les manches restantes. Vos réponses sont anonymisées. Confirmer ?</p>
            <div className="mt-3 flex gap-2">
              <ArenaButton className="!px-4 !py-2 !text-[13px]" disabled={pending} onClick={() => start(async () => { const r = await deleteMyAccount(slug); if (r.ok) { router.push(`/arena/${slug}`); router.refresh(); } else setError(r.error); })}>Supprimer définitivement</ArenaButton>
              <ArenaButton variant="ghost" className="!px-4 !py-2 !text-[13px]" onClick={() => setConfirmDelete(false)}>Annuler</ArenaButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
