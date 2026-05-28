import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { AppShell } from '@/components/shell/app-shell';
import { SatisfactionBanner } from '@/components/student/satisfaction-banner';
import { getNavigatorTree } from '@/lib/data/navigator';
import { isUserTargeted } from '@/lib/schemas/satisfaction';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;
  const tree = await getNavigatorTree(profile);

  // Détection des formulaires en attente pour cet utilisateur
  const supabase = await createClient();
  const [{ data: forms }, { data: responses }] = await Promise.all([
    supabase
      .from('satisfaction_forms')
      .select('id, title, intro_text, mandatory, target_promo, target_offer, target_college')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('satisfaction_responses')
      .select('form_id')
      .eq('user_id', user.id),
  ]);
  const answeredIds = new Set((responses ?? []).map((r) => r.form_id));
  const pending = (forms ?? [])
    .filter((f) => !answeredIds.has(f.id))
    .filter((f) => isUserTargeted(f, {
      promotion: profile.promotion,
      permission_scope: profile.permission_scope,
    }));

  const mandatoryPending = pending.find((f) => f.mandatory);
  const optionalPending = pending.filter((f) => !f.mandatory);

  // Si formulaire obligatoire et utilisateur pas déjà sur sa page → redirection
  const h = await headers();
  const pathname = h.get('x-invoke-path') ?? h.get('x-pathname') ?? '';
  const onFormPage = pathname.startsWith('/formulaires/');
  if (mandatoryPending && !onFormPage) {
    redirect(`/formulaires/${mandatoryPending.id}`);
  }

  return (
    <div className="flex h-screen flex-col">
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="min-h-0 flex-1">
        <AppShell profile={profile} tree={tree}>
          {optionalPending.length > 0 && !onFormPage && (
            <SatisfactionBanner form={optionalPending[0]} />
          )}
          {children}
        </AppShell>
      </div>
    </div>
  );
}
