// Règles de forme seulement : ne change ni proposition, ni bonne réponse,
// ni nombre, ni recommandation médicale. Les cas non couverts restent à relire.
export const textOnly=s=>(s||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
export function dedupePrefix(s){
 let result=s;
 for(let n=0;n<8;n++){
  const m=result.match(/^(.{30,}?)\s*\1/i);if(!m)break;
  result=result.slice(m[1].length).trimStart();
 }
 return result?result[0].toLocaleUpperCase('fr-FR')+result.slice(1):result;
}
export function cleanStem(s){
 let out=s;for(let pass=0;pass<8;pass++){const next=cleanStemPass(out);if(next===out)break;out=next;}return out;
}
function cleanStemPass(s){
 if(!s)return s;
 let out=dedupePrefix(s);
 out=out.replace(/^,\s*/,'').replace(/,\s*,/g,',');
 out=out.replace(/^(?:Après le bilan initial|Lors de la planification opératoire|Pendant le contrôle peropératoire|Après le geste|Au suivi radioclinique|Au premier contrôle postopératoire), quelle décision est appropriée concernant (?=On |Le chirurgien)/i,'');
 const fragment=out.match(/^(?:Lors de la (?:planification opératoire|prise en charge orthopédique|préparation du geste)|Lors de l’interprétation du bilan|Au cours du suivi postopératoire), (?:quels éléments doivent être contrôlés face au problème (?:de |d[’'])|quelles données orientent la stratégie devant un problème (?:de |d[’'])|quels éléments permettent de caractériser un problème (?:de |d[’'])|quels choix permettent de répondre au problème (?:de |d[’'])|quelles options de prise en charge sont adaptées à un problème (?:de |d[’']))(.+)\?$/i);
 if(fragment){
  let part=fragment[1].trim().replace(/^dans la décision devant une tumeur bénigne, /i,'');
  if(!/(?:corpus|source|quel énoncé est correct)/i.test(part)){
   if(/^(?:à propos|(?:pour .+, )?(?:quel|comment|pourquoi|combien))/i.test(part))out=part+' ?';
   else if(/\b(?:est|sont|entraîne|impose|comporte|concernent|comprend|nécessite|entraîner|expose|vise|sert|sert principalement|participe|repose|correspond|menace|commencent|débute|utilisée|limite|comprennent|indiqué|impose|diminue|diminuer)\b/i.test(part))out='Complétez l’énoncé suivant : « '+part+'… »';
   else out='Concernant '+part+', quelles propositions sont exactes ?';
  }
 }
 out=out.replace(/(?:\s*:\s*|\.\s*)\?\s*$/,':');
 // Phrases de transition vides identifiées dans les scripts de normalisation.
 const timing='(?:Après l’évaluation initiale de ce patient|Après l’analyse clinique et radiographique|Lors de la préparation de la prise en charge|Pendant la décision opératoire|Après le bilan initial|Lors de la planification opératoire|Pendant le contrôle peropératoire|Au premier contrôle postopératoire|Au suivi radioclinique|À la fin du geste|Après le geste|Lors du suivi ultérieur)';
 out=out.replace(new RegExp('^(?:'+timing+', )+quelle décision est appropriée (?:concernant|pour) ','i'),'');
 out=out.replace(new RegExp('^('+timing+', )\\1','i'),'$1');
 const emptyTransition=new RegExp('^(?:'+timing+', )*(?:(?:le (?:bilan ou le suivi|contrôle ou le suivi|suivi)|l’évaluation clinique ou le suivi|la surveillance clinique ou le suivi) apporte (?:une information supplémentaire|un repère supplémentaire|une donnée clinique supplémentaire|un contrôle clinique et radiographique)|quelle décision est appropriée concernant le dossier opératoire et le suivi apportent une donnée complémentaire)\\.\\s*','i');
 out=out.replace(emptyTransition,'');
 out=out.replace(new RegExp('^(?:'+timing+', )*(?:(?:Dans )?ce dossier clinique|Clinique), au temps initial, quelle réponse permet d.orienter la prise en charge\\s*:\\s*','i'),'');
 const phase='(?:À l’évaluation initiale|Une fois le bilan disponible|Au moment de choisir la stratégie|Pendant l’intervention|Après le geste|Lors du premier contrôle|Au cours du suivi)';
 const factory=new RegExp('^'+phase+', (?:quelles informations sont nécessaires pour|quels critères conduisent à retenir|quels éléments doivent faire réévaluer|quelle décision est la plus adaptée pour|quels éléments doivent guider|quelle conduite pratique doit être privilégiée pour) ','i');
 let removedFactory=false;
 for(let n=0;n<8;n++){
  const next=out.replace(factory,'');if(next===out)break;
  // Une phase clinique unique et intelligible reste en place. On enlève le
  // gabarit seulement lorsqu'il enveloppe une autre phase ou une vraie question.
  if(!/^(?:à l’évaluation|une fois le bilan|au moment de choisir|pendant |après |lors |au (?:cours|suivi|premier)|à la fin|ce dossier|dans ce dossier|clinique,|quell?e?s?\b|comment\b|pourquoi\b|concernant\b)/i.test(next)
    && !/^(?:le |la |les |un |une |il |elle ).+\.\s*\S/i.test(next))break;
  removedFactory=true;out=next[0].toLocaleUpperCase('fr-FR')+next.slice(1);
 }
 out=out.replace(/^(?:Dans )?ce dossier clinique, au temps initial, quelle réponse permet d.orienter la prise en charge\s*:\s*/i,'');
 out=out.replace(/^(?:(?:Après le geste|Après le bilan initial|Lors de la planification opératoire|Pendant le contrôle peropératoire), )?le (?:bilan ou le suivi|suivi|bilan) apporte (?:une information|un repère) supplémentaire\.\s*/i,'');
 out=out.replace(/^(?:À la fin du geste|Lors du suivi ultérieur|Au suivi radioclinique|Après le geste|Après le bilan initial|Lors de la planification opératoire|Pendant le contrôle peropératoire), (?:au suivi radioclinique, )?le (?:contrôle ou le suivi|suivi|bilan ou le suivi) apporte (?:une information supplémentaire|un contrôle clinique et radiographique)\.\s*/i,'');
 out=out.replace(/^Quelle décision est appropriée concernant le dossier opératoire et le suivi apportent une donnée complémentaire\.\s*/i,'');
 out=out.replace(/,\s*\?\s*$/,' ?');
 out=out.replace(/\s+\?(?:\s*\?)+\s*$/,' ?');
 // Consigne de référence ajoutée à la fin d'une question autonome.
 out=out.replace(/,?\s+(?:selon la source|selon le document fourni|selon le cours|selon le texte|selon le corpus|d.après la source|d.après le document fourni)\s*\?/gi,' ?');
 out=out.replace(emptyTransition,'');
 out=out.replace(new RegExp('^(?:'+timing+', )*(?:(?:Dans )?ce dossier clinique|Clinique), au temps initial, quelle réponse permet d.orienter la prise en charge\\s*:\\s*','i'),'');
 if(out)out=out[0].toLocaleUpperCase('fr-FR')+out.slice(1);
 return out;
}

export function cleanQuestionReferences(s){
 if(!s)return s;
 return s
 .replace(/selon le cours d'évaluation des prothèses amovibles existantes/g,"dans le cadre de l'évaluation d'une prothèse amovible existante")
 .replace(/,?\s+selon (?:la fiche(?: de cours)?|le cours|la source)(?=[\s,.:?])/gi,'')
 .replace(/^Selon la fiche, /i,'')
 .replace(/(?:lesquels figurent dans la source|quelle\(s\) proposition\(s\) est\(sont\) citée\(s\) par la source|quelle\(s\) proposition\(s\) est\(sont\) mentionnée\(s\) dans la source|laquelle\/lesquelles est\(sont\) mentionnée\(s\) dans la source)/gi,'quelles propositions sont exactes')
 .replace(/est\(sont\) fondée\(s\) sur la source/gi,'est(sont) exacte(s)')
 .replace(/est conforme à la source/gi,'est adaptée')
 .replace(/est cohérente avec la source/gi,'est adaptée')
 .replace(/(?:évoquées|mentionné|décrite|décrites) dans la source/gi,'')
 .replace(/quelles options la source décrit-elle/gi,'quelles options sont possibles')
 .replace(/Quelles solutions propose la source pour/gi,'Quelles solutions permettent d’')
 .replace(/Quels éléments la source décrit-elle/gi,'Quels revêtements peuvent être utilisés')
 .replace(/,?\s+(?:dans le corpus|décrit par le corpus|discuté dans le texte)(?=\s*[,?.])/gi,'')
 .replace(/\s+\?/g,' ?').replace(/\s+\./g,'.');
}
export function stemDefects(s){
 const out=[];
 if(textOnly(s).length<8)out.push('consigne absente');
 if(/quels éléments doivent être retenus pour|quelle décision est appropriée (?:concernant|pour) (?:en |au |dans |le |la |les |on |une |un |l’|l'|vous )|Concernant (?:dans |au premier|après |lors |pendant |quelle)|quels choix permettent de répondre au problème|quelles options de prise en charge sont adaptées à un problème|dans la décision (?:thérapeutique analysée|clinique ou technique décrite) dans le chapitre|quelle attitude pédagogique|[Cc]oncernant faut-il/i.test(s))out.push('reformulation artificielle');
 if(/^,|,\s*,/.test(s))out.push('ponctuation de normalisation');
 if(/quelles données aident à raisonner devant|quelles précautions doivent guider|quels éléments doivent être contrôlés face au problème (?:de |d[’'])|quelles données orientent la stratégie devant un problème (?:de |d[’'])|quels éléments permettent de caractériser un problème (?:de |d[’'])|quelle décision est appropriée concernant On|^Avant de planifier .+, quelles propositions décrivent correctement/i.test(s))out.push('consigne de normalisation');
 if(/^(.{30,}?)\s*\1/i.test(s))out.push('introduction répétée');
 if(/�|Ã|mmctm|recap® aucun|\b(?:tuelle|riger)\s*\?/i.test(s))out.push('texte dégradé');
 if(/informations sont nécessaires pour|quels éléments doivent faire réévaluer|quelles mesures sont adaptées pour|le suivi apporte|le bilan ou le suivi apporte|quelle réponse permet d.orienter la prise en charge|lorsqu.un problème .+est identifié \?/i.test(s))out.push('gabarit emboîté');
 if(/,\s*\?\s*$|\?\s*\?\s*$/.test(s))out.push('consigne tronquée');
 return out;
}
const genericSource='(?:la source(?: fournie)?|le corpus(?: Orthopédie)?|le chapitre(?: source)?|le document(?: fourni)?|la fiche(?: de synthèse| de r[ée]f[ée]rence| source)?|le cours(?: fourni| source)?|l[’\x27]extrait)';
const neutral=new RegExp('^('+genericSource+') (?:précise|indique|rappelle|explique|souligne|mentionne|énonce|rapporte) (?:que |qu[’\x27])','i');
const phrase=new RegExp('^('+genericSource+') (?:décrit|cite|mentionne|rapporte|présente|retient|détaille) (?=(?:un |une |des |le |la |les |l[’\x27]))','i');
const tail=new RegExp('(?:,? (?:comme (?:le précise|le décrit|le rappelle) '+genericSource+'|selon '+genericSource+'|d[’\x27]après '+genericSource+'))(?=[.;:]|$)','gi');
const reportingSubject=new RegExp('^'+genericSource+' (?=(?:attribue|classe|définit|oppose|rattache|ajoute|range|préconise|recommande|propose|décrit|cite|liste|retient|rapporte|précise|indique|mentionne|explique|souligne|rappelle|énumère|distingue|insiste|précisé|precise)\\b)','i');
const fillers=[
 /^(?:Vrai|Faux)\s*[—–-]\s*(?:incompatible avec le )?bloc \d+ de l.extrait\.?$/i,
 /^(?:Non )?[Cc]onforme (?:au corpus|au chapitre|aux données du chapitre|aux principes du corpus|au bloc \d+ du corpus)(?: source| Orthopédie| du chapitre)?(?:\s*:\s*voir bloc \d+)?\.?$/i,
 /^(?:Affirmation|Formulation|Définition|Chiffre|Exemple|Recommandation|Mécanisme|Élément|Exigence|Rôle|Mission|Situation|Éléments de surveillance|Chiffre et date)(?: exacte?| explicite| littérale)?(?: (?:donné|décrit|cité|citée|cités|donnée|exacts?))? (?:de|par|dans) la source\.?$/i,
 /^(?:Précisé|Affirmé|Exigé|Cités|Explicitement cité) (?:par|dans) la source\.?$/i,
 /^La source (?:le précise|le souligne|l.indique(?: explicitement)?|l.affirme|le mentionne|le souligne en introduction)\.?$/i,
 /^C.est exact selon le chapitre\.?$/i,
 /^Correction fondée exclusivement sur (?:le corpus(?: Orthopédie)?|la fiche source(?: du cours)?)\.?$/i,
 /^Notion issue du bloc \d+ du corpus(?: Orthopédie)?\.?$/i,
 /^Conforme au bloc \d+(?: du corpus)?\.?$/i,
 /^(?:Vrai\s*:\s*)?cette donnée est explicitement rapportée dans le chapitre\.?$/i,
 /^Cette réponse est explicitement décrite dans le chapitre\.?$/i,
 /^La réponse correcte suit la stratégie décrite dans le corpus pour cette étape\.?$/i,
 /^Le corpus traite le rachis dans son ensemble\.?$/i,
 /^Réponse conforme aux principes arthroscopiques du chapitre\.?$/i,
 /^Cette conduite est conforme aux principes pédiatriques du chapitre\.?$/i,
 /^Élément conforme au corpus pour la situation étudiée\.?$/i,
 /^Cette réponse correspond aux données cliniques et techniques décrites dans le corpus\.?$/i,
 /^Cette proposition (?:reprend le fait demandé dans le chapitre source|est conforme aux données du chapitre|reprend la fiche source de ce cours)\.?$/i,
 /^Compatible avec les données du cas et les principes du corpus\.?$/i,
 /^(?:Vrai\s*:\s*)?La conduite découle des priorités cutanées, anatomiques et de suivi décrites dans le corpus\.?$/i,
 /^(?:Faux\s*:\s*)?La conduite découle des priorités cutanées, anatomiques et de suivi décrites dans le corpus\.?$/i,
 /^(?:Cette référ[ée]nce|C.est ce que|C.est|Ce sont|Il s.agit de|La fiche de synthèse) (?:est )?(?:explicitement )?(?:cité[es]*|précise le chapitre|écrit|le précise|l.affirme|le[s]? cite dans le spectre)(?: dans le chapitre)?\.?$/i,
 /^(?:Contexte évident|Effet|Objectif|Investigation|Loi|Article \d+|Profil|Condition|Indication|Association|Seuil d.exploration|Item de rang [AB]|Principe|Point clé|Exigence|Chiffre|Repère anatomique)(?: exact| explicite| précis)? (?:cité[es]*|donné[es]*|précisé[es]*|décrit[es]*|issu)(?: du tableau)? (?:par|dans|de) (?:la source|la fiche de synthèse|le corpus)\.?$/i,
 /^Conforme à la source\.?$/i,
 /^Cité par la source\.?$/i,
 /^La source (?:l.affirme|le précise) explicitement\.?$/i,
 /^La source cite ces appuis\.?$/i,
];
export function cleanExplanation(value,extraFillers=new Set()){
 if(!value)return value;
 const plain=textOnly(value);
 if(/^Correction fondée sur le corpus(?: Orthopédie| de traumatologie rachidienne)?\.$/.test(plain)||/^Cette question cible .+ ; la correction s’appuie exclusivement sur le corpus\.$/.test(plain))return null;
 if(/^Réponse fondée sur le corpus : /.test(value))return value.replace(/^Réponse fondée sur le corpus : /,'');
 if(extraFillers.has(plain)||fillers.some(r=>r.test(plain)))return null;
 // Une seule balise p englobante est conservée lors de la reformulation.
 const wrapped=value.match(/^(<p[^>]*>)([\s\S]*)(<\/p>)$/i);
 let body=wrapped?wrapped[2]:value;
 if(/<[^>]+>/.test(body))return value;
 const verdict=body.match(/^(Vrai|Faux)(?:\s*[:.]\s*)/i);
 const lead=verdict?verdict[0]:'';
 if(verdict)body=body.slice(lead.length);
 let changed=body
  .replace(new RegExp('^(?:Selon|D[’\x27]après) '+genericSource+',?\\s*','i'),'')
  .replace(neutral,'').replace(phrase,'').replace(tail,'')
  .replace(reportingSubject,'On ')
  .replace(/\bOn (?:précisé|precise) que /g,'On précise que ');
 if(changed===body)return value;
 changed=changed[0].toLocaleUpperCase('fr-FR')+changed.slice(1);
 changed=lead+changed;
 return wrapped?wrapped[1]+changed+wrapped[3]:changed;
}

// Passe complémentaire limitée aux attributions éditoriales génériques.
// Les citations d'organismes, les documents médicaux et les sources d'infection
// ne sont pas des attributions génériques et restent en place.
export function cleanAttribution(value){
 if(!value)return value;
 let out=value;
 const plain=textOnly(value);
 const source=new RegExp(genericSource,'i');
 if(!source.test(plain))return value;
 if(/^(?:La source|La fiche de synthèse) (?:le |la |les |l[’\x27])(?:précise|souligne|mentionne|énonce|indique|recommande)(?:\b|\s)/i.test(plain))return null;
 if(/^Formulation (?:exacte )?de la source\b/i.test(plain))return null;
 if(/^(?:La source|Le chapitre|Pour la description de l.AP, la source) renvoie/i.test(plain))return null;
 if(/^(?:Principe rappelé dans le cours|Le texte l.affirme d.emblée|C.est l.affirmation qui ouvre le chapitre|Vrai\. C.est le principe qui fonde tout le chapitre|Le chapitre illustre les principales séquences|Le chapitre traite de l.abord antérieur|Le chapitre traite aussi des MICI|Chiffre (?:donne|rapporté).+le (?:chapitre|corpus))/i.test(plain))return null;
 if(plain.length<150 && /^(?:Faux\s*:\s*)?.+ ne correspond pas à la conduite décrite dans le corpus\.$/i.test(plain))return null;
 if(plain.length<145 && /^(?:(?:C['’]est|Ce sont|Il s['’]agit de) )?(?:une? |la |le |les |l['’])?(?:\w+(?:ième|ième|ier|ière) )?(?:Point|Chiffre|Seuil|Valeur|Sources?|Alternative|Examen|Formule|Intérêt|Principe|Contexte|Critère|Distinction|Évolution|Exemple|Diplôme|Obligation|Élément|Ordre|Article|Référence|Durée|Piège|Affirmation|Localisation|Schéma|Signe|Trouble|Définition|Issue|Rôle|Défi|Public|Aspect|Facteur|Situation|Observation|Complication|Préférence|Particularité|Description|Donnée|Avantage|Mécanisme|Indication|Règle|Objectif|Condition|Contre-indication|Capacité|Effet|Mesure|Délai|Déterminant|Repère|Technique|Étape|Séquence|Recommandation|Précepte|Profil|Deux |Première |Deuxième |Troisième |Quatrième |Dernière |Premier |Deuxième |Troisième |Quatrième |Dernier )/i.test(plain)
    && !/[;:]/.test(plain) && !/\b(?:est|sont|doit|doivent|permet|entraîne|entra[iî]nent|favorise|réduit|augmente|impose)\b/i.test(plain.replace(/^(C.est|Ce sont|Il s.agit de) /i,''))
    && /(?:cit[ée]e?s?|décrit[es]*|donné[es]*|précisé[es]*|mentionné[es]*|de la source|de la fiche|du corpus|du chapitre)/i.test(plain))return null;
 if(new RegExp('^(?:Citée?s?|Mentionnée?s?|Défini|Précisé|Explicitement (?:cité|mentionné|listé)|Conforme)(?: explicitement)? (?:par|dans|à) '+genericSource+'\\.?$','i').test(plain))return null;
 if(new RegExp('^'+genericSource+' (?:le |la |les |l[’\x27])(?:précise|cite|mentionne|dit|affirme|énonce|indique|prévoit)(?: explicitement| également| comme objectif| éventuellement)?\\.?$','i').test(plain))return null;
 if(plain.length<130&&new RegExp('^(?:(?:Vrai|Faux)\\. )?'+genericSource+' (?:le |la |les |l[’\x27]|y )(?:précise|pose|cite|mentionne|dit|affirme|énonce|indique|prévoit|renvoie|présente)(?: d.emblée| ainsi| explicitement| également| comme objectif| comme cause| éventuellement)?\\.?$','i').test(plain))return null;
 if(plain.length<130&&/^(?:C.est (?:la|le|ce|une?)|Vrai\. C.est|(?:Sigle|Sérologies|Illustration|Exigence|Traitement|Qualification|Installation|Modalités|Énumération|Épistémologie|Dates|Période|Mention|Caractéristique|Fragilité|Position|Classification|Option|Fourchette|Distance|Comparaison|Proportion|Raison|Insistance|Attribution|Solution|Division|Précision)|(?:Citée?|Mentionné|Précisé|Affirmé|Souligné|Recommandé|Classée?s?) (?:explicitement )?(?:dans|par|en|parmi))/.test(plain)
   && /(?:source|corpus|chapitre|fiche)/.test(plain) && !/[;:]|\d|(?:est|sont|doit|permet|diminue|augmente|interdit|exige)\s/.test(plain.replace(/^C.est /,'')))return null;
 if(/^C.est (?:exact,? )?(?:comme illustré|ce que (?:conclut|recommande)|l.ordre exact|la fourchette rapportée|la justification donnée|le principe fondamental énoncé).+(?:source|chapitre)\.?$/.test(plain))return null;
 // Le verbe de l'affirmation et toutes ses valeurs restent inchangés.
 out=out.replace(new RegExp('\\b'+genericSource+' (?:précise|précisé|precise|indique|rappelle|explique|souligne|mentionne|énonce|rapporte|dit) (?:explicitement )?(?:que |qu[’\x27])','gi'),'');
 out=out.replace(new RegExp('\\b'+genericSource+' (?=(?:recommande|préconise|propose|décrit|cite|liste|retient|rapporte|précise|indique|mentionne|explique|souligne|rappelle|énumère|distingue|attribue|classe|définit|oppose|rattache|ajoute|range|limite|estime|insiste)\\b)','gi'),'on ');
 out=out.replace(new RegExp('\\b'+genericSource+' (?=(?:(?:le |la |les |l[’\x27])?(?:affirme|confirme|signale|fixe|decrit|décrit|définit|definit|qualifie|qualifié|stipule|identifie|place|évoque|parle|désigne|suggère|demande|impose|valorise|date|exige|inclut|prévoit|privilégie|réserve|justifie|subordonne|associe|situe|relie|conseille|interdit|conditionne|autorise|présente)|ne (?:demande|décrit|limite|hiérarchise|hierarchise)|n.exclut)\\b)','gi'),'on ');
 out=out.replace(/\bOn qualifié /g,'On qualifie ').replace(/\bon qualifié /g,'on qualifie ');
 out=out.replace(new RegExp('\\b'+genericSource+' (?:indiqué|indique) ','gi'),'on indique ');
 out=out.replace(new RegExp('\\b'+genericSource+' (?=(?:(?:le |la |les |l[’\x27])?(?:classe|nomme)|restreint|assimile|oriente|admet|lie|montre|énonce|cible|postule|chiffre|appelle|qualifié)(?=\\s))','gi'),'on ');
 out=out.replace(/\b[Oo]n qualifié /g,'On qualifie ');
 out=out.replace(new RegExp(' (?:est|sont) (?:explicitement )?(?:cit[ée]e?s?|list[ée]e?s?|mentionn[ée]e?s?) parmi les ','gi'),m=>m.startsWith(' sont')?' font partie des ':' fait partie des ');
 out=out.replace(new RegExp('\\s+selon (?:les (?:objectifs (?:thérapeutiques|temporels)|données anatomiques)|la (?:définition|classification)) de '+genericSource,'gi'),'');
 out=out.replace(new RegExp('(?:,?\\s+(?:selon|d[’\x27]après) '+genericSource+')(?![\\w’\x27])','gi'),'');
 out=out.replace(new RegExp(',?\\s+comme (?:indiqué|indique|souligné|souligne|illustré|illustre) dans '+genericSource,'gi'),'');
 out=out.replace(new RegExp('\\s+(?:dans|par) '+genericSource+'(?=[\\s]*[,.;:)]|$)','gi'),'');
 out=out.replace(/\b(est|sont) (?:explicitement )?(?:cit[ée]e?s?|list[ée]e?s?|mentionn[ée]e?s?|décrit[es]*) comme /gi,(_,verb)=>verb+' ');
 out=out.replace(new RegExp('\\b(?:C.est exact|C.est exactement le piège souligné|Précision explicite|Fréquence confirmée|Frequence confirmee)(?: '+genericSource+')?\\s*:\\s*','gi'),'');
 out=out.replace(new RegExp('(?:,?\\s+(?:selon|d[’\x27]après|comme (?:indiqué|décrit|précisé|souligne|souligné|mentionné|cite|cité)) '+genericSource+')(?=[,.;:]|$)','gi'),'');
 // Adjectifs d'attribution détachés : l'affirmation médicale est déjà complète.
 out=out.replace(new RegExp(' (est|sont) (?:explicitement )?(?:cité[es]*|cite[es]*|mentionné[es]*|mentionne[es]*|listé[es]*|liste[es]*) (?:par|dans) '+genericSource+' comme ','gi'),' $1 ');
 out=out.replace(new RegExp('\\s+(?:(?:explicitement|notamment) )?(?:cité[es]*|cite[es]*|mentionné[es]*|mentionne[es]*|identifié[es]*|listé[es]*|liste[es]*|décrit[es]*|documenté[es]*) (?:par|dans) '+genericSource,'gi'),'');
 out=out.replace(/\s+par la source(?: \(Tableau [23]\))?/gi,'');
 out=out.replace(/\b(classé[es]*|qualifié[es]*|retenu[es]*) dans la (?:source|fiche)/gi,'$1');
 if(/\b(?:est|sont)\.?\s*$/i.test(textOnly(out)))return null;
 if(out!==value){
  out=out.replace(/([.!?]\s+|^|<p>)([a-zàâéèêëîïôùûç])/g,(_,lead,char)=>lead+char.toLocaleUpperCase('fr-FR'));
  out=out.replace(/\s+([.,;])/g,'$1');
 }
 return out;
}

export const absencePattern=/(?:\bne |\bn['’]est |\bn['’]étant |\bpas |aucun|aucune|sans |rien ).{0,100}(?:mentionn|cit[ée]|figur|list[ée]|abord[ée]|dans la source|dans la fiche)|(?:source|fiche|chapitre|corpus).{0,40}(?:ne (?:mentionne|cite|fixe|définit|précise|prévoit)|n['’]en parle)|(?:absen(?:t|te)|non (?:mentionné|cité|listé)).{0,60}(?:source|fiche|chapitre|corpus)/i;
export function withoutAbsence(value){
 if(!value||!absencePattern.test(value))return value;
 // Retirer une phrase de provenance seulement si une explication médicale
 // autonome subsiste. Sinon le dossier doit être repris, et non masqué par null.
 const parts=value.split(/;\s*|(?<=[.!?])\s+(?=[A-ZÀÂÉÈÊÎÔÙÇ])/);
 const kept=parts.filter(p=>!(absencePattern.test(p)&&/(?:la source|la fiche|le chapitre|le corpus)/i.test(p)));
 const out=kept.join(' ').replace(/^\s+/,'');
 if(out===value)return null;
 if(textOnly(out).length<40||/\b(?:elle|il) (?:parle|mentionne|indique|insiste)|(?:la source|la fiche|le chapitre|le corpus)/i.test(out))return null;
 return out[0].toLocaleUpperCase('fr-FR')+out.slice(1);
}
