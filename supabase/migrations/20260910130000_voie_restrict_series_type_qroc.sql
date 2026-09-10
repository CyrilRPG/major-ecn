-- Voie de concours : les séries `type = 'qroc'` suivent la même règle que les
-- séries `type = 'qcm'` de `kind = 'qroc'`.
--
-- Le miroir Odontologie de Major ECN (col-ecn-odontologie) porte 906 séries
-- « Questions rédactionnelles » de type 'qroc'. La policy du 03/09/2026
-- exemptait tout `type <> 'qcm'` : un dentiste inscrit sur Major ECN en voie
-- interne (épreuve QCM) voyait donc ces séries rédactionnelles dans l'onglet
-- Exercices. Désormais seuls les types 'annale' et 'seance' restent hors de la
-- règle ; le sous-type réel d'une série 'qroc' est 'qroc'.
--
-- Les élèves de Major Odontologie (même base, faculté major-odonto) n'ont pas de
-- voie : `current_voie()` est nul et la règle ne s'applique pas à eux.
--
-- Miroir applicatif : src/lib/data/qcm-access-rules.ts (canStudentReadSerie).

drop policy if exists qcm_series_voie_restrict on public.qcm_series;

create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive
  for select
  using (
    (select public."current_role"()) is distinct from 'student'
    or type in ('annale', 'seance')
    or label ~* 'entra[iî]nement'
    -- Le sujet officiel d'une session n'appartient à aucune voie.
    or label ~* '^annales?\y'
    or case (select public.current_voie())
         when 'interne' then coalesce(kind, case when type = 'qroc' then 'qroc' else 'qcm' end) <> 'qroc'
         when 'externe' then coalesce(kind, case when type = 'qroc' then 'qroc' else 'qcm' end) = 'qroc' or coalesce(is_revisions, false)
         else true
       end
  );
