-- Amorçage de contenu — Parcours du Major (modèles à valider).
-- Parcours 1 : entièrement intégré (rappel + cas clinique + QROC corrigés + QCM).
-- Parcours 2 & 5 : rappel du coach mis en page (questions ajoutées ensuite).
-- Contenu repris fidèlement des « Coaching PAE » n°1, 2 et 5.

-- ── Parcours 1 ──────────────────────────────────────────────────────────────
update public.major_parcours set
  titre = 'Bien démarrer sa préparation',
  sous_titre = 'Méthode de travail & premier cas clinique',
  intro_html = $h$
<p>Bienvenue à tous pour cette préparation au concours du PAE ! Vous accèderez à <strong>deux coachings par semaine</strong>. Leur objectif principal : vous faire acquérir la bonne méthodologie pour travailler et pour bien rédiger vos réponses.</p>
<h3>Un objectif double</h3>
<p>Votre travail doit viser deux buts : d’abord <strong>apprendre des connaissances brutes</strong> (par ex. l’hémoglobine normale chez la femme est comprise entre 12 et 16 g/dL), mais aussi <strong>savoir utiliser ces connaissances</strong> comme autant de passerelles pour construire un chemin vers la bonne réponse. Mieux vaut un marteau dont on sait se servir qu’une masse qu’on ne peut pas soulever !</p>
<h3>Le volume et la qualité de travail</h3>
<p>Pour le PAE, comptez au minimum <strong>deux à trois heures par jour</strong> en semaine et deux après-midi le week-end. Veillez aussi à la qualité : travaillez dans de bonnes conditions, sans éléments perturbateurs, en évitant de finir trop tard. L’essentiel est de <strong>vous connaître</strong> : les « bonnes conditions » ne sont pas les mêmes pour tous (au calme, en musique, en bibliothèque…). Testez et gardez ce qui vous réussit.</p>
<p><em>NB :</em> les heures de transport ne valent pas une heure au calme — ne les comptez pas, mais mettez-les à profit pour vous remémorer la veille ou réviser vos cartes Anki.</p>
<h3>Les supports de cours</h3>
<p>Évitez de vous éparpiller entre trop de supports. Le plus complet reste <strong>les fiches fournies par l’équipe PAE Formation</strong>. Elles sont très complètes : inutile de tout retenir par cœur — connaissez d’abord <strong>les grands points</strong> de chaque fiche, ceux qui servent à répondre, puis passez aux entraînements.</p>
<h3>Des corrections « actives »</h3>
<p>Mettez à profit les entraînements : lisez les corrections avec soin, tenez un <strong>carnet d’erreurs</strong>, et retournez lire les paragraphes concernés du cours. Si un point n’est pas clair, ne procrastinez pas : relisez, posez des questions. Rien de plus rageant que de buter le jour J sur une question simple qu’on avait laissée de côté.</p>
<h3>Les cas cliniques</h3>
<p>Chaque coaching s’accompagne d’un petit cas clinique testant des notions que vous devez maîtriser, et de la correction du cas de la semaine précédente. Jouez le jeu « en situation », <strong>sans vos cours</strong> : écrivez vos réponses comme le jour de l’épreuve. Bon courage !</p>
$h$,
  vignette_html = $h$
<p>Vous recevez en consultation une patiente de <strong>85 ans</strong> que vous ne connaissez pas encore. Elle n’a pas de médecin traitant ; sa petite-fille, infirmière, « se charge de la surveillance de sa santé ». Elle vient car sa pharmacienne a mesuré sa pression artérielle après un malaise lors de son vaccin contre la grippe : <strong>88/56 mmHg</strong> au moment du malaise, puis <strong>145/93 mmHg</strong> 15 min après. La pharmacienne lui a conseillé de consulter pour « rechercher une pathologie artérielle ».</p>
<p>Antécédents : cholécystectomie il y a 20 ans, asthme, allergie au latex. Elle est G3P2, ne prend aucun traitement, pèse 57 kg pour 1 m 55. Après l’interrogatoire et un examen clinique attentif, votre appareil affiche : <strong>145/95 mmHg</strong>.</p>
$h$
where numero = 1;

-- Questions du parcours 1 (section « cas_clinique »).
delete from public.major_parcours_questions
where parcours_id = (select id from public.major_parcours where numero = 1);

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 0,
  $h$<p>Quelles sont les <strong>conditions recommandées</strong> pour la mesure tensionnelle en cabinet de médecine générale ?</p>$h$,
  '[]'::jsonb,
  $h$Repos ≥ 5 min, à distance (> 30 min) d’un effort ou du tabac ; 3 mesures espacées de 1–2 min, moyenne des 2 dernières ; appareil électronique validé, brassard adapté ; aux deux bras à la première consultation$h$,
  $h$<p>Le sujet doit être <strong>assis ou allongé au repos</strong> physique et psychique depuis au moins 5 min, à distance de plus de 30 min de tout effort physique et de tout tabagisme. On pratique <strong>3 mesures espacées de 1 à 2 min</strong> et on retient la <strong>moyenne des deux dernières</strong>. Utiliser de préférence un appareil électronique, avec un brassard adapté à la taille du bras. Lors de la première consultation, on mesure aux deux bras, puis on retient le bras le plus élevé.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 1,
  $h$<p>Que vous manque-t-il pour poser le diagnostic d’<strong>hypertension artérielle</strong> ? Comment obtenez-vous ces éléments manquants ?</p>$h$,
  '[]'::jsonb,
  $h$Confirmer la stabilité de l’HTA hors du cabinet (écarter l’effet blouse blanche) : MAPA ou automesure tensionnelle (règle des 3 jours)$h$,
  $h$<p>Il faut montrer la <strong>stabilité de l’HTA dans le temps</strong> et <strong>en dehors du contexte de soin</strong> (écarter l’HTA « blouse blanche ») : mesure ambulatoire de la pression artérielle (MAPA) ou automesure tensionnelle 3 jours de suite.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 2,
  $h$<p>Votre patiente présente-t-elle des <strong>facteurs de risque cardiovasculaires</strong> ?</p>$h$,
  '[]'::jsonb,
  $h$Essentiellement l’âge ; IMC normal (~24 kg/m²), pas de diabète, de dyslipidémie ni d’antécédents familiaux$h$,
  $h$<p>On ne retrouve guère que <strong>l’âge</strong>. Son IMC est à environ 24 kg/m² (normal). Pas de diabète, de dyslipidémie ni d’antécédents familiaux connus.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qcm', 3,
  $h$<p>À propos du <strong>bilan complémentaire</strong> pertinent dans ce cas, quelles sont les propositions exactes ?</p>$h$,
  $j$[
    {"lettre":"A","texte":"Test MMS","correct":true},
    {"lettre":"B","texte":"Exploration des anomalies lipidiques","correct":true},
    {"lettre":"C","texte":"Bilan d’hémostase","correct":false},
    {"lettre":"D","texte":"Créatininémie et fonction rénale","correct":true},
    {"lettre":"E","texte":"Ionogramme","correct":true},
    {"lettre":"F","texte":"Évaluation de la consommation d’alcool","correct":true}
  ]$j$::jsonb,
  null,
  $h$<p><strong>Réponse : ABDEF.</strong> Bilan devant une HTA : EAL, ionogramme, fonction rénale, glycémie à jeun, protéinurie, ECG de repos. On ajoute ici le <strong>test MMS</strong> (évaluation cognitive de cette patiente âgée, utile pour anticiper l’observance) et la recherche d’une <strong>intoxication alcoolique</strong> (cause d’HTA secondaire).</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 4,
  $h$<p>Quelle est la <strong>cible tensionnelle</strong> chez cette patiente ?</p>$h$,
  '[]'::jsonb,
  $h$PAS < 150 mmHg, sans hypotension orthostatique$h$,
  $h$<p>Patiente de plus de 80 ans ayant visiblement fait une <strong>hypotension orthostatique</strong> lors de son vaccin. L’objectif est une <strong>PAS &lt; 150 mmHg sans HTO</strong>.</p>$h$
from public.major_parcours where numero = 1;

insert into public.major_parcours_questions
  (parcours_id, section, format, ordre, enonce_html, items, reponse_attendue, explication_html)
select id, 'cas_clinique', 'qroc', 5,
  $h$<p>L’évaluation confirme à domicile des valeurs semblables à celles du cabinet. Quelles <strong>thérapeutiques</strong> mettez-vous en place ?</p>$h$,
  '[]'::jsonb,
  $h$La cible est déjà atteinte : règles hygiéno-diététiques seules (activité physique, sel < 6–8 g/j, arrêt alcool/tabac, fruits & légumes, limiter les graisses saturées)$h$,
  $h$<p>La patiente a déjà atteint sa cible : on propose <strong>seulement des règles hygiéno-diététiques</strong> — activité physique régulière, réduction du sel (max 6–8 g/j), pas d’alcool ni de tabac, fruits et légumes, limitation des graisses saturées.</p>$h$
from public.major_parcours where numero = 1;

-- ── Parcours 2 (rappel) ─────────────────────────────────────────────────────
update public.major_parcours set
  titre = 'Mémoriser efficacement ses cours',
  sous_titre = 'Techniques de mémorisation',
  intro_html = $h$
<p>Bonjour à tous, et bienvenue pour le coaching n°2 ! L’objectif ici : des astuces pour <strong>mieux retenir vos cours</strong>.</p>
<h3>Faire ressortir l’essentiel</h3>
<p>Les supports fournis sont complets et contiennent parfois du « hors programme ». Les cours « live » aident à distinguer l’important du détail. Adoptez un <strong>code couleur</strong> — par niveau d’importance (jaune : à connaître, vert : primordial, rouge : indispensable, risque de « PMZ ») ou par type d’information (signes cliniques, maladies, traitements…). L’essentiel est un apprentissage <strong>structuré</strong> : une « étagère » de connaissances, pas un « sac ».</p>
<h3>Reformuler pour ancrer</h3>
<p>Recopier un cours sous une autre forme force l’effort de mémoire. Faites un tableau de synthèse en fin de fiche : <em>Épidémiologie, Physiopathologie, Tableau clinique, Examens complémentaires, Complications, Traitement, Surveillance</em>. Attention : très chronophage si fait pour tous les cours — réservez-le aux sujets difficiles.</p>
<h3>Apprendre selon sa mémoire</h3>
<p>Mémoire visuelle : relire, s’appuyer sur les tableaux. Mémoire auditive : lire à voix haute, s’enregistrer et réécouter. Pour les listes, récitez-les toujours dans le même ordre, créez des <strong>moyens mnémotechniques</strong>, et retenez leur <strong>nombre d’éléments</strong> pour n’en oublier aucun.</p>
<h3>Réviser régulièrement</h3>
<p>Un cours s’oublie vite : revoyez-le après ~2 semaines, puis après 1 mois. Ma méthode en 3 lectures : (1) lecture tranquille pour comprendre le « pourquoi » ; (2) 3 jours après, retenir au fil de l’eau et restituer les grandes lignes ; (3) parfaire en insistant sur les points fragiles. Et bien sûr : s’entraîner avec les annales et les cas cliniques !</p>
$h$
where numero = 2;

-- ── Parcours 5 (rappel) ─────────────────────────────────────────────────────
update public.major_parcours set
  titre = 'Répondre aux questions à réponse courte',
  sous_titre = 'Méthodologie des QROC',
  intro_html = $h$
<p>Bonjour à tous ! J’espère que vos révisions avancent bien et que vous avez trouvé votre rythme. Après les QCM, voyons comment répondre aux <strong>questions à réponse courte (QROC)</strong>.</p>
<h3>Respecter le nombre de réponses demandé</h3>
<p>Quand un nombre limité de réponses est attendu (« Quelles sont les 2 hypothèses ? »), <strong>n’en donnez pas plus</strong> : vous risqueriez de perdre des points (parfois négatifs). Si vous en avez plusieurs en tête, choisissez les plus <strong>probables</strong> et/ou les plus <strong>graves</strong>. Les questions suivantes donnent parfois des indices.</p>
<h3>Justifier et structurer</h3>
<p>Pour les questions courtes (« Quel diagnostic ? »), <strong>justifiez</strong> succinctement sauf mention contraire — on ne reproche jamais une justification. Mettez en évidence l’<strong>élément central</strong> (le diagnostic), annoncé d’emblée : pas de suspens. Une pensée structurée met le correcteur dans de bonnes dispositions (beaucoup de grilles notent l’organisation de la réponse).</p>
<h3>Pour justifier un diagnostic</h3>
<ul>
<li>Terrain</li>
<li>Signes fonctionnels évocateurs</li>
<li>Examen clinique en faveur</li>
<li>Examens complémentaires disponibles en faveur du diagnostic</li>
</ul>
<p><em>Ex. pneumopathie du lobe inférieur droit :</em> patient de 65 ans tabagique ; toux et crachats ; fièvre et foyer de crépitants en base droite ; syndrome inflammatoire et foyer systématisé en LID.</p>
<h3>S’auto-évaluer honnêtement</h3>
<p>Entraînez-vous puis corrigez-vous « honnêtement » : ne comptez le point que si la réponse est <strong>parfaitement exacte</strong>. Restez bref (quelques lignes), présentez par tirets si un nombre défini est demandé, et soulignez les mots-clés pour la lisibilité. Bon courage, et travaillez le plus régulièrement possible !</p>
$h$
where numero = 5;
