-- =====================================================================
-- A APPLIQUER UNE FOIS dans Supabase : Dashboard > SQL Editor > coller > Run
-- Cree/complete les tables des 2 nouvelles fonctionnalites (permissions des
-- seances/supports + Parcours du Major, avec les 42 parcours). Sans risque a
-- relancer (if not exists / on conflict).
-- =====================================================================


-- ============================ 20260804180000_seances_permissions_individuelles.sql ============================
-- Permissions individuelles des sÃ©ances + permissions par support
-- ---------------------------------------------------------------------------
-- 1) Denylist par vidÃ©o (Â« sÃ©ance Â») : liste d'Ã©lÃ¨ves Ã  qui on RETIRE l'accÃ¨s,
--    mÃªme si leur formule/voie les rendrait Ã©ligibles. C'est une exclusion
--    nominative, cumulÃ©e par-dessus le ciblage voies/formules existant.
--
-- 2) Permissions PROPRES Ã  un support : jusqu'ici chaque support hÃ©ritait de
--    l'audience de sa vidÃ©o. On permet Ã  un support de porter ses PROPRES
--    voies + formules (Â« permissions diffÃ©rentes Â»). NULL = hÃ©rite de la vidÃ©o.

alter table public.videos
  add column if not exists denied_user_ids uuid[] not null default array[]::uuid[];

comment on column public.videos.denied_user_ids is
  'Ã‰lÃ¨ves explicitement privÃ©s d''accÃ¨s Ã  cette vidÃ©o/sÃ©ance (exclusion nominative), en plus du ciblage voies/formules.';

alter table public.video_supports
  add column if not exists voies text[],
  add column if not exists offers text[];

comment on column public.video_supports.voies is
  'Voies de concours propres au support. NULL = hÃ©rite de la vidÃ©o.';
comment on column public.video_supports.offers is
  'Formules propres au support. NULL = hÃ©rite de la vidÃ©o. Non NULL : prime sur l''audience de la vidÃ©o pour CE support.';

-- Un support ciblÃ© doit rester visible par au moins une voie et une formule ;
-- NULL reste autorisÃ© (= hÃ©ritage de la vidÃ©o).
alter table public.video_supports
  drop constraint if exists video_supports_voies_valides,
  add constraint video_supports_voies_valides check (
    voies is null
    or (voies <@ array['interne', 'externe'] and coalesce(array_length(voies, 1), 0) >= 1)
  );

alter table public.video_supports
  drop constraint if exists video_supports_offers_valides,
  add constraint video_supports_offers_valides check (
    offers is null
    or (offers <@ array['essentiel', 'intensif', 'approfondi'] and coalesce(array_length(offers, 1), 0) >= 1)
  );


-- ============================ 20260804190000_parcours_du_major.sql ============================
-- Parcours du Major â€” section pÃ©dagogique premium (Â« chemin de niveaux Â»).
-- ---------------------------------------------------------------------------
-- 42 parcours qui se suivent : il faut terminer le prÃ©cÃ©dent pour ouvrir le
-- suivant. Deux nouveaux s'ouvrent chaque lundi 10h (Europe/Paris) ; les deux
-- premiers sont ouverts dÃ¨s maintenant. Chaque parcours = un rappel mÃ©thodo
-- (Â« Bonjourâ€¦ Â»), un cas clinique (QROC en auto-Ã©valuation) et des QCM
-- auto-corrigÃ©s. Note /10 : < 6 Â« Ã  retravailler Â», 6â€“8 Â« en bonne voie Â»,
-- > 8 Â« maÃ®trisÃ© Â».
--
-- L'onglet est rÃ©servÃ© aux admins pour l'instant (gating applicatif), mais la
-- RLS ci-dessous est dÃ©jÃ  prÃªte pour une ouverture aux Ã©lÃ¨ves : un Ã©lÃ¨ve ne lit
-- que les parcours dÃ©jÃ  ouverts (available_at <= now()).

-- 1) Le parcours (le Â« niveau Â»).
create table if not exists public.major_parcours (
  id uuid primary key default gen_random_uuid(),
  numero integer not null unique,
  titre text not null,
  sous_titre text,
  -- Rappel mÃ©thodo mis en page (HTML riche, images en data-URI possibles).
  intro_html text not null default '',
  -- Contexte du cas clinique (vignette), affichÃ© avant ses QROC.
  vignette_html text,
  -- Ouverture programmÃ©e. Modifiable par l'admin.
  available_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists major_parcours_numero_idx on public.major_parcours (numero);

-- 2) Les questions d'un parcours (QCM auto-corrigÃ©s + QROC auto-Ã©valuÃ©s).
create table if not exists public.major_parcours_questions (
  id uuid primary key default gen_random_uuid(),
  parcours_id uuid not null references public.major_parcours(id) on delete cascade,
  -- Regroupement d'affichage : 'qcm' (sÃ©rie de QCM) ou 'cas_clinique' (QROC).
  section text not null default 'qcm' check (section in ('qcm', 'cas_clinique')),
  format text not null check (format in ('qcm', 'qroc')),
  ordre integer not null default 0,
  enonce_html text not null default '',
  -- QCM : [{ "lettre": "A", "texte": "...", "correct": true }]. Vide pour QROC.
  items jsonb not null default '[]'::jsonb,
  -- QROC : rÃ©ponse attendue / correction type (auto-Ã©valuation par l'Ã©lÃ¨ve).
  reponse_attendue text,
  explication_html text,
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists major_parcours_questions_parcours_idx
  on public.major_parcours_questions (parcours_id, section, ordre);

-- 3) ComplÃ©tion d'un parcours par un Ã©lÃ¨ve (note /10 + bande).
create table if not exists public.major_parcours_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parcours_id uuid not null references public.major_parcours(id) on delete cascade,
  score numeric(4, 2) not null default 0,
  band text not null default 'a_retravailler'
    check (band in ('a_retravailler', 'en_bonne_voie', 'maitrise')),
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  unique (user_id, parcours_id)
);

create index if not exists major_parcours_completions_user_idx
  on public.major_parcours_completions (user_id);

-- Touch updated_at Ã  chaque modification du parcours.
drop trigger if exists major_parcours_touch on public.major_parcours;
create trigger major_parcours_touch
  before update on public.major_parcours
  for each row execute function public.touch_updated_at();

-- â”€â”€ RLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
alter table public.major_parcours enable row level security;
alter table public.major_parcours_questions enable row level security;
alter table public.major_parcours_completions enable row level security;

-- Catalogue : le staff voit tout ; un Ã©lÃ¨ve ne voit que les parcours ouverts.
drop policy if exists major_parcours_read on public.major_parcours;
create policy major_parcours_read on public.major_parcours
  for select to authenticated
  using (
    public.current_role() in ('admin', 'professor')
    or (active and available_at <= now())
  );

drop policy if exists major_parcours_admin on public.major_parcours;
create policy major_parcours_admin on public.major_parcours
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Questions : lisibles si le parcours parent l'est (staff, ou ouvert).
drop policy if exists major_parcours_questions_read on public.major_parcours_questions;
create policy major_parcours_questions_read on public.major_parcours_questions
  for select to authenticated
  using (exists (
    select 1 from public.major_parcours p
    where p.id = major_parcours_questions.parcours_id
      and (public.current_role() in ('admin', 'professor') or (p.active and p.available_at <= now()))
  ));

drop policy if exists major_parcours_questions_admin on public.major_parcours_questions;
create policy major_parcours_questions_admin on public.major_parcours_questions
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ComplÃ©tions : chaque Ã©lÃ¨ve gÃ¨re les siennes ; le staff les lit toutes.
drop policy if exists major_parcours_completions_own on public.major_parcours_completions;
create policy major_parcours_completions_own on public.major_parcours_completions
  for all to authenticated
  using (user_id = auth.uid() or public.current_role() in ('admin', 'professor'))
  with check (user_id = auth.uid());

-- â”€â”€ AmorÃ§age des 42 parcours â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Ouverture : la paire p = ceil(numero/2). Paire 1 (parcours 1 & 2) ouverte
-- maintenant ; paire pâ‰¥2 le lundi 2026-08-11 10h (Europe/Paris) + (p-2) semaines.
-- Le titre est un libellÃ© provisoire, remplacÃ© Ã  l'intÃ©gration du contenu.
insert into public.major_parcours (numero, titre, available_at)
select
  n,
  'Parcours nÂ°' || n,
  case
    when ((n + 1) / 2) = 1 then timestamp '2026-08-04 00:00:00' at time zone 'Europe/Paris'
    else (timestamp '2026-08-11 10:00:00' + (((n + 1) / 2) - 2) * interval '7 days') at time zone 'Europe/Paris'
  end
from generate_series(1, 42) as n
on conflict (numero) do nothing;

comment on table public.major_parcours is
  'Parcours du Major : niveaux sÃ©quentiels (2 ouverts chaque lundi 10h). Onglet rÃ©servÃ© aux admins pour l''instant.';


-- ============================ 20260804190500_parcours_du_major_seed.sql ============================
-- AmorÃ§age de contenu â€” Parcours du Major (modÃ¨les Ã  valider).
-- Parcours 1 : entiÃ¨rement intÃ©grÃ© (rappel + cas clinique + QROC corrigÃ©s + QCM).
-- Parcours 2 & 5 : rappel du coach mis en page (questions ajoutÃ©es ensuite).
-- Contenu repris fidÃ¨lement des Â« Coaching PAE Â» nÂ°1, 2 et 5.

-- â”€â”€ Parcours 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
update public.major_parcours set
  titre = 'Bien dÃ©marrer sa prÃ©paration',
  sous_titre = 'MÃ©thode de travail & premier cas clinique',
  intro_html = $h$
<p>Bienvenue Ã  tous pour cette prÃ©paration au concours du PAE ! Vous accÃ¨derez Ã  <strong>deux coachings par semaine</strong>. Leur objectif principal : vous faire acquÃ©rir la bonne mÃ©thodologie pour travailler et pour bien rÃ©diger vos rÃ©ponses.</p>
<h3>Un objectif double</h3>
<p>Votre travail doit viser deux buts : dâ€™abord <strong>apprendre des connaissances brutes</strong> (par ex. lâ€™hÃ©moglobine normale chez la femme est comprise entre 12 et 16 g/dL), mais aussi <strong>savoir utiliser ces connaissances</strong> comme autant de passerelles pour construire un chemin vers la bonne rÃ©ponse. Mieux vaut un marteau dont on sait se servir quâ€™une masse quâ€™on ne peut pas soulever !</p>
<h3>Le volume et la qualitÃ© de travail</h3>
<p>Pour le PAE, comptez au minimum <strong>deux Ã  trois heures par jour</strong> en semaine et deux aprÃ¨s-midi le week-end. Veillez aussi Ã  la qualitÃ© : travaillez dans de bonnes conditions, sans Ã©lÃ©ments perturbateurs, en Ã©vitant de finir trop tard. Lâ€™essentiel est de <strong>vous connaÃ®tre</strong> : les Â« bonnes conditions Â» ne sont pas les mÃªmes pour tous (au calme, en musique, en bibliothÃ¨queâ€¦). Testez et gardez ce qui vous rÃ©ussit.</p>
<p><em>NB :</em> les heures de transport ne valent pas une heure au calme â€” ne les comptez pas, mais mettez-les Ã  profit pour vous remÃ©morer la veille ou rÃ©viser vos cartes Anki.</p>
<h3>Les supports de cours</h3>
<p>Ã‰vitez de vous Ã©parpiller entre trop de supports. Le plus complet reste <strong>les fiches fournies par lâ€™Ã©quipe PAE Formation</strong>. Elles sont trÃ¨s complÃ¨tes : inutile de tout retenir par cÅ“ur â€” connaissez dâ€™abord <strong>les grands points</strong> de chaque fiche, ceux qui servent Ã  rÃ©pondre, puis passez aux entraÃ®nements.</p>
<h3>Des corrections Â« actives Â»</h3>
<p>Mettez Ã  profit les entraÃ®nements : lisez les corrections avec soin, tenez un <strong>carnet dâ€™erreurs</strong>, et retournez lire les paragraphes concernÃ©s du cours. Si un point nâ€™est pas clair, ne procrastinez pas : relisez, posez des questions. Rien de plus rageant que de buter le jour J sur une question simple quâ€™on avait laissÃ©e de cÃ´tÃ©.</p>
<h3>Les cas cliniques</h3>
<p>Chaque coaching sâ€™accompagne dâ€™un petit cas clinique testant des notions que vous devez maÃ®triser, et de la correction du cas de la semaine prÃ©cÃ©dente. Jouez le jeu Â« en situation Â», <strong>sans vos cours</strong> : Ã©crivez vos rÃ©ponses comme le jour de lâ€™Ã©preuve. Bon courage !</p>
$h$,
  vignette_html = $h$
<p>Vous recevez en consultation une patiente de <strong>85 ans</strong> que vous ne connaissez pas encore. Elle nâ€™a pas de mÃ©decin traitant ; sa petite-fille, infirmiÃ¨re, Â« se charge de la surveillance de sa santÃ© Â». Elle vient car sa pharmacienne a mesurÃ© sa pression artÃ©rielle aprÃ¨s un malaise lors de son vaccin contre la grippe : <strong>88/56 mmHg</strong> au moment du malaise, puis <strong>145/93 mmHg</strong> 15 min aprÃ¨s. La pharmacienne lui a conseillÃ© de consulter pour Â« rechercher une pathologie artÃ©rielle Â».</p>
<p>AntÃ©cÃ©dents : cholÃ©cystectomie il y a 20 ans, asthme, allergie au latex. Elle est G3P2, ne prend aucun traitement, pÃ¨se 57 kg pour 1 m 55. AprÃ¨s lâ€™interrogatoire et un examen clinique attentif, votre appareil affiche : <strong>145/95 mmHg</strong>.</p>
$h$
where numero = 1;

-- Questions du parcours 1 (section Â« cas_clinique Â»).
delete from public.major_parcours_questions
where parcours_id = (select id from public.major_parcours where numero = 1);

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 0,
  $h$<p>Quelles sont les <strong>conditions recommandÃ©es</strong> pour la mesure tensionnelle en cabinet de mÃ©decine gÃ©nÃ©rale ?</p>$h$,
  '[]'::jsonb,
  $h$Repos â‰¥ 5 min, Ã  distance (> 30 min) dâ€™un effort ou du tabac ; 3 mesures espacÃ©es de 1â€“2 min, moyenne des 2 derniÃ¨res ; appareil Ã©lectronique validÃ©, brassard adaptÃ© ; aux deux bras Ã  la premiÃ¨re consultation$h$,
  $h$<p>Le sujet doit Ãªtre <strong>assis ou allongÃ© au repos</strong> physique et psychique depuis au moins 5 min, Ã  distance de plus de 30 min de tout effort physique et de tout tabagisme. On pratique <strong>3 mesures espacÃ©es de 1 Ã  2 min</strong> et on retient la <strong>moyenne des deux derniÃ¨res</strong>. Utiliser de prÃ©fÃ©rence un appareil Ã©lectronique, avec un brassard adaptÃ© Ã  la taille du bras. Lors de la premiÃ¨re consultation, on mesure aux deux bras, puis on retient le bras le plus Ã©levÃ©.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 1,
  $h$<p>Que vous manque-t-il pour poser le diagnostic dâ€™<strong>hypertension artÃ©rielle</strong> ? Comment obtenez-vous ces Ã©lÃ©ments manquants ?</p>$h$,
  '[]'::jsonb,
  $h$Confirmer la stabilitÃ© de lâ€™HTA hors du cabinet (Ã©carter lâ€™effet blouse blanche) : MAPA ou automesure tensionnelle (rÃ¨gle des 3 jours)$h$,
  $h$<p>Il faut montrer la <strong>stabilitÃ© de lâ€™HTA dans le temps</strong> et <strong>en dehors du contexte de soin</strong> (Ã©carter lâ€™HTA Â« blouse blanche Â») : mesure ambulatoire de la pression artÃ©rielle (MAPA) ou automesure tensionnelle 3 jours de suite.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 2,
  $h$<p>Votre patiente prÃ©sente-t-elle des <strong>facteurs de risque cardiovasculaires</strong> ?</p>$h$,
  '[]'::jsonb,
  $h$Essentiellement lâ€™Ã¢ge ; IMC normal (~24 kg/mÂ²), pas de diabÃ¨te, de dyslipidÃ©mie ni dâ€™antÃ©cÃ©dents familiaux$h$,
  $h$<p>On ne retrouve guÃ¨re que <strong>lâ€™Ã¢ge</strong>. Son IMC est Ã  environ 24 kg/mÂ² (normal). Pas de diabÃ¨te, de dyslipidÃ©mie ni dâ€™antÃ©cÃ©dents familiaux connus.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qcm', 3,
  $h$<p>Ã€ propos du <strong>bilan complÃ©mentaire</strong> pertinent dans ce cas, quelles sont les propositions exactes ?</p>$h$,
  $j$[
    {"lettre":"A","texte":"Test MMS","correct":true},
    {"lettre":"B","texte":"Exploration des anomalies lipidiques","correct":true},
    {"lettre":"C","texte":"Bilan dâ€™hÃ©mostase","correct":false},
    {"lettre":"D","texte":"CrÃ©atininÃ©mie et fonction rÃ©nale","correct":true},
    {"lettre":"E","texte":"Ionogramme","correct":true},
    {"lettre":"F","texte":"Ã‰valuation de la consommation dâ€™alcool","correct":true}
  ]$j$::jsonb,
  null,
  $h$<p><strong>RÃ©ponse : ABDEF.</strong> Bilan devant une HTA : EAL, ionogramme, fonction rÃ©nale, glycÃ©mie Ã  jeun, protÃ©inurie, ECG de repos. On ajoute ici le <strong>test MMS</strong> (Ã©valuation cognitive de cette patiente Ã¢gÃ©e, utile pour anticiper lâ€™observance) et la recherche dâ€™une <strong>intoxication alcoolique</strong> (cause dâ€™HTA secondaire).</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 4,
  $h$<p>Quelle est la <strong>cible tensionnelle</strong> chez cette patiente ?</p>$h$,
  '[]'::jsonb,
  $h$PAS < 150 mmHg, sans hypotension orthostatique$h$,
  $h$<p>Patiente de plus de 80 ans ayant visiblement fait une <strong>hypotension orthostatique</strong> lors de son vaccin. Lâ€™objectif est une <strong>PAS &lt; 150 mmHg sans HTO</strong>.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 5,
  $h$<p>Lâ€™Ã©valuation confirme Ã  domicile des valeurs semblables Ã  celles du cabinet. Quelles <strong>thÃ©rapeutiques</strong> mettez-vous en place ?</p>$h$,
  '[]'::jsonb,
  $h$La cible est dÃ©jÃ  atteinte : rÃ¨gles hygiÃ©no-diÃ©tÃ©tiques seules (activitÃ© physique, sel < 6â€“8 g/j, arrÃªt alcool/tabac, fruits & lÃ©gumes, limiter les graisses saturÃ©es)$h$,
  $h$<p>La patiente a dÃ©jÃ  atteint sa cible : on propose <strong>seulement des rÃ¨gles hygiÃ©no-diÃ©tÃ©tiques</strong> â€” activitÃ© physique rÃ©guliÃ¨re, rÃ©duction du sel (max 6â€“8 g/j), pas dâ€™alcool ni de tabac, fruits et lÃ©gumes, limitation des graisses saturÃ©es.</p>$h$
from public.major_parcours where numero = 1;

-- â”€â”€ Parcours 2 (rappel) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
update public.major_parcours set
  titre = 'MÃ©moriser efficacement ses cours',
  sous_titre = 'Techniques de mÃ©morisation',
  intro_html = $h$
<p>Bonjour Ã  tous, et bienvenue pour le coaching nÂ°2 ! Lâ€™objectif ici : des astuces pour <strong>mieux retenir vos cours</strong>.</p>
<h3>Faire ressortir lâ€™essentiel</h3>
<p>Les supports fournis sont complets et contiennent parfois du Â« hors programme Â». Les cours Â« live Â» aident Ã  distinguer lâ€™important du dÃ©tail. Adoptez un <strong>code couleur</strong> â€” par niveau dâ€™importance (jaune : Ã  connaÃ®tre, vert : primordial, rouge : indispensable, risque de Â« PMZ Â») ou par type dâ€™information (signes cliniques, maladies, traitementsâ€¦). Lâ€™essentiel est un apprentissage <strong>structurÃ©</strong> : une Â« Ã©tagÃ¨re Â» de connaissances, pas un Â« sac Â».</p>
<h3>Reformuler pour ancrer</h3>
<p>Recopier un cours sous une autre forme force lâ€™effort de mÃ©moire. Faites un tableau de synthÃ¨se en fin de fiche : <em>Ã‰pidÃ©miologie, Physiopathologie, Tableau clinique, Examens complÃ©mentaires, Complications, Traitement, Surveillance</em>. Attention : trÃ¨s chronophage si fait pour tous les cours â€” rÃ©servez-le aux sujets difficiles.</p>
<h3>Apprendre selon sa mÃ©moire</h3>
<p>MÃ©moire visuelle : relire, sâ€™appuyer sur les tableaux. MÃ©moire auditive : lire Ã  voix haute, sâ€™enregistrer et rÃ©Ã©couter. Pour les listes, rÃ©citez-les toujours dans le mÃªme ordre, crÃ©ez des <strong>moyens mnÃ©motechniques</strong>, et retenez leur <strong>nombre dâ€™Ã©lÃ©ments</strong> pour nâ€™en oublier aucun.</p>
<h3>RÃ©viser rÃ©guliÃ¨rement</h3>
<p>Un cours sâ€™oublie vite : revoyez-le aprÃ¨s ~2 semaines, puis aprÃ¨s 1 mois. Ma mÃ©thode en 3 lectures : (1) lecture tranquille pour comprendre le Â« pourquoi Â» ; (2) 3 jours aprÃ¨s, retenir au fil de lâ€™eau et restituer les grandes lignes ; (3) parfaire en insistant sur les points fragiles. Et bien sÃ»r : sâ€™entraÃ®ner avec les annales et les cas cliniques !</p>
$h$
where numero = 2;

-- â”€â”€ Parcours 5 (rappel) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
update public.major_parcours set
  titre = 'RÃ©pondre aux questions Ã  rÃ©ponse courte',
  sous_titre = 'MÃ©thodologie des QROC',
  intro_html = $h$
<p>Bonjour Ã  tous ! Jâ€™espÃ¨re que vos rÃ©visions avancent bien et que vous avez trouvÃ© votre rythme. AprÃ¨s les QCM, voyons comment rÃ©pondre aux <strong>questions Ã  rÃ©ponse courte (QROC)</strong>.</p>
<h3>Respecter le nombre de rÃ©ponses demandÃ©</h3>
<p>Quand un nombre limitÃ© de rÃ©ponses est attendu (Â« Quelles sont les 2 hypothÃ¨ses ? Â»), <strong>nâ€™en donnez pas plus</strong> : vous risqueriez de perdre des points (parfois nÃ©gatifs). Si vous en avez plusieurs en tÃªte, choisissez les plus <strong>probables</strong> et/ou les plus <strong>graves</strong>. Les questions suivantes donnent parfois des indices.</p>
<h3>Justifier et structurer</h3>
<p>Pour les questions courtes (Â« Quel diagnostic ? Â»), <strong>justifiez</strong> succinctement sauf mention contraire â€” on ne reproche jamais une justification. Mettez en Ã©vidence lâ€™<strong>Ã©lÃ©ment central</strong> (le diagnostic), annoncÃ© dâ€™emblÃ©e : pas de suspens. Une pensÃ©e structurÃ©e met le correcteur dans de bonnes dispositions (beaucoup de grilles notent lâ€™organisation de la rÃ©ponse).</p>
<h3>Pour justifier un diagnostic</h3>
<ul>
<li>Terrain</li>
<li>Signes fonctionnels Ã©vocateurs</li>
<li>Examen clinique en faveur</li>
<li>Examens complÃ©mentaires disponibles en faveur du diagnostic</li>
</ul>
<p><em>Ex. pneumopathie du lobe infÃ©rieur droit :</em> patient de 65 ans tabagique ; toux et crachats ; fiÃ¨vre et foyer de crÃ©pitants en base droite ; syndrome inflammatoire et foyer systÃ©matisÃ© en LID.</p>
<h3>Sâ€™auto-Ã©valuer honnÃªtement</h3>
<p>EntraÃ®nez-vous puis corrigez-vous Â« honnÃªtement Â» : ne comptez le point que si la rÃ©ponse est <strong>parfaitement exacte</strong>. Restez bref (quelques lignes), prÃ©sentez par tirets si un nombre dÃ©fini est demandÃ©, et soulignez les mots-clÃ©s pour la lisibilitÃ©. Bon courage, et travaillez le plus rÃ©guliÃ¨rement possible !</p>
$h$
where numero = 5;

