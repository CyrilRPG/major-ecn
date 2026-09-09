/** Contrôles de publication, sans réécriture automatique des données. */
export function validateBankSeries(series){
 const errors=[];
 const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const fabrication=/(?:correction|réponse) fondée sur le corpus|(?:la source|le corpus|le document fourni) (?:ne mentionne|ne cite|précise|indique)|correction s.appuie exclusivement|ce distracteur|mmctm|(?:problème de|problème d’)(?:quelles?|dans |à propos)|quelle décision est appropriée concernant (?:On|Vous)|(?:à vérifier|à compléter) (?:avant publication|par le rédacteur)|incohérence du document|contradictoires.+indiqués comme corrects/i;
 for(const serie of series){
  if(!Array.isArray(serie.questions)||!serie.questions.length){errors.push(`${serie.label} : aucune question`);continue;}
  for(const [index,q] of serie.questions.entries()){
   const location=`${serie.label} Q${index+1}`;
   const stem=plain(q.enonce);
   if(stem.length<8)errors.push(`${location} : consigne absente`);
   if(/^(.{20,}?)\s*\1/i.test(stem))errors.push(`${location} : introduction dupliquée`);
   const qroc=q.format==='qroc'||serie.kind==='qroc'||serie.type==='qroc';
   if(qroc){if(!plain(q.reponse_attendue)&&!plain(q.correction_generale))errors.push(`${location} : corrigé rédactionnel absent`);}
   else if(!q.items?.length||!q.items.some(i=>i.is_correct))errors.push(`${location} : propositions ou bonne réponse absentes`);
   for(const value of [q.enonce,q.correction_generale,q.commentaire_enseignant,...(q.items??[]).flatMap(i=>[i.enonce,i.justification])])if(fabrication.test(plain(value))){errors.push(`${location} : contenu de fabrication ou corrigé non justifié`);break;}
  }
 }
 return errors;
}
