import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { parseScope } from '@/lib/auth/permissions';
import { chargerAnnonces, type DonneesAnnonces } from '@/lib/annonces/server';
import {
  TEXTES_COMMUNS, datesAVenir, epreuvePassee, etatInscription, joursAvant, messageVisiblePour,
  specialitesDeLEleve, type FicheConcours,
} from '@/lib/annonces/concours';
import {
  ArrowRight, BarChart3, Bell, Calendar, CalendarCheck, CalendarDays, ExternalLink,
  Info, Medal, Megaphone, Trophy, UserCheck, type LucideIcon,
} from 'lucide-react';

type Scope = ReturnType<typeof parseScope>;

/**
 * Colonne de droite de l'accueil (refonte du 24/09/2026) :
 *  1. UNE carte « concours » par spécialité de l'élève — compte à rebours,
 *     inscriptions, postes et calendrier réunis, rien de passé ;
 *     au-delà de deux spécialités (accès intégral…), une carte compacte
 *     « Vos épreuves » les liste toutes ;
 *  2. les messages libres qui le concernent (formule, voie, spécialités).
 * Plus de carte écrite en dur ni de compte à rebours répété.
 */
export async function AnnouncementsWidget({ scope, donnees }: { scope: Scope; donnees?: DonneesAnnonces }) {
  const d = donnees ?? await chargerAnnonces(await createClient());
  const { fiches, messages, maintenant } = selectionner(d, scope);
  if (fiches.length === 0 && messages.length === 0) return null;

  return (
    <div className="space-y-3" aria-label="Annonces et informations EVC">
      {fiches.length <= 2
        ? fiches.map((f) => <FicheConcoursCard key={f.id} nom={f.nom} fiche={f.fiche} voie={scope.voie ?? null} maintenant={maintenant} />)
        : <EpreuvesCompactes fiches={fiches} maintenant={maintenant} />}
      {messages.map((m) => <MessageCard key={m.id} m={m} />)}
    </div>
  );
}

/** Ce que CET élève doit voir : ses fiches (épreuve non passée) et ses messages. */
function selectionner(d: DonneesAnnonces, scope: Scope, maintenant = Date.now()) {
  const specialites = specialitesDeLEleve(scope, d.parentDe);
  const nomDe = new Map(d.specialites.map((c) => [c.id, c.nom]));
  const ordre = new Map(d.specialites.map((c, i) => [c.id, i]));

  const fiches = [...d.fiches.entries()]
    .filter(([id]) => specialites === null || specialites.includes(id))
    .filter(([, f]) => !epreuvePassee(f, maintenant))
    .map(([id, f]) => ({ id, nom: nomDe.get(id) ?? id, fiche: f }))
    .sort((a, b) => (a.fiche.date_epreuve ?? '9999').localeCompare(b.fiche.date_epreuve ?? '9999') || (ordre.get(a.id) ?? 0) - (ordre.get(b.id) ?? 0));

  const messages = d.messages
    .filter((m) => m.visible && messageVisiblePour(m, scope, specialites, maintenant))
    .sort((a, b) => a.order_index - b.order_index);

  return { fiches, messages, maintenant };
}

/* ------------ helpers ------------ */
function fmtDate(iso: string, avecHeure = false): string {
  try {
    const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: avecHeure ? 'long' : undefined,
      day: 'numeric', month: 'long', year: 'numeric',
      ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
      timeZone: 'Europe/Paris',
    }).replace(':', ' h ').replace(/ h 00$/, ' h');
  } catch {
    return iso;
  }
}

function Compteur({ jours }: { jours: number }) {
  return <>{jours === 0 ? 'Aujourd’hui' : <>J−{jours}</>}</>;
}

/* ------------ Fiche concours (une par spécialité) ------------ */
function FicheConcoursCard({ nom, fiche, voie, maintenant }: {
  nom: string; fiche: FicheConcours; voie: 'interne' | 'externe' | null; maintenant: number;
}) {
  const inscription = etatInscription(fiche, maintenant);
  const dates = datesAVenir(fiche, maintenant);
  const postes = [
    { voie: 'externe' as const, label: 'Voie externe', n: fiche.postes_externe },
    { voie: 'interne' as const, label: 'Voie interne', n: fiche.postes_interne },
  ].filter((p) => p.n);

  return (
    <article className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <header className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: '#FCEAEC', color: '#A91D2C' }}>
          <CalendarCheck className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">{nom}</h3>
          <p className="mt-0.5 text-[17px] font-black leading-tight tracking-tight text-(--color-primary)">{TEXTES_COMMUNS.session}</p>
        </div>
      </header>
      <span aria-hidden className="mt-3 block h-[3px] w-12 rounded-full" style={{ background: 'var(--color-primary)' }} />

      {/* Compte à rebours — le seul de la carte */}
      <div className="relative mt-4 overflow-hidden rounded-xl bg-(--color-primary-soft)/40 px-4 py-3">
        {fiche.date_epreuve ? (
          <>
            <p className="text-xs text-(--color-ink-soft)">{TEXTES_COMMUNS.avantCompteur}</p>
            <p className="mt-1 text-2xl font-black leading-none text-(--color-primary)"><Compteur jours={joursAvant(fiche.date_epreuve, maintenant)} /></p>
            <p className="mt-1 text-xs leading-snug text-(--color-ink-soft)">
              {TEXTES_COMMUNS.apresCompteur} · {fmtDate(fiche.date_epreuve)}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-(--color-ink-soft)">Épreuve écrite</p>
            <p className="mt-1 text-base font-extrabold leading-snug text-(--color-primary)">Date bientôt communiquée</p>
          </>
        )}
        <Calendar aria-hidden className="pointer-events-none absolute -right-3 -bottom-2 h-20 w-20 text-(--color-primary)/10" />
      </div>

      {inscription && inscription.etat !== 'close' && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">Inscriptions</p>
          <p className="mt-1 text-[14px] leading-relaxed text-(--color-ink-soft)">
            {inscription.etat === 'texte' && inscription.texte}
            {inscription.etat === 'a_venir' && (
              <>Ouverture le <strong className="text-(--color-ink)">{fmtDate(inscription.debut, true)}</strong>
                {inscription.fin && <>, clôture le <strong className="text-(--color-ink)">{fmtDate(inscription.fin, true)}</strong></>}.</>
            )}
            {inscription.etat === 'ouverte' && (
              <>
                <span className="mr-1.5 inline-flex rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#166534]">Ouvertes</span>
                {inscription.fin
                  ? <>jusqu’au <strong className="text-(--color-ink)">{fmtDate(inscription.fin, true)}</strong>
                    {inscription.joursRestants != null && inscription.joursRestants <= 7 && <> — plus que {inscription.joursRestants} jour{inscription.joursRestants > 1 ? 's' : ''}</>}.</>
                  : null}
              </>
            )}
          </p>
        </div>
      )}

      {postes.length > 0 && (
        <div className="mt-4 border-t border-(--color-border) pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">Nombre de postes</p>
          <div className={`mt-2 grid gap-3 ${postes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {postes.map((p) => {
              const sienne = voie === p.voie;
              return (
                <div key={p.voie} className={`rounded-2xl border px-3 py-2.5 ${sienne ? 'border-(--color-primary)/40 bg-(--color-primary-soft)/30' : 'border-(--color-border)'}`}>
                  <p className="text-[11px] font-semibold text-(--color-ink-soft)">{p.label}{sienne && ' · votre voie'}</p>
                  <p className="text-2xl font-black tabular-nums text-(--color-primary)">{p.n}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dates.length > 0 && (
        <div className="mt-4 border-t border-(--color-border) pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-ink-muted)">Calendrier</p>
          <ul className="mt-2 space-y-2">
            {dates.map((e, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <CalendarDays className="h-4 w-4 shrink-0 text-(--color-primary)" />
                <span className="flex-1 truncate text-(--color-ink-soft)">{e.label}</span>
                <span className="shrink-0 rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">{fmtDate(e.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fiche.note && <p className="mt-4 text-[13px] leading-relaxed text-(--color-ink-soft)">{fiche.note}</p>}

      {fiche.lien_label && fiche.lien_url && <BoutonLien label={fiche.lien_label} href={fiche.lien_url} />}
    </article>
  );
}

/* ------------ Plusieurs spécialités : une seule carte compacte ------------ */
function EpreuvesCompactes({ fiches, maintenant }: { fiches: { id: string; nom: string; fiche: FicheConcours }[]; maintenant: number }) {
  return (
    <article className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <header className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: '#FCEAEC', color: '#A91D2C' }}>
          <CalendarCheck className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">Vos épreuves</h3>
          <p className="mt-0.5 text-[17px] font-black leading-tight tracking-tight text-(--color-primary)">{TEXTES_COMMUNS.session}</p>
        </div>
      </header>
      <ul className="mt-4 divide-y divide-(--color-border)">
        {fiches.map(({ id, nom, fiche }) => (
          <li key={id} className="flex items-center gap-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-(--color-ink)">{nom}</span>
            {fiche.date_epreuve ? (
              <>
                <span className="shrink-0 text-[11px] text-(--color-ink-muted)">{fmtDate(fiche.date_epreuve)}</span>
                <span className="w-14 shrink-0 text-right text-sm font-black tabular-nums text-(--color-primary)"><Compteur jours={joursAvant(fiche.date_epreuve, maintenant)} /></span>
              </>
            ) : (
              <span className="shrink-0 text-[11px] font-semibold text-(--color-ink-muted)">Bientôt communiquée</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ------------ Messages libres ------------ */
const ICON_MAP: Record<string, LucideIcon> = {
  calendar: Calendar, calendar_days: CalendarDays, calendar_check: CalendarCheck, user_check: UserCheck,
  chart: BarChart3, medal: Medal, trophy: Trophy, megaphone: Megaphone, bell: Bell, info: Info,
};

/* On évite volontairement le vert à côté du rouge de la marque : le ton
 * 'green' est remappé sur un bleu profond. */
const TONS: Record<string, { bg: string; fg: string }> = {
  red: { bg: '#FCEAEC', fg: '#A91D2C' },
  green: { bg: '#EAF1FB', fg: '#1E40AF' },
  blue: { bg: '#EAF1FB', fg: '#1E40AF' },
  orange: { bg: '#FFEAD9', fg: '#B45B00' },
  purple: { bg: '#F1E8FD', fg: '#6D28D9' },
  gray: { bg: '#F1F1F4', fg: '#5B6478' },
};

type Message = DonneesAnnonces['messages'][number];
type MessageData = { body?: string; subtitle?: string; cta_label?: string; cta_href?: string; cta_external?: boolean; footer_note?: string };

function MessageCard({ m }: { m: Message }) {
  const Icon = ICON_MAP[m.icon_key ?? ''] ?? Megaphone;
  const ton = TONS[m.badge_tone ?? 'red'] ?? TONS.red;
  const d = m.data as MessageData;
  return (
    <article className="rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      <header className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: ton.bg, color: ton.fg }}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-black leading-tight tracking-tight text-(--color-ink)">{m.title}</h3>
          {d.subtitle && <p className="mt-0.5 text-[15px] font-bold leading-tight text-(--color-primary)">{d.subtitle}</p>}
        </div>
        {m.badge_label && (
          <span className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: ton.bg, color: ton.fg }}>
            {m.badge_label}
          </span>
        )}
      </header>
      {d.body && <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed text-(--color-ink-soft)">{d.body}</p>}
      {d.cta_label && d.cta_href && <BoutonLien label={d.cta_label} href={d.cta_href} />}
      {d.footer_note && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3" style={{ background: '#EAF1FB', borderColor: 'rgba(30,64,175,0.15)' }}>
          <Bell className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#1E40AF' }} strokeWidth={2} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: '#1F2937' }}>{d.footer_note}</p>
        </div>
      )}
    </article>
  );
}

function BoutonLien({ label, href }: { label: string; href: string }) {
  const externe = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      target={externe ? '_blank' : undefined}
      rel={externe ? 'noopener noreferrer' : undefined}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--color-primary) px-4 py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_30px_-10px_rgba(192,17,46,0.45)] transition-transform hover:scale-[1.01]"
    >
      {label}
      {externe ? <ExternalLink className="h-4 w-4" strokeWidth={2.5} /> : <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
    </a>
  );
}
