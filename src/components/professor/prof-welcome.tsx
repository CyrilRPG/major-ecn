import Link from 'next/link';
import {
  AlertCircle, ArrowRight, BookOpen, ClipboardCheck, FileText, GraduationCap, Layers3,
  MessagesSquare, Pencil, Sparkles, Stethoscope,
} from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import type { Profile } from '@/lib/auth/get-profile';
import type { NavCollege } from '@/lib/data/navigator';

/**
 * Page d'accueil dédiée aux professeurs.
 * Affiche les collèges accessibles (selon `permission_scope.colleges`),
 * dépliant chaque collège pour montrer ses items éditables, et un
 * accès rapide au forum d'entraide.
 */
export function ProfWelcome({
  profile, tree,
}: { profile: Profile; tree: NavCollege[] }) {
  const firstName = profile.first_name?.trim() || profile.email?.split('@')[0] || 'Professeur';
  const totalItems = tree.reduce((acc, c) => acc + c.cours.length, 0);

  // Champs obligatoires côté enseignant (Nom, Prénom, Tel, Adresse).
  // Les documents (CV / certif / carte pro) sont contextuels — on les liste
  // dans le détail mais ils ne déclenchent pas seuls la bannière.
  const missing: string[] = [];
  if (!profile.first_name?.trim()) missing.push('prénom');
  if (!profile.last_name?.trim()) missing.push('nom');
  if (!profile.phone?.trim()) missing.push('téléphone');
  if (!profile.address?.trim()) missing.push('adresse postale');
  if (!profile.cv_url && !profile.certificat_scolarite_url && !profile.carte_pro_url) {
    missing.push('CV / certificat / carte pro');
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {missing.length > 0 && (
        <div className="mb-6 flex flex-wrap items-start gap-3 rounded-2xl border border-[#B26A00]/30 bg-[#FEF3E2] p-4 sm:p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B26A00]" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-[#7A4400]">Complétez votre dossier enseignant</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#7A4400]/90">
              Pour finaliser votre inscription, renseignez&nbsp;: <span className="font-semibold">{missing.join(', ')}</span>.
              Vos informations restent confidentielles et ne sont consultables que par l&rsquo;équipe administrative.
            </p>
          </div>
          <Link
            href="/profil"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B26A00] px-3.5 py-2 text-[12.5px] font-extrabold text-white hover:scale-[1.02] transition-transform"
          >
            Compléter mon profil
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
      {/* ───── En-tête de bienvenue ───── */}
      <header className="mb-8 overflow-hidden rounded-3xl border border-(--color-border) bg-[linear-gradient(135deg,#0E1626_0%,#2D0518_100%)] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">
              <Sparkles className="h-3 w-3" />
              Espace Professeur
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Bonjour {firstName} 👋
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-white/80 sm:text-[15px]">
              Choisissez le collège puis l&rsquo;item sur lequel vous souhaitez travailler.
              Sur chaque QCM et chaque flashcard, un bouton crayon vous permet de
              modifier le contenu directement depuis la vue étudiant.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#E4002B_0%,#F97316_100%)]">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/60">Vos accès</p>
              <p className="font-bold">
                {tree.length} collège{tree.length > 1 ? 's' : ''} · {totalItems} item{totalItems > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Forum + Accès rapide ───── */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/forum"
          className="group flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-[#E4002B] hover:shadow-(--shadow-lifted)"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]">
            <MessagesSquare className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-(--color-ink) group-hover:text-[#E4002B]">
              Forum Q&amp;R
            </p>
            <p className="text-[12.5px] text-(--color-ink-soft)">
              Questions des élèves auxquelles répondre, par cours.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/admin/qa"
          className="group flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-[#E4002B] hover:shadow-(--shadow-lifted)"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B26A00]">
            <Pencil className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-(--color-ink) group-hover:text-[#E4002B]">
              Mes questions à valider
            </p>
            <p className="text-[12.5px] text-(--color-ink-soft)">
              Panneau de modération des Q&amp;R en attente.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/admin/contenu"
          className="group flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-[#E4002B] hover:shadow-(--shadow-lifted)"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#6D28D9]">
            <BookOpen className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-(--color-ink) group-hover:text-[#E4002B]">
              Vue éditoriale
            </p>
            <p className="text-[12.5px] text-(--color-ink-soft)">
              Tableau complet des contenus (séries, fiches, vidéos).
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* ───── Collèges ───── */}
      <section>
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-(--color-ink)">Vos collèges</h2>
            <p className="mt-0.5 text-[13px] text-(--color-ink-soft)">
              Cliquez sur un item pour ouvrir la vue éditable (QCM, flashcards, fiche, vidéo).
            </p>
          </div>
          <span className="hidden text-[12px] text-(--color-ink-muted) sm:inline">
            {tree.length} collège{tree.length > 1 ? 's' : ''}
          </span>
        </header>

        {tree.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) p-8 text-center">
            <Stethoscope className="mx-auto h-10 w-10 text-(--color-ink-muted)" />
            <p className="mt-3 text-[14px] font-bold text-(--color-ink)">Aucun collège ne vous a encore été assigné.</p>
            <p className="mt-1 text-[12px] text-(--color-ink-soft)">
              Demandez à un administrateur de mettre à jour vos permissions.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((college) => {
              const Icon = iconFromKey(college.iconKey ?? undefined);
              const tint = college.colorHex || '#E4002B';
              return (
                <article
                  key={college.id}
                  className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)"
                >
                  <Link
                    href={`/matieres/${college.id}`}
                    className="group flex items-center gap-3 border-b border-(--color-border) px-5 py-4 transition-colors hover:bg-(--color-surface-soft)"
                  >
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: tint + '1A', color: tint }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-(--color-ink) group-hover:text-[#E4002B]">
                        {college.nom}
                      </p>
                      <p className="text-[11.5px] text-(--color-ink-muted)">
                        {college.cours.length} item{college.cours.length > 1 ? 's' : ''} accessibles
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  {college.cours.length === 0 ? (
                    <p className="px-5 py-4 text-[12px] italic text-(--color-ink-muted)">
                      Aucun item assigné pour ce collège.
                    </p>
                  ) : (
                    <ul className="divide-y divide-(--color-border)/60">
                      {college.cours.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/cours/${c.id}`}
                            className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-(--color-surface-soft)"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-100) text-(--color-ink-soft) group-hover:bg-[#FFE4E8] group-hover:text-[#E4002B]">
                              <FileText className="h-3.5 w-3.5" />
                            </span>
                            <span className="flex-1 truncate text-[13.5px] text-(--color-ink) group-hover:text-[#E4002B]">
                              {c.titre}
                            </span>
                            <span className="flex shrink-0 items-center gap-1 text-(--color-ink-muted)">
                              <ClipboardCheck className="h-3 w-3" />
                              <Layers3 className="h-3 w-3" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
