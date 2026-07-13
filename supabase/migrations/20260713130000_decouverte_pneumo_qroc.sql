-- =============================================================================
-- Espace Découverte — 10 QROC de Pneumologie (voie externe).
--   La voie externe voit les séries QROC (kind='qroc') ; on ajoute donc une série
--   QROC au cours « Pneumologie » du collège Découverte, à partir de son contenu
--   (BPCO, asthme, plèvre). Insérer des questions format='qroc' bascule la série
--   en kind='qroc' via trigger.
-- Idempotent : ne fait rien si la série QROC existe déjà.
-- =============================================================================
do $$
declare
  v_cours uuid;
  v_serie uuid;
begin
  select c.id into v_cours
    from public.cours c
   where c.matiere_id = 'col-decouverte'
     and lower(c.titre) = 'pneumologie'
   limit 1;
  if v_cours is null then
    raise notice 'Cours Pneumologie (Découverte) introuvable, skip.';
    return;
  end if;

  if exists (
    select 1 from public.qcm_series s
     where s.cours_id = v_cours and s.label like 'QROC — Découverte · Pneumologie%'
  ) then
    return; -- déjà présent
  end if;

  insert into public.qcm_series (cours_id, type, label, order_index)
  values (v_cours, 'qcm', 'QROC — Découverte · Pneumologie (BPCO, asthme, plèvre)', 30)
  returning id into v_serie;

  insert into public.qcm_questions (serie_id, enonce, order_index, format, reponse_attendue, correction_generale)
  values
    (v_serie, 'Quel examen fonctionnel confirme le diagnostic de BPCO ?', 0, 'qroc',
     'spirométrie|spirometrie|EFR|explorations fonctionnelles respiratoires|EFR (spirométrie)',
     'Le diagnostic de BPCO repose sur la spirométrie (EFR) qui objective un trouble ventilatoire obstructif non complètement réversible.'),
    (v_serie, 'Quel critère spirométrique définit le trouble ventilatoire obstructif (TVO) ?', 1, 'qroc',
     'VEMS/CVF < 0,70|VEMS/CVF < 0.70|rapport VEMS/CVF < 70%|Tiffeneau < 0,70|VEMS/CVF inférieur à 0,70 après bronchodilatateur',
     'Un rapport VEMS/CVF < 0,70 après bronchodilatateur définit le TVO (obstruction bronchique).'),
    (v_serie, 'Quel est le principal facteur de risque de la BPCO ?', 2, 'qroc',
     'tabac|tabagisme|le tabac|tabagisme actif|consommation de tabac',
     'Le tabagisme est de loin le principal facteur de risque de BPCO (≈ 80 % des cas).'),
    (v_serie, 'Quelle classe thérapeutique constitue le traitement de fond de première intention de la BPCO symptomatique ?', 3, 'qroc',
     'bronchodilatateurs de longue durée d''action|BDLA|LABA/LAMA|LAMA|LABA|bronchodilatateurs longue durée',
     'Le traitement de fond repose sur les bronchodilatateurs de longue durée d''action (LAMA et/ou LABA).'),
    (v_serie, 'Citez le germe le plus fréquemment responsable d''une exacerbation infectieuse de BPCO.', 4, 'qroc',
     'Haemophilus influenzae|H. influenzae|pneumocoque|Streptococcus pneumoniae|Moraxella catarrhalis',
     'Les exacerbations bactériennes de BPCO sont surtout dues à Haemophilus influenzae, au pneumocoque et à Moraxella catarrhalis.'),
    (v_serie, 'Quel examen d''imagerie de première intention réalisez-vous devant une suspicion de pneumothorax ?', 5, 'qroc',
     'radiographie thoracique|radiographie de thorax|radio de thorax de face|radiographie thoracique de face|RP',
     'La radiographie thoracique de face est l''examen de première intention (décollement pleural, hyperclarté avasculaire).'),
    (v_serie, 'Quel critère de l''EFR affirme la réversibilité de l''obstruction dans l''asthme ?', 6, 'qroc',
     'augmentation du VEMS ≥ 12% et 200 mL|gain VEMS >= 12% et 200 ml|réversibilité VEMS +12% et +200 mL après bronchodilatateur|VEMS +12% et +200 mL',
     'Réversibilité significative = augmentation du VEMS d''au moins 12 % ET 200 mL après bronchodilatateur.'),
    (v_serie, 'Citez un signe clinique de gravité d''une crise d''asthme aiguë grave.', 7, 'qroc',
     'silence auscultatoire|difficulté à parler|impossibilité de parler|FR > 30/min|DEP < 50%|troubles de conscience|cyanose|bradycardie',
     'Signes de gravité : difficulté à parler, FR > 30/min, DEP < 50 %, silence auscultatoire, cyanose, troubles de conscience.'),
    (v_serie, 'Selon les critères de Light, comment qualifie-t-on un épanchement pleural riche en protéines ?', 8, 'qroc',
     'exsudat|un exsudat|exsudatif|épanchement exsudatif',
     'Un épanchement répondant à au moins un critère de Light est un exsudat.'),
    (v_serie, 'Quel geste permet d''analyser la nature d''un épanchement pleural ?', 9, 'qroc',
     'ponction pleurale|thoracocentèse|ponction pleurale (thoracocentèse)|ponction de la plèvre',
     'La ponction pleurale (thoracocentèse) permet l''analyse biochimique, cytologique et bactériologique du liquide.');
end $$;
