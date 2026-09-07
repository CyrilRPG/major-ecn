'use client';

import { useState, useTransition } from 'react';
import { Copy, Link2, Mail, MessageCircle, Send, Share2 } from 'lucide-react';
import { sendInvites } from '@/app/(arena)/arena/[slug]/actions';
import { ArenaButton, ARENA, BODY, DISPLAY } from './arena-ui';
import { Field, FormError, TextArea, TextInput } from './form-ui';

/**
 * « Inviter un collègue » (§8, maquette 14) : lien personnalisé avec copie,
 * partage WhatsApp (prioritaire), Telegram, email, Messenger, copie du lien.
 * Le lien porte le code d'invitation (source d'acquisition).
 */
export function InviteBox({ slug, inviteUrl, specialty }: { slug: string; inviteUrl: string; specialty: string }) {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const text = `Je participe au tournoi EVC Arena ${specialty} de Major ECN : 3 manches de 12 QCM en 12 minutes, une seule tentative. Rejoins-moi : ${inviteUrl}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(text)}`;
  const mailto = `mailto:?subject=${encodeURIComponent('Rejoins-moi sur EVC Arena')}&body=${encodeURIComponent(text)}`;
  const messenger = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(inviteUrl)}&app_id=0&redirect_uri=${encodeURIComponent(inviteUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const tile = 'flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-white/[0.06] sm:text-[11px] sm:tracking-[0.12em]';
  const tileStyle = { background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.line}`, color: ARENA.textSoft, fontFamily: DISPLAY } as const;
  const icon = 'flex h-10 w-10 items-center justify-center rounded-full';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}>
        <span className="min-w-0 flex-1 truncate text-[13px]" style={{ color: ARENA.text, fontFamily: BODY }}>{inviteUrl}</span>
        <button type="button" onClick={copy} aria-label="Copier le lien" className="shrink-0 rounded-md p-2 transition-colors hover:bg-white/[0.08]" style={{ color: copied ? ARENA.ok : ARENA.textSoft }}>
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Partagez sur</p>
      <div className="grid grid-cols-5 gap-2">
        <a href={wa} target="_blank" rel="noreferrer" className={tile} style={tileStyle}><span className={icon} style={{ background: '#25D366', color: '#fff' }}><MessageCircle className="h-5 w-5" /></span>WhatsApp</a>
        <a href={tg} target="_blank" rel="noreferrer" className={tile} style={tileStyle}><span className={icon} style={{ background: '#2AABEE', color: '#fff' }}><Send className="h-5 w-5" /></span>Telegram</a>
        <a href={mailto} className={tile} style={tileStyle}><span className={icon} style={{ background: ARENA.red, color: '#fff' }}><Mail className="h-5 w-5" /></span>Email</a>
        <a href={messenger} target="_blank" rel="noreferrer" className={tile} style={tileStyle}><span className={icon} style={{ background: '#0084FF', color: '#fff' }}><Share2 className="h-5 w-5" /></span>Messenger</a>
        <button type="button" onClick={copy} className={tile} style={tileStyle}><span className={icon} style={{ background: ARENA.raised2, color: ARENA.text, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}><Link2 className="h-5 w-5" /></span>{copied ? 'Copié' : 'Lien'}</button>
      </div>

      <form
        className="space-y-3 pt-2"
        style={{ borderTop: `1px solid ${ARENA.line}` }}
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setResult(null);
          start(async () => {
            const r = await sendInvites(slug, emails.split(/[\s,;]+/), message);
            if (r.ok) {
              setResult(`${r.sent} invitation${r.sent > 1 ? 's' : ''} envoyée${r.sent > 1 ? 's' : ''}.`);
              setEmails('');
            } else setError(r.error);
          });
        }}
      >
        <Field label="Envoyer par email depuis l’arène" htmlFor="inv-emails" hint="Une ou plusieurs adresses, séparées par des virgules (10 maximum par envoi).">
          <TextInput id="inv-emails" value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="collegue@exemple.fr, autre@exemple.fr" />
        </Field>
        <Field label="Message personnel (facultatif)" htmlFor="inv-msg">
          <TextArea id="inv-msg" maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} className="!min-h-[80px]" />
        </Field>
        <FormError>{error}</FormError>
        {result && <p className="text-[13px] font-semibold" style={{ color: ARENA.ok, fontFamily: BODY }}>{result}</p>}
        <ArenaButton type="submit" variant="ghost" disabled={pending || !emails.trim()}><Mail className="h-4 w-4" /> {pending ? 'Envoi…' : 'Envoyer les invitations'}</ArenaButton>
      </form>
    </div>
  );
}
