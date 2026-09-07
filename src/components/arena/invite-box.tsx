'use client';

import { useState, useTransition } from 'react';
import { Copy, Mail, MessageCircle, Share2 } from 'lucide-react';
import { sendInvites } from '@/app/(arena)/arena/[slug]/actions';
import { ArenaButton, ARENA, BODY, DISPLAY } from './arena-ui';
import { Field, FormError, TextArea, TextInput } from './form-ui';

/**
 * « Inviter un collègue » (§8) : WhatsApp prioritaire, puis email, Messenger
 * et copie du lien. Le lien porte le code d'invitation (source d'acquisition).
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
  const messenger = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(inviteUrl)}&app_id=0&redirect_uri=${encodeURIComponent(inviteUrl)}`;

  const chip = 'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition-colors hover:bg-white/[0.08]';
  const chipStyle = { background: 'rgba(255,255,255,0.05)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, color: ARENA.text, fontFamily: DISPLAY } as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <a href={wa} target="_blank" rel="noreferrer" className={chip} style={{ ...chipStyle, background: 'rgba(37,211,102,0.14)', boxShadow: 'inset 0 0 0 1px rgba(37,211,102,0.4)' }}>
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a href={messenger} target="_blank" rel="noreferrer" className={chip} style={chipStyle}><Share2 className="h-4 w-4" /> Messenger</a>
        <button
          type="button"
          className={chip}
          style={chipStyle}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(inviteUrl);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          <Copy className="h-4 w-4" /> {copied ? 'Lien copié' : 'Copier le lien'}
        </button>
      </div>
      <p className="break-all text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{inviteUrl}</p>

      <form
        className="space-y-3"
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
        <Field label="Par email" htmlFor="inv-emails" hint="Une ou plusieurs adresses, séparées par des virgules (10 maximum par envoi).">
          <TextInput id="inv-emails" value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="collegue@exemple.fr, autre@exemple.fr" />
        </Field>
        <Field label="Message personnel (facultatif)" htmlFor="inv-msg">
          <TextArea id="inv-msg" maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} className="!min-h-[80px]" />
        </Field>
        <FormError>{error}</FormError>
        {result && <p className="text-sm font-bold" style={{ color: ARENA.text, fontFamily: BODY }}>{result}</p>}
        <ArenaButton type="submit" variant="ghost" disabled={pending || !emails.trim()}><Mail className="h-4 w-4" /> {pending ? 'Envoi…' : 'Envoyer les invitations'}</ArenaButton>
      </form>
    </div>
  );
}
