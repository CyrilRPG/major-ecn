-- Supprime l'amorçage artificiel 50-150 : le compteur commence à 1 (vraie 1re visite).
create or replace function public.increment_blog_view(p_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.blog_views (slug, view_count, updated_at)
  values (p_slug, 1, now())
  on conflict (slug)
  do update set view_count = public.blog_views.view_count + 1,
                updated_at = now()
  returning view_count into v_count;
  return v_count;
end;
$$;

-- Réinitialise les 6 articles publiés le 2026-07-06 (compteur potentiellement amorcé artificiellement).
delete from public.blog_views where slug in (
  'calendrier-inscription-concours-pae-2026-cng',
  'comment-major-ecn-accompagne-candidats-evc',
  'evc-edn-difference-a-ne-pas-confondre',
  'voie-interne-evc-logique-qcm',
  'comment-rediger-qroc-evc',
  'comment-choisir-specialite-evc'
);
