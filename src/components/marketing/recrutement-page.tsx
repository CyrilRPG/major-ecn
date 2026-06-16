'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Calendar, Check, CheckCircle2, ClipboardCheck, FileText,
  GraduationCap, Heart, MessageCircle, Microscope, Monitor, PenTool, Play, Send,
  Shield, ShieldCheck, Star, Stethoscope, Upload, Users, Video, X,
} from 'lucide-react';
import { Reveal } from './reveal';
import { SpotlightCard } from './premium-ui';
import { TurnstileWidget } from './turnstile-widget';

/** Le captcha est requis côté UI uniquement si la clé publique est configurée. */
const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_SOFT = '#FDE8EC';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const BORDER = '#E5E9F0';
const FONT = "'Plus Jakarta Sans', sans-serif";

const COUNTRIES = [
  'France', 'Algerie', 'Maroc', 'Tunisie', 'Liban', 'Syrie', 'Egypte', 'Irak',
  'Jordanie', 'Libye', 'Mauritanie', 'Senegal', 'Cameroun', 'Cote d\'Ivoire',
  'Mali', 'Congo (RDC)', 'Congo (Brazzaville)', 'Gabon', 'Madagascar', 'Benin',
  'Burkina Faso', 'Tchad', 'Niger', 'Togo', 'Guinee', 'Djibouti', 'Comores',
  'Haiti', 'Roumanie', 'Moldavie', 'Ukraine', 'Russie', 'Georgie', 'Armenie',
  'Bresil', 'Colombie', 'Venezuela', 'Chili', 'Argentine', 'Mexique',
  'Iran', 'Afghanistan', 'Pakistan', 'Inde', 'Bangladesh', 'Sri Lanka',
  'Turquie', 'Albanie', 'Kosovo', 'Serbie', 'Bosnie-Herzegovine',
  'Chine', 'Vietnam', 'Cambodge', 'Philippines', 'Autre',
];

type ModalStep = 1 | 2 | 3;

type DocKey = 'cv' | 'lettre' | 'diplomes' | 'publications';
const DOC_SLOTS: { key: DocKey; title: string; desc: string; color: string }[] = [
  { key: 'cv', title: 'CV à jour *', desc: 'Votre curriculum vitae actualisé', color: RED },
  { key: 'lettre', title: 'Lettre de motivation (facultatif)', desc: 'Expliquez vos motivations et vos centres d’intérêt', color: '#F59E0B' },
  { key: 'diplomes', title: 'Diplômes et titres (facultatif)', desc: 'Copies de vos diplômes et titres universitaires', color: '#7C3AED' },
  { key: 'publications', title: 'Publications / travaux (facultatif)', desc: 'Articles, travaux, publications ou communications', color: '#2563EB' },
];

/** Lit un fichier et renvoie son contenu base64 (sans préfixe data URI). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function ApplicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<ModalStep>(1);
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', message: '' });
  const [docs, setDocs] = useState<Record<DocKey, File | null>>({ cv: null, lettre: null, diplomes: null, publications: null });
  const [attested, setAttested] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const submit = async () => {
    if (!form.first.trim() || !form.last.trim() || !form.email.trim()) {
      setErrMsg('Renseignez vos prénom, nom et email (étape 1).'); setStatus('error'); setStep(1); return;
    }
    if (!docs.cv) { setErrMsg('Le CV est obligatoire pour soumettre votre candidature.'); setStatus('error'); return; }
    if (!attested) { setErrMsg('Veuillez attester l’exactitude des informations fournies.'); setStatus('error'); return; }
    if (TURNSTILE_ENABLED && !captchaToken) { setErrMsg('Merci de valider le test anti-robot.'); setStatus('error'); return; }
    const chosen = DOC_SLOTS
      .map((slot) => ({ slot, file: docs[slot.key] }))
      .filter((x): x is { slot: typeof DOC_SLOTS[number]; file: File } => x.file != null);
    // Limite à 3 Mo au total : une fois encodés en base64 (~+33 %) + le JSON,
    // la requête reste sous le plafond ~4,5 Mo des fonctions serverless (Vercel).
    if (chosen.reduce((t, x) => t + x.file.size, 0) > 3 * 1024 * 1024) {
      setErrMsg('Vos documents dépassent 3 Mo au total. Compressez votre PDF ou envoyez-les directement à contact@major-ecn.fr.');
      setStatus('error'); return;
    }
    setStatus('submitting'); setErrMsg('');
    try {
      const attachments = await Promise.all(
        chosen.map(async (x) => ({ filename: `${x.slot.key.toUpperCase()} - ${x.file.name}`, content: await fileToBase64(x.file) })),
      );
      const res = await fetch('/api/recrutement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.first} ${form.last}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          turnstileToken: captchaToken,
          attachments,
        }),
      });
      // 413 : corps de requête trop volumineux (notre garde-fou OU le plafond
      // serverless de Vercel, qui peut répondre sans JSON). Message clair visible.
      if (res.status === 413) {
        setErrMsg('Vos documents sont trop volumineux (3 Mo max au total). Compressez votre PDF ou envoyez-les directement à contact@major-ecn.fr.');
        setStatus('error'); setCaptchaToken(''); setCaptchaNonce((n) => n + 1);
        return;
      }
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErrMsg(j.error ?? 'Erreur à l’envoi. Réessayez.'); setStatus('error');
        setCaptchaToken(''); setCaptchaNonce((n) => n + 1);
        return;
      }
      setStatus('success');
    } catch {
      setErrMsg('Connexion impossible. Réessayez dans un instant.'); setStatus('error');
      setCaptchaToken(''); setCaptchaNonce((n) => n + 1);
    }
  };

  if (!open) return null;

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl" style={{ fontFamily: FONT }}>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: '#0F8A6A' }}>
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-xl font-black" style={{ color: NAVY }}>Candidature envoyée !</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
            Merci, votre candidature et vos documents ont bien été transmis à l’équipe Major ECN.
            Nous vous recontacterons dans les meilleurs délais.
          </p>
          <button onClick={onClose} className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: RED }}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8" style={{ fontFamily: FONT }}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
          <X className="h-5 w-5" style={{ color: INK_SOFT }} />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#EDE9FE', color: NAVY }}>
            <FileText className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black" style={{ color: NAVY }}>Déposer ma candidature</h2>
        </div>
        <p className="text-sm" style={{ color: INK_SOFT }}>
          Rejoignez notre équipe pédagogique et contribuez à la réussite des candidats EVC.
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-0">
          {[
            { n: 1, label: 'Informations\npersonnelles' },
            { n: 2, label: 'Profil\nprofessionnel' },
            { n: 3, label: 'Documents\net disponibilités' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              {i > 0 && <div className="h-0.5 w-12" style={{ background: step > s.n - 1 ? RED : '#E5E7EB' }} />}
              <div className="flex flex-col items-center gap-1">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step > s.n ? 'bg-red-600 text-white' : step === s.n ? 'text-white' : 'bg-gray-200 text-gray-500'}`}
                  style={step === s.n ? { background: RED } : step > s.n ? { background: RED } : {}}>
                  {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span className="text-center text-[10px] leading-tight font-semibold whitespace-pre-line" style={{ color: step >= s.n ? NAVY : INK_SOFT }}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Informations personnelles */}
        {step === 1 && (
          <div className="mt-6">
            <h3 className="text-base font-black" style={{ color: NAVY }}>Informations personnelles</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Prénom *</label>
                <input value={form.first} onChange={(e) => setForm((f) => ({ ...f, first: e.target.value }))} placeholder="Votre prénom" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Nom *</label>
                <input value={form.last} onChange={(e) => setForm((f) => ({ ...f, last: e.target.value }))} placeholder="Votre nom" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>E-mail *</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="exemple@email.com" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Téléphone *</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="06 12 34 56 78" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Pays de résidence *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option value="">Sélectionnez un pays</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Ville *</label>
                <input placeholder="Votre ville" className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER }} />
              </div>
            </div>

            <h3 className="mt-6 text-base font-black" style={{ color: NAVY }}>Profil professionnel (aperçu)</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Statut actuel *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez votre statut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Spécialité principale *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez votre spécialité</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold" style={{ color: INK }}>Autres spécialités (le cas échéant)</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez une ou plusieurs spécialités</option>
                </select>
              </div>
            </div>

            <h3 className="mt-6 text-base font-black" style={{ color: NAVY }}>Missions d\'interet (aperçu)</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <p className="mt-2 text-xs" style={{ color: INK_SOFT }}>Sélectionnez les types de missions qui vous intéressent :</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['Enseignement', 'Création de QCM', 'Cas cliniques', 'Fiches pédagogiques', 'Relecture scientifique', 'Webinaires', 'Correction de dossiers', 'Élaboration d\'epreuves blanches', 'Autre (précisez)'].map(m => (
                <label key={m} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="checkbox" className="rounded" /> {m}
                </label>
              ))}
            </div>

            <h3 className="mt-6 text-base font-black" style={{ color: NAVY }}>Disponibilités (aperçu)</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <p className="mt-2 text-xs font-bold" style={{ color: INK }}>Temps disponible moyen par mois *</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {['Moins de 5 h', '5 à 10 h', '10 à 20 h', 'Plus de 20 h'].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="radio" name="availability" /> {t}
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl p-4" style={{ background: '#F0F4FA' }}>
              <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: NAVY }} />
              <p className="text-xs" style={{ color: INK_SOFT }}>
                Toutes les candidatures sont étudiées avec attention. Nous vous recontacterons dans les meilleurs délais.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: RED }}>
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Profil professionnel */}
        {step === 2 && (
          <div className="mt-6">
            <h3 className="text-base font-black" style={{ color: NAVY }}>Profil professionnel</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Statut actuel *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez votre statut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Spécialité principale *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez votre spécialité</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold" style={{ color: INK }}>Autres spécialités (le cas échéant)</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez une ou plusieurs spécialités</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Année(s) d'exercice *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold" style={{ color: INK }}>Lieu d'exercice principal *</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                  <option>Sélectionnez votre lieu d'exercice</option>
                </select>
              </div>
            </div>

            <p className="mt-4 text-xs font-bold" style={{ color: INK }}>Expérience dans l'enseignement / la formation *</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {['Aucune', '1 à 3 ans', '3 à 5 ans', 'Plus de 5 ans'].map(e => (
                <label key={e} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="radio" name="experience" /> {e}
                </label>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold" style={{ color: INK }}>Avez-vous déjà contribué à des contenus pédagogiques ? *</p>
            <div className="mt-2 flex gap-4">
              {['Non', 'Oui'].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="radio" name="contributed" /> {v}
                </label>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold" style={{ color: INK }}>Si oui, lesquels ?</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['QCM', 'Cas cliniques', 'Fiches pédagogiques', 'Relecture scientifique', 'Cours / supports', 'Autre (précisez)'].map(c => (
                <label key={c} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="checkbox" className="rounded" /> {c}
                </label>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold" style={{ color: INK }}>Motivations (quel(s) domaine(s) vous intéressent particulièrement ?) *</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['Enseignement', 'Création de QCM', 'Cas cliniques', 'Fiches pédagogiques', 'Relecture scientifique', 'Webinaires / vidéos', 'Correction de dossiers', 'Élaboration d\'epreuves blanches', 'Autre (précisez)'].map(m => (
                <label key={m} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <input type="checkbox" className="rounded" /> {m}
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl p-4" style={{ background: '#F0F4FA' }}>
              <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: NAVY }} />
              <p className="text-xs" style={{ color: INK_SOFT }}>
                Toutes les candidatures sont étudiées avec attention. Nous vous recontacterons dans les meilleurs délais.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold" style={{ borderColor: BORDER, color: NAVY }}>
                ← Précédent
              </button>
              <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: RED }}>
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Documents et disponibilités */}
        {step === 3 && (
          <div className="mt-6">
            <h3 className="text-base font-black" style={{ color: NAVY }}>Documents et disponibilités</h3>
            <div className="mt-1 h-0.5 w-10" style={{ background: RED }} />
            <p className="mt-2 text-xs font-bold" style={{ color: INK }}>Documents à joindre *</p>
            <p className="text-xs" style={{ color: INK_SOFT }}>Formats acceptés : PDF, DOC, DOCX — 3 Mo au total maximum. Au-delà, écrivez-nous à contact@major-ecn.fr.</p>

            <div className="mt-4 space-y-3">
              {DOC_SLOTS.map((d) => {
                const f = docs[d.key];
                return (
                  <div key={d.key} className="flex items-center justify-between gap-3 rounded-xl border p-4" style={{ borderColor: f ? d.color : BORDER }}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${d.color}15`, color: d.color }}>
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold" style={{ color: INK }}>{d.title}</p>
                        <p className="truncate text-xs" style={{ color: f ? d.color : INK_SOFT }}>{f ? f.name : d.desc}</p>
                      </div>
                    </div>
                    <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-50" style={{ borderColor: BORDER, color: INK }}>
                      <Upload className="h-3.5 w-3.5" /> {f ? 'Remplacer' : 'Ajouter un fichier'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => { const file = e.currentTarget.files?.[0] ?? null; setDocs((prev) => ({ ...prev, [d.key]: file })); }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>

            <h4 className="mt-6 text-sm font-black" style={{ color: NAVY }}>Disponibilités</h4>
            <p className="mt-1 text-xs font-bold" style={{ color: INK }}>Temps disponible moyen par mois *</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {['Moins de 5 h', '5 à 10 h', '10 à 20 h', 'Plus de 20 h'].map((t, i) => (
                <label key={t} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${i === 1 ? 'border-red-500' : ''}`}
                  style={{ borderColor: i === 1 ? RED : BORDER, color: INK }}>
                  <input type="radio" name="time" defaultChecked={i === 1} /> {t}
                </label>
              ))}
            </div>

            <h4 className="mt-6 text-sm font-bold" style={{ color: INK }}>Un message pour notre équipe (facultatif)</h4>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, 1000) }))}
              placeholder="Précisez vos attentes, vos domaines d'intérêt ou toute information utile..."
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm" style={{ borderColor: BORDER, minHeight: '100px' }} />
            <p className="mt-1 text-right text-xs" style={{ color: INK_SOFT }}>{form.message.length}/1000</p>

            <label className="mt-4 flex items-start gap-2 text-sm" style={{ color: INK }}>
              <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} className="mt-1 rounded" style={{ accentColor: RED }} />
              <span>J'atteste sur l'honneur l'exactitude des informations fournies. *
                <br /><span className="text-xs" style={{ color: INK_SOFT }}>En soumettant ce formulaire, j'accepte que Major ECN utilise mes données pour traiter ma candidature.</span>
              </span>
            </label>

            <div className="mt-4 flex items-center gap-3 rounded-xl p-4" style={{ background: '#F0F4FA' }}>
              <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: NAVY }} />
              <p className="text-xs" style={{ color: INK_SOFT }}>
                Toutes les candidatures sont étudiées avec attention. Nous vous recontacterons dans les meilleurs délais.
              </p>
            </div>

            {/* Captcha anti-robot (Cloudflare Turnstile) */}
            {TURNSTILE_ENABLED && (
              <div className="mt-4 flex justify-center">
                <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
              </div>
            )}

            {status === 'error' && (
              <p className="mt-4 rounded-xl border px-4 py-3 text-[13px]" style={{ borderColor: 'rgba(192,17,46,0.25)', background: '#FCEAEC', color: RED }}>
                {errMsg}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold" style={{ borderColor: BORDER, color: NAVY }}>
                ← Précédent
              </button>
              <button type="button" onClick={submit} disabled={status === 'submitting'} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60" style={{ background: RED }}>
                {status === 'submitting' ? 'Envoi…' : <>Soumettre ma candidature <Send className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RecrutementPageContent() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden" style={{ fontFamily: FONT, background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 30%, #FFF8F9 60%, #FFFFFF 100%)' }}>
      {/* Décor global */}
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(192,17,46,0.22), transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[35%] h-[420px] w-[420px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(15,31,77,0.18), transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-[10%] h-[380px] w-[380px] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)' }} />

      {/* HERO premium */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="py-16 lg:py-24 lg:pr-12">
              {/* Badge top avec icône */}
              <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-[0_8px_24px_-12px_rgba(192,17,46,0.30)] backdrop-blur-sm" style={{ borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
                <Users className="h-3.5 w-3.5" />
                Recrutement Major ECN
              </span>
              <h1 className="mt-5 text-[2rem] font-black leading-[1.06] tracking-tight sm:text-4xl lg:text-[3.25rem]">
                <span style={{ color: NAVY }}>Participez à la réussite</span><br />
                <span style={{ backgroundImage: 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 50%, #E8742C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
                  des candidats EVC
                </span>
              </h1>
              <p className="mt-6 text-[15.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                Depuis 2011, Major ECN développe des ressources pédagogiques
                utilisées par des milliers de professionnels de santé préparant les{' '}
                <strong style={{ color: NAVY }}>Épreuves de Vérification des Connaissances</strong>.
              </p>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {['Enseignement', 'Création de contenus pédagogiques', 'Relecture scientifique', 'Accompagnement candidats EVC'].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold" style={{ borderColor: BORDER, color: NAVY }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: RED }} />
                    {t}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => setModalOpen(true)} className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_32px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(90deg, #8B0E22 0%, ${RED} 100%)` }}>
                  Déposer ma candidature <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a href="#pourquoi-rejoindre" className="inline-flex items-center gap-2 rounded-xl border bg-white px-6 py-3.5 text-sm font-extrabold transition-colors hover:bg-[#FCEAEC]" style={{ borderColor: 'rgba(192,17,46,0.25)', color: RED }}>
                  Découvrir Major ECN <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              {/* Image avec overlay subtil et coins arrondis */}
              <div className="absolute inset-0 overflow-hidden rounded-l-3xl shadow-2xl">
                <img src="/recrutement/hero-recrutement.jpg" alt="Équipe médicale en réunion"
                  className="h-full w-full object-cover" />
                <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(15,31,77,0.10) 100%)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT POUVEZ-VOUS CONTRIBUER — texte original */}
      <section className="relative py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-black" style={{ color: NAVY }}>Comment pouvez-vous contribuer ?</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { Icon: BookOpen, t: 'Enseignement' },
              { Icon: ClipboardCheck, t: 'Création\nde QCM' },
              { Icon: Stethoscope, t: 'Cas cliniques' },
              { Icon: FileText, t: 'Fiches\npédagogiques' },
              { Icon: Microscope, t: 'Relecture\nscientifique' },
              { Icon: Monitor, t: 'Webinaires\npédagogiques' },
            ].map((c, i) => (
              <Reveal key={c.t} delay={0.05 * i}>
                <SpotlightCard spotlightColor="rgba(192,17,46,0.15)" className="h-full rounded-2xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: BORDER }}>
                  <div className="flex h-full flex-col items-center gap-3 p-5 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: '#F0F4FA', color: NAVY }}>
                      <c.Icon className="h-6 w-6" />
                    </span>
                    <p className="text-sm font-bold whitespace-pre-line" style={{ color: NAVY }}>{c.t}</p>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — texte original avec compteurs animés sur 2 KPIs numériques */}
      <section className="relative pb-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { Icon: Users, big: '9 000+', sub: 'médecins\naccompagnés' },
              { Icon: GraduationCap, big: '45', sub: 'spécialités EVC\ncouvertes' },
              { Icon: Calendar, big: 'Depuis 2011', sub: '' },
              { Icon: Star, big: '15 ans', sub: "d'experience\npedagogique" },
            ].map(s => (
              <div key={s.big} className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                  <s.Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xl font-black" style={{ color: NAVY }}>{s.big}</p>
                  <p className="text-xs whitespace-pre-line" style={{ color: INK_SOFT }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 COLUMNS: profils, missions, pourquoi */}
      <section className="bg-[#F8F9FC] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profils recherchés */}
            <div>
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Des profils médicaux et pédagogiques recherchés</h3>
              <div className="mt-4">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: NAVY }}>
                  <Stethoscope className="h-4 w-4" style={{ color: RED }} /> Enseignement &amp; expertise médicale
                </p>
                <ul className="mt-2 ml-6 space-y-1">
                  {['Praticiens hospitaliers (PH)', 'Chefs de clinique assistants (CCA)', 'Médecins spécialistes', 'Professeurs des universités (PU-PH)'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                      <Check className="h-3.5 w-3.5" style={{ color: '#2E7D32' }} /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <p className="flex items-center gap-2 text-sm font-bold" style={{ color: NAVY }}>
                  <PenTool className="h-4 w-4" style={{ color: RED }} /> Conception &amp; développement pédagogique
                </p>
                <ul className="mt-2 ml-6 space-y-1">
                  {['Internes', 'Docteurs juniors', 'Assistants', 'Enseignants universitaires', 'Médecins spécialistes'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                      <Check className="h-3.5 w-3.5" style={{ color: '#2E7D32' }} /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missions variées */}
            <div>
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Des missions variées au service de la pédagogie</h3>
              <ul className="mt-4 space-y-1.5">
                {['Création de QCM', 'Création de cas cliniques', 'Création de fiches pédagogiques', 'Relecture scientifique', 'Mise à jour documentaire', 'Correction de dossiers', 'Animation de cours', 'Webinaires pédagogiques', 'Élaboration d\'epreuves blanches', 'Accompagnement pédagogique'].map(m => (
                  <li key={m} className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                    <Check className="h-3.5 w-3.5" style={{ color: RED }} /> {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pourquoi rejoindre */}
            <div id="pourquoi-rejoindre">
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Pourquoi rejoindre Major ECN ?</h3>
              <ul className="mt-4 space-y-2">
                {[
                  'Participer à un projet pédagogique reconnu',
                  'Contribuer à la réussite des candidats EVC',
                  'Valoriser votre expertise médicale',
                  'Intervenir selon vos disponibilités',
                  'Participer à des projets concrets',
                  'Travailler sur des contenus à fort impact',
                ].map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm" style={{ color: INK }}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: RED_SOFT, color: RED }}>
                      <Check className="h-3 w-3" />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* EXIGENCE PÉDAGOGIQUE */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 rounded-2xl p-6" style={{ background: '#F0F4FA' }}>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: RED_SOFT, color: RED }}>
              <ShieldCheck className="h-8 w-8" />
            </span>
            <div className="flex-1">
              <p className="text-base font-black uppercase" style={{ color: NAVY }}>EXIGENCE PÉDAGOGIQUE ET VALIDATION SCIENTIFIQUE</p>
              <p className="mt-1 text-sm" style={{ color: INK_SOFT }}>
                Tous les contenus pédagogiques diffusés sur Major ECN font l'objet d'un processus de relecture et de validation avant publication.
              </p>
            </div>
            <div className="hidden sm:flex gap-6">
              {['Rigueur\nscientifique', 'Relecture\npédagogique', 'Actualisation\nrégulière', 'Contrôle qualité\ndes contenus'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: RED }} />
                  <span className="text-xs font-semibold whitespace-pre-line" style={{ color: NAVY }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESSUS DE CANDIDATURE */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-black" style={{ color: NAVY }}>Processus de candidature</h2>
              <div className="mt-6 space-y-6">
                {[
                  { n: 1, t: 'Dépôt de candidature', d: 'Envoyez votre candidature en quelques minutes.' },
                  { n: 2, t: 'Étude du profil', d: 'Notre équipe étudie votre profil et vos compétences.' },
                  { n: 3, t: 'Échange avec notre équipe', d: 'Un échange peut être proposé pour mieux comprendre vos attentes.' },
                  { n: 4, t: 'Intégration', d: 'Si votre profil correspond à nos besoins, vous rejoignez notre équipe selon les projets pédagogiques.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: RED }}>
                      {s.n}
                    </span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: NAVY }}>{s.t}</p>
                      <p className="mt-0.5 text-sm" style={{ color: INK_SOFT }}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire inline - Step 1 */}
            <div className="rounded-2xl border p-6" style={{ borderColor: BORDER }}>
              <h3 className="text-lg font-black" style={{ color: NAVY }}>Deposer votre candidature</h3>
              {/* Step indicators */}
              <div className="mt-4 flex items-center gap-0 justify-center">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: RED }}>1</span>
                  <span className="mt-1 text-[10px] font-semibold" style={{ color: NAVY }}>Informations</span>
                </div>
                <div className="h-0.5 w-10" style={{ background: '#E5E7EB' }} />
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: '#E5E7EB', color: INK_SOFT }}>2</span>
                  <span className="mt-1 text-[10px]" style={{ color: INK_SOFT }}>Profil</span>
                </div>
                <div className="h-0.5 w-10" style={{ background: '#E5E7EB' }} />
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: '#E5E7EB', color: INK_SOFT }}>3</span>
                  <span className="mt-1 text-[10px]" style={{ color: INK_SOFT }}>Documents</span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>Prenom *</label>
                  <input placeholder="Votre prenom" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>Nom *</label>
                  <input placeholder="Votre nom" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>E-mail *</label>
                  <input type="email" placeholder="exemple@email.com" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>Telephone *</label>
                  <input placeholder="06 12 34 56 78" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>Pays de residence *</label>
                  <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER, color: INK_SOFT }}>
                    <option value="">Selectionnez un pays</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold" style={{ color: INK }}>Ville *</label>
                  <input placeholder="Votre ville" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: BORDER }} />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: RED }}>
                  Suivant <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-10" style={{ background: NAVY }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <ShieldCheck className="h-7 w-7 text-white" />
              </span>
              <div>
                <p className="text-lg font-black text-white">
                  Vous souhaitez mettre votre <span style={{ color: '#F59E0B' }}>expertise</span> au service des candidats EVC ?
                </p>
                <p className="text-sm text-white/70">
                  Depuis 2011, Major ECN accompagne les professionnels de santé préparant les EVC grâce à des ressources pédagogiques développées avec rigueur et exigence.
                </p>
              </div>
            </div>
            <button onClick={() => setModalOpen(true)} className="shrink-0 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: RED }}>
              Déposer ma candidature <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <ApplicationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
