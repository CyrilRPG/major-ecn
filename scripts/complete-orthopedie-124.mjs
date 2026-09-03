import { writeFileSync } from 'node:fs'; import { join, resolve } from 'node:path';
const chapterDir=resolve(process.argv[2]||'../.corpus-orthopedie/traitement-orthopedique-des-scolioses-idiopathiques'); const out=resolve(process.argv[3]||join(chapterDir,'delivery','quality-v1'));
const lines=`But du traitement orthopédique|Réduire les courbures et maintenir la correction pendant la croissance.|11
Quand le corset est-il inutile ?|Après achèvement de la croissance rachidienne.|11
Quel potentiel augmente l’intérêt du traitement ?|Un potentiel de croissance résiduel important.|11
Quel risque cherche à éviter le traitement ?|L’aggravation vers une déformation pouvant conduire à une arthrodèse.|99
Deux forces correctrices classiques ?|Traction longitudinale et pression transversale.|17
Entre quelles régions s’exerce la traction ?|Entre la tête et le bassin.|18
De quoi dépend l’efficacité de la traction ?|De la flèche et de l’angulation de la courbure.|18
Effet sagittal négatif de la traction prolongée ?|Hypocyphose ou lordose thoracique.|23
Où s’applique la pression transversale ?|À l’apex de la déformation.|24
Pour quelles angulations la pression transversale est-elle mieux adaptée ?|Les angulations modérées.|24
Rôle des chambres d’expansion ?|Permettre l’autocorrection active du tronc.|25
Que complète le travail actif dans le corset ?|La kinésithérapie.|33
Quel objectif a l’hypercorrection ?|Compenser le temps de port réduit par une correction majorée.|35
Pour quelle courbure réserver l’hypercorrection nocturne ?|Une courbure unique relativement souple.|35
Quels mouvements associe le plâtre EDF ?|Élongation, dérotation et flexion latérale.|48
Entre quels appuis s’exerce l’élongation du plâtre EDF ?|Sangles pelviennes et fronde occipitomentonnière.|48
Comment doit rester l’élongation EDF ?|Modérée.|48
Que doivent préserver les découpes du plâtre ?|Expansion thoracique et liberté des membres.|52
Indication du plâtre de Stagnara-Donaldson-Engh ?|Scoliose importante et raide.|53
Principe du plâtre de Stagnara-Donaldson-Engh ?|Élongation graduelle entre deux pièces plâtrées.|53
Quel apport remplace le moulage négatif ?|La capture tridimensionnelle informatique du tronc.|56
Que permet le modèle numérique du tronc ?|Rectifications et fabrication individualisée de l’orthèse.|56
Type d’action du corset garchois ?|Détraction passive ou rappel à sangle.|60
Chez qui le corset garchois est-il utile ?|Petit enfant et certaines scolioses infantiles.|60
Courbures particulièrement accessibles au garchois ?|Cervicothoraciques et thoraciques hautes.|69
Rôle du corset passif plein temps ?|Maintenir une correction obtenue dans le corset.|69
Principe du Charleston ?|Hypercorrection nocturne en inflexion latérale.|81
Indications topographiques du Charleston ?|Courbures uniques lombaires, thoracolombaires ou thoraciques.|81
Comment améliorer la tolérance initiale du Charleston ?|Mise en place et serrage progressifs sur plusieurs nuits.|83
Principe du corset de Caen ?|Appuis électifs et inflexion latérale.|84
Quelle forme peut relever du corset de Caen ?|Double courbure thoracique et lombaire.|84
Quand arrêter un traitement nocturne de Caen ?|Si une des courbures se dégrade.|87
But recherché par les corsets souples ?|Améliorer confort et observance.|88
Limite des corsets souples ?|Efficacité évolutive non démontrée.|88
Variables du choix de corset ?|Âge, topographie, angulation, réductibilité, expérience et compétence technique.|90
Que faut-il éviter chez très jeune enfant ?|Une contrainte excessive de la cage thoracique.|91
Corsets recommandés chez très jeune enfant ?|Garchois ou Milwaukee.|91
Limite des corsets courts ?|Ils sont peu efficaces sur les courbures thoraciques hautes.|92
Où les corsets courts sont-ils correcteurs ?|Courbures thoracolombaires ou lombaires.|92
Option pour courbures thoraciques moyennes ou doubles ?|Milwaukee puis corset passif selon l’adolescence.|93
De quoi dépend plein temps versus nocturne ?|Du double risque évolutif et de la vitesse d’aggravation.|95
Quelle évolution justifie un traitement intensif ?|Aggravation rapide en période prépubertaire.|95
Préparation d’une déformation sévère et raide chez petit enfant ?|Un ou plusieurs plâtres correcteurs.|96
Quel paramètre suit l’histoire naturelle ?|L’angle de Cobb.|105
Quand débute la phase d’aggravation abrupte ?|Aux premiers signes pubertaires, au point P.|108
Pourquoi ne pas attendre deux radiographies après le point P ?|Le temps utile de traitement peut être perdu.|116
Quels éléments aident dès le premier examen ?|Les facteurs pronostiques d’évolutivité.|116
Évolution possible d’une scoliose du nourrisson ?|Résolution spontanée ou progression dramatique.|120
Conduite devant scoliose infantile résolutive ?|Pas de traitement orthopédique.|124
Conduite devant scoliose infantile évolutive prouvée ?|Traitement immédiat.|124
Risque des juvéniles précoces non traitées ?|Évolution vers angulation majeure et arthrodèse.|126
Quel groupe a fait discuter l’efficacité du corset ?|Juvéniles tardives et scolioses de l’adolescent.|130
Topographies qui répondent le mieux ?|Lombaires et thoracolombaires.|136
Facteur angulaire de bon pronostic ?|Faible angulation au début du corset.|137
Facteur de qualité sous corset ?|Une correction angulaire importante.|144
Profil défavorable au corset ?|Profil sagittal plat avec tronc projeté en avant.|145
Facteur comportemental de réussite ?|La compliance.|146
Comment soutenir la compliance ?|Construire une relation de confiance avec enfant et famille.|146
Effet d’un appareil plein temps sur ventilation ?|Restriction ventilatoire possible.|150
Effet musculaire de l’immobilisation ?|Atrophie musculaire possible.|150
But de la kinésithérapie ?|Autocorrection, assouplissement et limitation des effets d’immobilisation.|150
Sport asymétrique contre-indiqué ?|Non, aucun sport ne l’est véritablement dans le corpus.|151
Quand revoir un corset orthopédique après livraison ?|Un mois après livraison.|152
Quel examen au premier contrôle du corset ?|Radiographie avec corset.|152
But de l’information familiale ?|Prévenir problèmes cutanés et digestifs et soutenir l’observance.|151
Devenir après arrêt du corset ?|Une perte angulaire initiale peut survenir.|154
But initial des plâtres en infantile bénigne progressive ?|Détorsion quasi complète et symétrisation thoracique.|158
Après plâtres correcteurs infantile bénigne ?|Relais par corset orthopédique.|158
Risque thoracique à éviter dans infantile maligne ?|Comprimer une cage thoracique très malléable.|161
Mécanisme privilégié des plâtres en infantile maligne ?|Détraction plutôt que dérotation.|161
Pourquoi kinésithérapie respiratoire en infantile maligne ?|Soutenir le développement pulmonaire freiné par la déformation.|162
Plâtre initial dans juvénile précoce ?|Plâtre de frein, éventuellement répété.|164
Durée du corset dans juvénile précoce ?|Jusqu’à la fin de croissance.|164
Stratégie fréquente dans juvénile tardive/adolescent ?|Corset mis en place d’emblée.|166
Quand réserver le temps partiel ?|Aux situations à risque évolutif limité.|166
Pourquoi préserver le profil sagittal ?|Le traitement frontal peut induire hypocyphose ou lordose thoracique.|23
Pourquoi contrôler chaque secteur dans double courbure ?|Une correction peut favoriser l’aggravation de l’autre.|87
Quel acteur technique est indispensable au corset ?|L’orthoprothésiste compétent.|90
Quel contrôle quantifie l’efficacité d’un corset ?|La correction angulaire sur radiographie avec corset.|152
Pourquoi la tolérance ne suffit-elle pas ?|Un corset confortable peut être insuffisamment correcteur.|88
Quel objectif commun des plâtres et corsets ?|Gagner puis maintenir une correction compatible avec croissance.|11
Quel risque doit être discuté avant traitement nocturne ?|Une aggravation rapide ou un risque évolutif double élevé.|95
Quel signe impose une surveillance rapprochée des plâtres ?|La nécessité d’ajuster la correction par feutres.|152
Quel résultat évalue le suivi à distance ?|Maintien de l’angulation et équilibre du tronc.|154
Quel élément ne doit jamais être négligé ?|La qualité de port réel du corset.|146
Quel but cherche l’autocorrection hors corset ?|Faire participer activement l’enfant à son équilibre postural.|150
Quel impératif global guide la prescription ?|Adapter l’appareil à l’âge, la courbure et son risque évolutif.|90
Pourquoi une scoliose infantile progressive est-elle traitée tôt ?|Pour prévenir une déformation majeure pendant la croissance.|124
Quel rôle conserve le contrôle radiologique ?|Objectiver correction et évolution, pas seulement la tolérance.|152
Qu’évalue l’analyse sagittale ?|Le profil et le déséquilibre antérieur du tronc.|145
Quelle conséquence d’une mauvaise compliance ?|Un résultat orthopédique moins favorable.|146
Quelle stratégie après aggravation sous traitement nocturne ?|Réévaluer et intensifier ou modifier l’appareillage.|87
Quel compromis le traitement doit-il préserver ?|Correction, respiration, mobilité et qualité de vie.|150
Quand une chirurgie précoce est-elle évitée selon la conclusion ?|Chez le petit enfant, au profit d’un traitement orthopédique adapté.|168
Quel est le rôle du suivi multidisciplinaire ?|Adapter l’orthèse à la croissance et aux résultats de correction.|152
Pourquoi le corset doit-il être individualisé ?|La topographie et la réductibilité varient d’un patient à l’autre.|90
Quel patient nécessite prudence avec un corset court ?|Celui ayant une courbure thoracique haute.|92
Quel facteur fait préférer plâtre avant orthèse ?|Déformation sévère, raide et enfant jeune.|96
Quelle donnée clinique conditionne l’adhésion familiale ?|Une information claire sur objectifs et contraintes.|151
À quoi sert la maintenance long terme ?|Préserver le résultat au cours de la croissance et après l’arrêt.|154
Quel effet doit être recherché dans le corset ?|Une correction mesurable de la courbure sans déséquilibre délétère.|144`.split('\n').map(l=>{const [recto,verso,source]=l.split('|');return {recto,verso,source:[Number(source)]}});
if(lines.length<100||lines.length>200)throw new Error('cartes '+lines.length);
const q=(e,c,w,s)=>({enonce:e,items:[c,...w].map((enonce,i)=>({lettre:String.fromCharCode(65+i),enonce,is_correct:i===0,justification:i===0?`Conforme au bloc ${s} du corpus Orthopédie.`:'Cette proposition ne correspond pas au mécanisme ou à la conduite décrite.'})),correction_generale:`Réponse fondée sur le bloc ${s} du corpus Orthopédie.`});
const make=(i)=>{const f=lines[i];const stem=`Dans la décision d’appareillage de cette scoliose, ${f.recto.charAt(0).toLowerCase()}${f.recto.slice(1)}`;return q(stem,f.verso,[lines[(i+17)%100].verso,lines[(i+39)%100].verso,lines[(i+61)%100].verso,lines[(i+83)%100].verso],f.source[0])};
const qcm=Array.from({length:8},(_,i)=>({label:`QCM ${i+1} · Traitement orthopédique des scolioses idiopathiques`,vignette:'',questions:Array.from({length:5},(_,j)=>make(i*5+j))}));
const vignettes=[['Prescription initiale','<p><strong>Une fille de 11 ans</strong> est adressée pour une scoliose idiopathique évolutive en période prépubertaire. La courbure est mesurée, son profil sagittal analysé et la famille souhaite comprendre l’objectif du corset.</p><p>Un appareillage est prescrit avec kinésithérapie. <strong>Au suivi</strong>, le port réel, la tolérance, la radiographie sous corset et l’évolution de l’angle de Cobb sont réévalués.</p>'],['Traction et profil','<p><strong>Un garçon de 12 ans</strong> porte un appareil utilisant une traction longitudinale pour une scoliose en croissance. L’équipe explique la correction attendue et le risque sur les courbures sagittales.</p><p><strong>Au contrôle</strong>, l’alignement frontal, le profil, la respiration et la tolérance de l’appareil sont vérifiés avant tout réglage.</p>'],['Charleston','<p><strong>Une adolescente de 13 ans</strong> présente une courbure unique souple. Un corset de Charleston nocturne est envisagé après discussion de l’hypercorrection et de l’observance.</p><p><strong>Au suivi</strong>, la mise en place progressive, la correction radiologique et l’absence de déséquilibre induit sont contrôlées.</p>'],['Double courbure','<p><strong>Une fille de 12 ans</strong> a une double courbure thoracique et lombaire. L’équipe discute un corset à appuis électifs et surveille la correction de chaque secteur.</p><p><strong>Au contrôle</strong>, toute aggravation d’un secteur conduit à réévaluer la stratégie nocturne et l’intensité du traitement.</p>'],['Petit enfant','<p><strong>Un garçon de 4 ans</strong> présente une scoliose infantile progressive. La cage thoracique est très malléable et la croissance restante importante.</p><p>Des plâtres correcteurs puis une orthèse sont organisés. <strong>Au suivi</strong>, la respiration, la correction, la tolérance cutanée et le développement global sont évalués.</p>'],['Risque pubertaire','<p><strong>Une adolescente de 10 ans</strong> arrive au début des signes pubertaires avec aggravation récente de son angle de Cobb. Le risque évolutif est discuté dès le premier examen.</p><p>Le traitement est intensifié. <strong>Au suivi</strong>, l’angle, le profil, la compliance et la nécessité d’ajuster l’appareillage sont contrôlés.</p>'],['Observance','<p><strong>Un adolescent de 14 ans</strong> porte un corset mais décrit une gêne et un port irrégulier. La radiographie sous corset ne montre qu’une correction limitée.</p><p>Une information reprise avec la famille et l’orthoprothésiste est organisée. <strong>Au contrôle</strong>, le port, les réglages et l’efficacité objective sont réévalués.</p>'],['Fin de croissance','<p><strong>Une jeune fille de 16 ans</strong> approche de la maturité osseuse après plusieurs années de corset. La décision concerne la diminution progressive du traitement et la surveillance à distance.</p><p><strong>Au suivi après l’arrêt</strong>, une éventuelle perte angulaire, l’équilibre du tronc et la qualité de vie sont documentés.</p>']];
const dp=vignettes.map(([label,vignette],i)=>({label:`DP ${i+1} · ${label}`,vignette:`${vignette}<p>Le patient ou la patiente est revu(e) avec sa famille à chaque étape du suivi.</p>`,questions:Array.from({length:7},(_,j)=>{const question=make(40+i*7+j);if(j)question.enonce=`Nouvel élément : ${question.enonce}`;return question})}));
const chapter={title:'Traitement orthopédique des scolioses idiopathiques',provenance:{extract:'extract.json',sourceOnly:true,sourceBlocks:[11,17,18,23,24,25,35,48,53,56,60,69,81,84,88,90,91,92,93,95,96,99,105,108,116,120,124,126,130,136,137,144,145,146,150,151,152,154,158,161,164,166,168],clinicalFraming:'Vignettes DP cliniques, toutes les assertions techniques limitées aux blocs du corpus.'},flashcards:lines,series:[...qcm,...dp]};writeFileSync(join(out,'chapter.json'),JSON.stringify(chapter,null,2));console.log(JSON.stringify({out,flashcards:lines.length,qcm:qcm.length,dp:dp.length}));
