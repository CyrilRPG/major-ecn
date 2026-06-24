import type { PriveCourseContent } from '../prive-courses';

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Anatomie topographique du petit bassin chez la femme',
        sous_parties: [
          {
            titre: 'Vue latérale gauche : viscères pelviens',
            rows: [
              { concept: '◆ Viscères sur la ligne médiane', detail_md: "De l'avant vers l'arrière :\n· **Vessie** (en avant)\n· **Utérus** : corps utérin + col utérin (masqué par le vagin)\n· **Rectum** : ampoule rectale → canal anal → anus (en bas)\nL'utérus s'incline sur la **face supérieure de la vessie** (antéversion-antéflexion physiologique)", kind: 'a_retenir' },
              { concept: '◆ Annexes utérines', detail_md: "Corps utérin → **trompe utérine** → **pavillon** (franges tubaires) → recouvre l'**ovaire**\nLes annexes = trompes + ovaires", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Le péritoine pelvien chez la femme',
            rows: [
              { concept: '◆ Trajet du péritoine', detail_md: "Le péritoine se réfléchit sur la ligne médiane :\n· Passe **derrière le fond du vagin**\n· Revient sur la ligne médiane\n· Recouvre la **face antérieure et latérale du rectum** (attache sacrée)\n· Se réfléchit latéralement → **ligne de réflexion latérale** (péritoine viscéral → péritoine pariétal)", kind: 'a_retenir' },
              { concept: '◆ Cul-de-sac de Douglas', detail_md: "Le péritoine forme un **cul-de-sac recto-utérin** (cul-de-sac de Douglas) entre utérus et rectum\nC'est le point le plus déclive de la cavité péritonéale chez la femme", kind: 'a_retenir' },
              { concept: '◆ Paramètre', detail_md: "La trompe (annexe) **soulève le péritoine** latéralement\n→ Développement du **paramètre** sous le péritoine\nLe paramètre = tissu cellulo-graisseux situé de part et d'autre de l'utérus, sous le péritoine, contenant l'artère utérine et l'uretère", kind: 'a_retenir' },
              { concept: '⚠ Piège péritoine', detail_md: "Ne pas confondre :\n· **Péritoine viscéral** = recouvre les organes\n· **Péritoine pariétal** = tapisse les parois\n· La **ligne de réflexion** = transition entre les deux", kind: 'piege' },
            ],
          },
          {
            titre: 'Vue frontale : paroi pelvienne',
            rows: [
              { concept: '◆ Os et muscles de la paroi', detail_md: "**Os coxal** recouvert par les muscles de la paroi du bassin :\n· **Grand psoas** (muscle psoas iliaque = muscle iliaque + muscle psoas)\n· **Muscle obturateur interne** recouvert par le **muscle élévateur de l'anus**", kind: 'a_retenir' },
              { concept: '◆ Plancher pelvien', detail_md: "Le plancher du bassin est formé par le **muscle transverse profond du périnée**\nIl soutient les organes pelviens et participe à la continence", kind: 'a_retenir' },
              { concept: 'Utérus en coupe frontale', detail_md: "Corps utérin et fundus visibles en coupe\nParois utérines **enchâssées au niveau du vagin** (insertion du col dans le vagin → formation des culs-de-sac vaginaux)", kind: 'normal' },
            ],
          },
          {
            titre: 'Vascularisation artérielle pelvienne chez la femme',
            rows: [
              { concept: '◆ Axe artériel principal', detail_md: "**Artère iliaque primitive** (= artère iliaque commune)\n→ se divise en :\n· **Artère iliaque externe** (vers le membre inférieur)\n· **Artère iliaque interne** (= **artère hypogastrique**) → vascularise le pelvis", kind: 'a_retenir' },
              { concept: '◆ Artère utérine', detail_md: "L'artère hypogastrique donne de nombreuses branches dont l'**artère utérine**\n· Arrive au niveau du **col utérin**\n· Remonte **latéralement** le long de l'utérus\n· Donne l'**artère cervico-vaginale** + artères vaginales + artères vésicales\n· L'artère utérine gauche forme une **boucle** qui la ramène médialement", kind: 'a_retenir' },
              { concept: '◆ Croisement uretère–artère utérine', detail_md: "L'**uretère** croise les gros vaisseaux, descend latéralement\n→ Passe **SOUS l'artère utérine** (arrive de derrière, passe devant en la croisant par en dessous)\n→ Son trajet le porte vers l'avant pour rejoindre la **face dorsale de la vessie**", kind: 'a_retenir' },
              { concept: '⚠ Risque chirurgical majeur', detail_md: "Lors de l'hystérectomie, risque de **ligature accidentelle de l'uretère** car il passe sous l'artère utérine dans le paramètre\nMnémo : \"**L'eau passe sous le pont**\" (uretère = eau, artère utérine = pont)", kind: 'piege' },
              { concept: 'Mnémo croisement', detail_md: "\"**L'eau passe sous le pont**\"\n· L'eau = **uretère** (conduit l'urine)\n· Le pont = **artère utérine** (passe au-dessus)\nL'uretère passe SOUS l'artère utérine dans le paramètre", kind: 'mnemo' },
            ],
          },
          {
            titre: 'Innervation pelvienne chez la femme',
            rows: [
              { concept: '◆ Plexus nerveux pelvien', detail_md: "Provient du **plexus sacré** → grande lame nerveuse = **nerfs viscéraux**\nLame nerveuse soulève une petite aponévrose", kind: 'a_retenir' },
              { concept: '◆ Lame SRGVP', detail_md: "**Lame sacro-recto-génito-vésico-pubienne** (SRGVP)\n· Orientation **sagittale** (du sacrum au pubis)\n· Contient les nerfs viscéraux pelviens\n· Cloisons frontales soulevées par l'artère utérine\n· Chaque artère de la paroi latérale donne une **cloison frontale** du côté médial", kind: 'a_retenir' },
              { concept: '⚠ Risque nerveux chirurgical', detail_md: "La lame SRGVP est proche du paramètre\nLors de la chirurgie pelvienne (hystérectomie élargie), risque de **lésion des nerfs viscéraux** → troubles vésicaux et rectaux postopératoires", kind: 'piege' },
            ],
          },
        ],
      },
      {
        numero: 'II',
        titre: 'Anatomie topographique du petit bassin chez l\'homme',
        sous_parties: [
          {
            titre: 'Vue dorsale de la vessie : rapports prostatiques',
            rows: [
              { concept: '◆ Prostate', detail_md: "Base de la vessie en rapport avec la **prostate** :\n· 2 lobes, **sillon médian** palpable au toucher rectal\n· Col vésical → **urètre** → **urètre prostatique** (traverse la prostate)", kind: 'a_retenir' },
              { concept: '◆ Face dorsale de la vessie', detail_md: "Abouchement de **2 uretères** (venant de la région lombaire, trajet vers l'avant)\nLes uretères s'abouchent au niveau du **trigone vésical**", kind: 'a_retenir' },
            ],
          },
          {
            titre: 'Voies séminales',
            rows: [
              { concept: '◆ Canaux déférents', detail_md: "2 **canaux déférents** (appareil spermatique) :\n· Passent en **AVANT de l'uretère**\n· Présentent une **ampoule** à leur terminaison (ampoule déférentielle)\n· S'abouchent au niveau de la **prostate**", kind: 'a_retenir' },
              { concept: '◆ Vésicules séminales', detail_md: "**Vésicules séminales** en rapport avec la face dorsale de la vessie\n· Reçues par l'ampoule déférentielle\n· Rejoignent le canal déférent pour former le **canal éjaculateur**\n· Le péritoine recouvre partiellement la face dorsale et s'immisce entre les vésicules séminales", kind: 'a_retenir' },
              { concept: '⚠ Rapports canal déférent–uretère', detail_md: "Le canal déférent passe en **AVANT** de l'uretère\nNe pas confondre avec le croisement chez la femme (artère utérine passe AU-DESSUS de l'uretère)", kind: 'piege' },
              { concept: 'Mnémo voies séminales', detail_md: "\"**DVE**\" = Déférent → Vésicule séminale → Éjaculateur\nLe canal déférent rejoint la vésicule séminale pour former le canal éjaculateur qui traverse la prostate", kind: 'mnemo' },
            ],
          },
          {
            titre: 'Urètre masculin et prostate',
            rows: [
              { concept: '◆ Urètre prostatique', detail_md: "L'urètre traverse la prostate = **urètre prostatique**\nReçoit l'abouchement des **canaux éjaculateurs** et des **canaux prostatiques**\nPuis se continue en urètre membraneux → urètre spongieux", kind: 'a_retenir' },
              { concept: 'Structure prostatique', detail_md: "Prostate : glande fibro-musculaire\n· Entoure l'urètre prostatique\n· 2 lobes séparés par un **sillon médian**\n· Rapport postérieur avec le rectum → accessible au **toucher rectal**", kind: 'normal' },
            ],
          },
        ],
      },
      {
        numero: 'III',
        titre: 'Applications cliniques : touchers pelviens',
        sous_parties: [
          {
            titre: 'Toucher rectal chez l\'homme',
            rows: [
              { concept: '◆ Toucher rectal masculin', detail_md: "Permet de palper :\n· **Prostate** (partie basse) : taille, consistance, sillon médian, nodules\n· Au-dessus : les **annexes** (voies séminales = vésicules séminales)\nIndications : recherche HBP, cancer prostatique, prostatite", kind: 'a_retenir' },
              { concept: 'Sémiologie prostatique', detail_md: "Prostate normale : souple, régulière, sillon médian perceptible\n**Cancer** : nodule dur, irrégulier\n**HBP** : augmentation de volume homogène, sillon médian effacé\n**Prostatite** : douloureuse au toucher", kind: 'normal' },
            ],
          },
          {
            titre: 'Touchers pelviens chez la femme',
            rows: [
              { concept: '◆ Toucher vaginal', detail_md: "Examine les rapports anatomiques :\n· **Col utérin** (taille, consistance, mobilité, douleur)\n· **Culs-de-sac vaginaux** (latéraux, postérieur = Douglas)\n· Mobilisation utérine + palpation bimanuelle abdominale", kind: 'a_retenir' },
              { concept: '◆ Toucher rectal chez la femme', detail_md: "Explore la **fosse pararectale**\n· Recherche masse pathologique\n· Implantation au niveau des annexes\n· Apprécie la cloison recto-vaginale\n· Complète le toucher vaginal si celui-ci est difficile ou insuffisant", kind: 'a_retenir' },
              { concept: '⚠ Cul-de-sac de Douglas', detail_md: "Le cul-de-sac de Douglas (recto-utérin) est le point le plus déclive du péritoine chez la femme\n→ Lieu de collection des **épanchements péritonéaux** (sang, pus, liquide)\n→ Accessible par **toucher vaginal** (bombement du cul-de-sac postérieur) ou par **culdocentèse**", kind: 'piege' },
            ],
          },
          {
            titre: 'Implications chirurgicales',
            rows: [
              { concept: '◆ Hystérectomie et uretère', detail_md: "Lors de l'hystérectomie, le **paramètre** doit être clampé et sectionné\nRisque majeur = **ligature ou section de l'uretère** qui passe sous l'artère utérine dans le paramètre\nRepérage systématique de l'uretère obligatoire", kind: 'a_retenir' },
              { concept: '◆ Chirurgie pelvienne et nerfs', detail_md: "La lame SRGVP contient les nerfs végétatifs pelviens\nChirurgie rectale ou hystérectomie élargie → risque de **dénervation vésicale et rectale**\n→ Rétention urinaire, troubles de la continence", kind: 'a_retenir' },
              { concept: 'Chirurgie prostatique', detail_md: "La prostatectomie radicale expose au risque de lésion :\n· **Nerfs érecteurs** (bandelettes neuro-vasculaires)\n· **Sphincter strié de l'urètre** → incontinence\nTechnique nerve-sparing pour préserver l'érection", kind: 'normal' },
            ],
          },
        ],
      },
    ],
    points_cles: [
      "L'utérus s'incline sur la face supérieure de la vessie (antéversion-antéflexion physiologique)",
      "Annexes = trompes utérines + ovaires ; la trompe soulève le péritoine → paramètre",
      "Le péritoine forme le cul-de-sac de Douglas (recto-utérin) = point le plus déclive chez la femme",
      "L'artère iliaque primitive se divise en artère iliaque externe + artère iliaque interne (= hypogastrique)",
      "L'artère utérine (branche de l'hypogastrique) arrive au col et remonte latéralement le long de l'utérus",
      "L'uretère passe SOUS l'artère utérine dans le paramètre (« l'eau passe sous le pont »)",
      "La lame SRGVP (sacro-recto-génito-vésico-pubienne) contient les nerfs viscéraux pelviens",
      "Chez l'homme : le canal déférent passe en AVANT de l'uretère",
      "La prostate (2 lobes, sillon médian) est traversée par l'urètre prostatique",
      "Le toucher rectal palpe la prostate (homme) ou explore la fosse pararectale (femme)",
    ],
  },
  flashcards: [
    // === PARTIE I : Anatomie femme — Viscères et annexes ===
    { recto: "Quels sont les 3 viscères pelviens sur la ligne médiane chez la femme (d'avant en arrière) ?", verso: "· <b>Vessie</b> (en avant)\n· <b>Utérus</b> (corps + col)\n· <b>Rectum</b> (ampoule rectale → canal anal → anus)", order_index: 1 },
    { recto: "Comment l'utérus se positionne-t-il par rapport à la vessie ?", verso: "L'utérus <b>s'incline sur la face supérieure de la vessie</b> (antéversion-antéflexion physiologique)", order_index: 2 },
    { recto: "Que comprennent les annexes utérines ?", verso: "· <b>Trompe utérine</b> (avec pavillon et franges tubaires)\n· <b>Ovaire</b>\nLe pavillon recouvre l'ovaire", order_index: 3 },
    { recto: "Quel est le trajet des annexes depuis le corps utérin ?", verso: "Corps utérin → <b>trompe utérine</b> → <b>pavillon</b> (franges tubaires) → recouvre l'<b>ovaire</b>", order_index: 4 },
    { recto: "Que sont les franges tubaires ?", verso: "Prolongements digitiformes du <b>pavillon de la trompe utérine</b>\nElles captent l'ovocyte lors de l'ovulation et recouvrent l'ovaire", order_index: 5 },
    { recto: "Quelles sont les 3 parties du rectum visibles sur une coupe sagittale ?", verso: "· <b>Ampoule rectale</b> (partie dilatée)\n· <b>Canal anal</b>\n· <b>Anus</b> (en bas)", order_index: 6 },
    // === Péritoine ===
    { recto: "Comment le péritoine se comporte-t-il au niveau de la ligne médiane chez la femme ?", verso: "Le péritoine se <b>réfléchit</b> sur la ligne médiane :\n· Passe derrière le fond du vagin\n· Revient sur la ligne médiane\n· Recouvre la face antérieure et latérale du rectum (attache sacrée)", order_index: 7 },
    { recto: "Qu'est-ce que la ligne de réflexion latérale du péritoine ?", verso: "C'est le moment où le <b>péritoine viscéral</b> devient <b>péritoine pariétal</b>\nLe péritoine tombant se réfléchit latéralement → ligne pariétale", order_index: 8 },
    { recto: "Qu'est-ce que le péritoine viscéral ?", verso: "Le péritoine qui <b>recouvre les organes</b> (utérus, vessie, rectum)\nÀ différencier du péritoine pariétal qui tapisse les parois", order_index: 9 },
    { recto: "Qu'est-ce que le péritoine pariétal ?", verso: "Le péritoine qui <b>tapisse les parois</b> de la cavité abdomino-pelvienne\nÀ différencier du péritoine viscéral qui recouvre les organes", order_index: 10 },
    { recto: "Qu'est-ce que le cul-de-sac de Douglas chez la femme ?", verso: "Cul-de-sac <b>recto-utérin</b> formé par le péritoine entre l'utérus et le rectum\nC'est le <b>point le plus déclive</b> de la cavité péritonéale chez la femme", order_index: 11 },
    { recto: "Qu'est-ce que le paramètre ?", verso: "Tissu cellulo-graisseux situé <b>de part et d'autre de l'utérus</b>, sous le péritoine\nFormé car la trompe (annexe) <b>soulève le péritoine</b>\nContient l'artère utérine et l'uretère", order_index: 12 },
    { recto: "Comment se forme le paramètre ?", verso: "La <b>trompe utérine</b> (annexe) soulève le péritoine latéralement\n→ Développement du paramètre <b>sous le péritoine</b>", order_index: 13 },
    { recto: "VRAI ou FAUX : le paramètre se développe au-dessus du péritoine", verso: "<b>FAUX</b>\nLe paramètre se développe <b>sous</b> le péritoine\nIl est soulevé par la trompe utérine latéralement", order_index: 14 },
    { recto: "VRAI ou FAUX : le péritoine passe devant le fond du vagin chez la femme", verso: "<b>FAUX</b>\nLe péritoine passe <b>derrière</b> le fond du vagin\nPuis il revient sur la ligne médiane pour recouvrir le rectum", order_index: 15 },
    // === Paroi pelvienne ===
    { recto: "Quel os forme la paroi du bassin ?", verso: "L'<b>os coxal</b>, recouvert par les muscles de la paroi pelvienne", order_index: 16 },
    { recto: "Quels sont les muscles de la paroi du bassin ?", verso: "· <b>Grand psoas</b> (muscle psoas iliaque = muscle iliaque + muscle psoas)\n· <b>Muscle obturateur interne</b> recouvert par le muscle élévateur de l'anus", order_index: 17 },
    { recto: "Qu'est-ce que le muscle psoas iliaque ?", verso: "C'est la réunion de deux muscles :\n· <b>Muscle iliaque</b>\n· <b>Muscle psoas</b>\n= Grand psoas = muscle de la paroi pelvienne", order_index: 18 },
    { recto: "Quel muscle recouvre l'obturateur interne ?", verso: "Le <b>muscle élévateur de l'anus</b>", order_index: 19 },
    { recto: "Quel muscle forme le plancher du bassin ?", verso: "Le <b>muscle transverse profond du périnée</b>", order_index: 20 },
    { recto: "Quel est le rôle du muscle élévateur de l'anus ?", verso: "· Forme le <b>diaphragme pelvien</b> (plancher pelvien)\n· Soutient les organes pelviens\n· Participe à la <b>continence</b> anale et urinaire\n· Recouvre le muscle obturateur interne", order_index: 21 },
    { recto: "Comment les parois utérines sont-elles en rapport avec le vagin ?", verso: "Les parois utérines sont <b>enchâssées au niveau du vagin</b>\nLe col utérin s'insère dans le vagin → formation des culs-de-sac vaginaux", order_index: 22 },
    // === Vascularisation ===
    { recto: "En quoi se divise l'artère iliaque primitive ?", verso: "· <b>Artère iliaque externe</b> (vers le membre inférieur)\n· <b>Artère iliaque interne</b> (= artère <b>hypogastrique</b>) → vascularise le pelvis", order_index: 23 },
    { recto: "Quel est l'autre nom de l'artère iliaque interne ?", verso: "<b>Artère hypogastrique</b>", order_index: 24 },
    { recto: "VRAI ou FAUX : l'artère iliaque primitive est aussi appelée artère hypogastrique", verso: "<b>FAUX</b>\nC'est l'<b>artère iliaque interne</b> qui est aussi appelée artère hypogastrique\nL'artère iliaque primitive (commune) est le tronc qui se divise en iliaque externe et interne", order_index: 25 },
    { recto: "De quelle artère naît l'artère utérine ?", verso: "De l'<b>artère hypogastrique</b> (= artère iliaque interne)", order_index: 26 },
    { recto: "Quel est le trajet de l'artère utérine ?", verso: "· Naît de l'artère <b>hypogastrique</b>\n· Arrive au niveau du <b>col utérin</b>\n· Remonte <b>latéralement</b> le long de l'utérus\n· Donne l'artère cervico-vaginale + artères vaginales + artères vésicales", order_index: 27 },
    { recto: "Quelles branches donne l'artère utérine ?", verso: "· <b>Artère cervico-vaginale</b>\n· <b>Artères vaginales</b>\n· <b>Artères vésicales</b>\n· Autres branches pour le corps utérin", order_index: 28 },
    { recto: "Quelle particularité a l'artère utérine gauche ?", verso: "L'artère utérine gauche forme une <b>boucle</b> qui la ramène médialement", order_index: 29 },
    { recto: "Quelle artère vascularise le membre inférieur à partir de l'axe iliaque ?", verso: "L'<b>artère iliaque externe</b> (branche de l'artère iliaque primitive)\nElle se continue en artère fémorale après le ligament inguinal", order_index: 30 },
    { recto: "Qu'est-ce que l'artère cervico-vaginale ?", verso: "Branche de l'<b>artère utérine</b> qui vascularise le <b>col utérin</b> (cervix) et le <b>vagin</b>", order_index: 31 },
    { recto: "VRAI ou FAUX : l'artère cervico-vaginale est une branche de l'artère iliaque externe", verso: "<b>FAUX</b>\nL'artère cervico-vaginale est une branche de l'<b>artère utérine</b>\nL'artère utérine naît de l'artère iliaque <b>interne</b> (hypogastrique)", order_index: 32 },
    { recto: "VRAI ou FAUX : l'artère utérine naît de l'artère iliaque externe", verso: "<b>FAUX</b>\nL'artère utérine naît de l'<b>artère iliaque interne</b> (= artère hypogastrique)\nPas de l'artère iliaque externe", order_index: 33 },
    // === Uretère ===
    { recto: "Quel est le rapport entre l'uretère et l'artère utérine ?", verso: "L'uretère passe <b>SOUS</b> l'artère utérine\nIl arrive de derrière, passe devant en la croisant par en dessous\nMnémo : « <b>L'eau passe sous le pont</b> »", order_index: 34 },
    { recto: "Mnémo : « L'eau passe sous le pont » — que signifie-t-il ?", verso: "· L'eau = <b>uretère</b> (conduit l'urine)\n· Le pont = <b>artère utérine</b> (passe au-dessus)\nL'uretère passe SOUS l'artère utérine dans le paramètre", order_index: 35 },
    { recto: "Quel est le trajet de l'uretère dans le pelvis féminin ?", verso: "L'uretère <b>croise les gros vaisseaux</b>, descend latéralement\n→ Passe <b>sous l'artère utérine</b>\n→ Son trajet le porte vers l'avant pour rejoindre la <b>face dorsale de la vessie</b>", order_index: 36 },
    { recto: "Pourquoi le croisement uretère–artère utérine est-il important en chirurgie ?", verso: "Lors de l'<b>hystérectomie</b>, le paramètre est clampé\nRisque de <b>ligature accidentelle de l'uretère</b> car il passe sous l'artère utérine dans le paramètre", order_index: 37 },
    { recto: "VRAI ou FAUX : l'artère utérine passe sous l'uretère", verso: "<b>FAUX</b>\nC'est l'<b>uretère</b> qui passe <b>sous</b> l'<b>artère utérine</b>\n(« l'eau passe sous le pont »)", order_index: 38 },
    { recto: "VRAI ou FAUX : l'uretère se termine sur la face ventrale de la vessie", verso: "<b>FAUX</b>\nL'uretère se porte vers l'avant pour rejoindre la <b>face dorsale</b> de la vessie (face postérieure)", order_index: 39 },
    { recto: "Où l'uretère s'abouche-t-il dans la vessie ?", verso: "Sur la <b>face dorsale de la vessie</b>, au niveau du <b>trigone vésical</b> (triangle formé par les 2 orifices urétéraux et l'orifice urétral)", order_index: 40 },
    // === Innervation ===
    { recto: "D'où provient l'innervation viscérale du pelvis ?", verso: "Du <b>plexus sacré</b> → grande lame nerveuse = <b>nerfs viscéraux</b>", order_index: 41 },
    { recto: "Qu'est-ce que la lame SRGVP ?", verso: "<b>Lame sacro-recto-génito-vésico-pubienne</b>\n· Orientation <b>sagittale</b> (du sacrum au pubis)\n· Contient les nerfs viscéraux pelviens\n· Soulevée par l'aponévrose de la lame nerveuse", order_index: 42 },
    { recto: "Sigles : que signifie SRGVP ?", verso: "<b>S</b>acro-<b>R</b>ecto-<b>G</b>énito-<b>V</b>ésico-<b>P</b>ubienne\nLame nerveuse sagittale du sacrum au pubis contenant les nerfs viscéraux pelviens", order_index: 43 },
    { recto: "Quelle est l'orientation de la lame SRGVP ?", verso: "Orientation <b>sagittale</b> : du <b>sacrum</b> au <b>pubis</b>", order_index: 44 },
    { recto: "Que contient la lame SRGVP ?", verso: "Les <b>nerfs viscéraux pelviens</b> (innervation végétative des organes pelviens : vessie, rectum, organes génitaux)", order_index: 45 },
    { recto: "Qu'est-ce qui soulève les cloisons frontales dans le pelvis ?", verso: "L'<b>artère utérine</b> soulève les cloisons frontales\nChaque artère de la paroi latérale donne une <b>cloison frontale</b> du côté médial", order_index: 46 },
    { recto: "Quels organes sont innervés par les nerfs de la lame SRGVP ?", verso: "· <b>Rectum</b>\n· <b>Organes génitaux</b> (utérus, vagin / prostate, vésicules séminales)\n· <b>Vessie</b>\nInnervation végétative (parasympathique et sympathique)", order_index: 47 },
    // === Éléments contenus dans le paramètre ===
    { recto: "Quels éléments contient le paramètre ?", verso: "· <b>Artère utérine</b>\n· <b>Uretère</b>\n· Veines utérines\n· Nerfs pelviens\n· Tissu cellulo-graisseux", order_index: 48 },
    // === PARTIE II : Anatomie homme ===
    { recto: "Avec quel organe la base de la vessie est-elle en rapport chez l'homme ?", verso: "Avec la <b>prostate</b>\n· 2 lobes\n· Sillon médian\n· Située sous le col vésical", order_index: 49 },
    { recto: "Combien de lobes possède la prostate ? Quel repère anatomique les sépare ?", verso: "<b>2 lobes</b> séparés par un <b>sillon médian</b>\nCe sillon est palpable au toucher rectal", order_index: 50 },
    { recto: "VRAI ou FAUX : la prostate est formée de 3 lobes", verso: "<b>FAUX</b>\nLa prostate est formée de <b>2 lobes</b> avec un <b>sillon médian</b>", order_index: 51 },
    { recto: "Quel est le trajet de l'urètre au niveau prostatique ?", verso: "Col vésical → <b>urètre</b> → <b>urètre prostatique</b> (traverse la prostate)\nPuis urètre membraneux → urètre spongieux", order_index: 52 },
    { recto: "Quels sont les segments de l'urètre masculin (dans l'ordre) ?", verso: "· <b>Urètre prostatique</b> (traverse la prostate)\n· <b>Urètre membraneux</b> (traverse le diaphragme uro-génital)\n· <b>Urètre spongieux</b> (traverse le corps spongieux)", order_index: 53 },
    { recto: "Que trouve-t-on sur la face dorsale de la vessie chez l'homme ?", verso: "· Abouchement des <b>2 uretères</b>\n· <b>2 canaux déférents</b>\n· <b>Vésicules séminales</b>\n· Péritoine recouvrant partiellement la face dorsale", order_index: 54 },
    { recto: "D'où viennent les uretères et comment arrivent-ils à la vessie chez l'homme ?", verso: "Les uretères viennent de la <b>région lombaire</b>\nTrajet vers l'avant pour s'aboucher sur la <b>face dorsale de la vessie</b> (trigone vésical)", order_index: 55 },
    { recto: "Quel est le rapport du canal déférent avec l'uretère ?", verso: "Le canal déférent passe en <b>AVANT de l'uretère</b>", order_index: 56 },
    { recto: "VRAI ou FAUX : les canaux déférents passent en arrière de l'uretère", verso: "<b>FAUX</b>\nLes canaux déférents passent <b>en avant</b> de l'uretère", order_index: 57 },
    { recto: "Quelle structure se trouve à la terminaison du canal déférent ?", verso: "Une <b>ampoule</b> (ampoule déférentielle) à sa terminaison\nLe canal déférent s'abouche au niveau de la prostate", order_index: 58 },
    { recto: "Qu'est-ce que l'ampoule déférentielle ?", verso: "Dilatation terminale du <b>canal déférent</b> avant sa jonction avec la vésicule séminale\nSituée sur la face dorsale de la vessie", order_index: 59 },
    { recto: "Où sont situées les vésicules séminales ?", verso: "En rapport avec la <b>face dorsale de la vessie</b>\n· Reçues par l'ampoule déférentielle\n· Le péritoine s'immisce entre elles", order_index: 60 },
    { recto: "Comment le péritoine se comporte-t-il au niveau des vésicules séminales ?", verso: "Le péritoine recouvre <b>partiellement</b> la face dorsale de la vessie\nIl <b>s'immisce entre les vésicules séminales</b>", order_index: 61 },
    { recto: "VRAI ou FAUX : le péritoine du petit bassin recouvre entièrement la face dorsale de la vessie chez l'homme", verso: "<b>FAUX</b>\nLe péritoine recouvre <b>partiellement</b> la face dorsale de la vessie en arrière\nIl s'immisce entre les vésicules séminales", order_index: 62 },
    { recto: "Qu'est-ce que le canal éjaculateur ? Comment se forme-t-il ?", verso: "Le <b>canal déférent</b> rejoint la <b>vésicule séminale</b> → forme le <b>canal éjaculateur</b>\nCelui-ci traverse la prostate pour s'ouvrir dans l'urètre prostatique", order_index: 63 },
    { recto: "Mnémo DVE : que signifie-t-il ?", verso: "<b>D</b>éférent → <b>V</b>ésicule séminale → <b>É</b>jaculateur\nLe canal déférent rejoint la vésicule séminale pour former le canal éjaculateur", order_index: 64 },
    { recto: "Quels canaux s'abouchent au niveau de la prostate ?", verso: "· Les <b>canaux éjaculateurs</b> (déférent + vésicule séminale)\n· Les <b>canaux prostatiques</b>\nIls s'ouvrent dans l'urètre prostatique", order_index: 65 },
    { recto: "Quel est le rapport postérieur de la prostate ?", verso: "Le <b>rectum</b>\nC'est pourquoi la prostate est accessible au <b>toucher rectal</b>", order_index: 66 },
    { recto: "Quel est le cul-de-sac péritonéal le plus déclive chez l'homme ?", verso: "Le cul-de-sac <b>recto-vésical</b> (entre rectum et vessie)\nÉquivalent du cul-de-sac de Douglas chez la femme", order_index: 67 },
    { recto: "Différence entre cul-de-sac de Douglas homme vs femme ?", verso: "· <b>Femme</b> : cul-de-sac <b>recto-utérin</b> (entre utérus et rectum)\n· <b>Homme</b> : cul-de-sac <b>recto-vésical</b> (entre rectum et vessie)\nDans les deux cas, c'est le point le plus déclive du péritoine", order_index: 68 },
    { recto: "Quel est le trajet du canal déférent (complet) ?", verso: "Épididyme → canal inguinal → <b>en avant de l'uretère</b> → ampoule déférentielle → rejoint la vésicule séminale → canal éjaculateur → prostate", order_index: 69 },
    { recto: "VRAI ou FAUX : les vésicules séminales s'abouchent directement dans la vessie", verso: "<b>FAUX</b>\nLes vésicules séminales se connectent à l'<b>ampoule déférentielle</b>\nPuis le canal éjaculateur s'abouche dans la <b>prostate</b>", order_index: 70 },
    // === PARTIE III : Applications cliniques ===
    { recto: "Que permet de palper le toucher rectal chez l'homme ?", verso: "· <b>Prostate</b> (partie basse) : taille, consistance, sillon médian, nodules\n· Au-dessus : les <b>annexes</b> (voies séminales = vésicules séminales)", order_index: 71 },
    { recto: "Quelles sont les indications du toucher rectal chez l'homme ?", verso: "· Recherche d'<b>HBP</b> (hypertrophie bénigne de la prostate)\n· <b>Cancer prostatique</b> (nodule dur)\n· <b>Prostatite</b> (prostate douloureuse)", order_index: 72 },
    { recto: "Comment se présente une prostate normale au toucher rectal ?", verso: "· <b>Souple</b>\n· <b>Régulière</b>\n· <b>Sillon médian perceptible</b>\n· Indolore", order_index: 73 },
    { recto: "Comment se présente un cancer prostatique au toucher rectal ?", verso: "· <b>Nodule dur</b>\n· <b>Irrégulier</b>\n· Perte possible du sillon médian", order_index: 74 },
    { recto: "Comment se présente une HBP au toucher rectal ?", verso: "· <b>Augmentation de volume homogène</b>\n· <b>Sillon médian effacé</b>\n· Consistance souple", order_index: 75 },
    { recto: "Comment se présente une prostatite au toucher rectal ?", verso: "Prostate <b>douloureuse</b> au toucher\n· Parfois augmentée de volume\n· Consistance variable", order_index: 76 },
    { recto: "Comment distinguer HBP et cancer au toucher rectal ?", verso: "· <b>HBP</b> : augmentation homogène, souple, sillon médian effacé\n· <b>Cancer</b> : nodule <b>dur</b>, <b>irrégulier</b>, perte du sillon", order_index: 77 },
    { recto: "Que recherche-t-on au toucher vaginal ?", verso: "· <b>Col utérin</b> : taille, consistance, mobilité, douleur\n· <b>Culs-de-sac vaginaux</b> (latéraux, postérieur = Douglas)\n· Mobilisation utérine + palpation bimanuelle abdominale", order_index: 78 },
    { recto: "Que recherche-t-on au toucher rectal chez la femme ?", verso: "· Exploration de la <b>fosse pararectale</b>\n· Recherche de <b>masse pathologique</b>\n· Implantation au niveau des <b>annexes</b>\n· Appréciation de la cloison recto-vaginale", order_index: 79 },
    { recto: "Quels culs-de-sac vaginaux explore-t-on au toucher vaginal ?", verso: "· Culs-de-sac <b>latéraux</b> (droite et gauche)\n· Cul-de-sac <b>postérieur</b> (= en rapport avec le Douglas)\n· Cul-de-sac <b>antérieur</b> (en rapport avec la vessie)", order_index: 80 },
    { recto: "Pourquoi le cul-de-sac de Douglas est-il cliniquement important ?", verso: "C'est le point le plus <b>déclive</b> de la cavité péritonéale chez la femme\n→ Lieu de <b>collection des épanchements</b> (sang, pus, liquide)\n→ Accessible par toucher vaginal (bombement du cul-de-sac postérieur)", order_index: 81 },
    { recto: "Pourquoi le cul-de-sac de Douglas peut-il bomber au toucher vaginal ?", verso: "En cas d'<b>épanchement péritonéal</b> (hémopéritoine, abcès, ascite)\nLe liquide se collecte au point le plus déclive → <b>bombement du cul-de-sac postérieur</b>", order_index: 82 },
    { recto: "Qu'est-ce que la culdocentèse ?", verso: "Ponction du <b>cul-de-sac de Douglas</b> par voie vaginale postérieure\nPermet de rechercher un <b>épanchement péritonéal</b> (sang, pus)", order_index: 83 },
    { recto: "Qu'est-ce que la fosse pararectale ?", verso: "Espace situé <b>latéralement au rectum</b> dans le pelvis\nExplorée par le <b>toucher rectal</b> chez la femme\nRecherche de masse pathologique ou d'envahissement tumoral", order_index: 84 },
    { recto: "Chez la femme, qu'est-ce qui sépare le vagin du rectum ?", verso: "La <b>cloison recto-vaginale</b>\nElle est appréciée par le toucher rectal chez la femme", order_index: 85 },
    // === Implications chirurgicales ===
    { recto: "Quel risque majeur lors d'une hystérectomie ?", verso: "<b>Ligature ou section accidentelle de l'uretère</b>\nCar l'uretère passe sous l'artère utérine dans le paramètre\n→ Repérage systématique de l'uretère obligatoire", order_index: 86 },
    { recto: "Quel risque nerveux lors de la chirurgie pelvienne élargie ?", verso: "Risque de <b>dénervation vésicale et rectale</b>\nCar la lame SRGVP contient les nerfs végétatifs pelviens\n→ Rétention urinaire, troubles de la continence", order_index: 87 },
    { recto: "Quels troubles postopératoires peut entraîner une lésion de la lame SRGVP ?", verso: "· <b>Rétention urinaire</b>\n· <b>Troubles de la continence</b> (urinaire et anale)\n· Troubles de la fonction sexuelle\nCar la lame contient les nerfs végétatifs pelviens", order_index: 88 },
    { recto: "Quels nerfs sont à risque lors d'une prostatectomie radicale ?", verso: "· <b>Nerfs érecteurs</b> (bandelettes neuro-vasculaires) → dysfonction érectile\n· <b>Sphincter strié de l'urètre</b> → incontinence\nTechnique nerve-sparing pour préserver l'érection", order_index: 89 },
    { recto: "Quelle technique chirurgicale préserve les nerfs érecteurs lors de la prostatectomie ?", verso: "La technique <b>nerve-sparing</b>\nElle préserve les <b>bandelettes neuro-vasculaires</b> pour maintenir la fonction érectile", order_index: 90 },
    { recto: "Quel est le risque fonctionnel majeur de la prostatectomie radicale ?", verso: "· <b>Dysfonction érectile</b> (lésion des nerfs érecteurs)\n· <b>Incontinence urinaire</b> (lésion du sphincter strié)", order_index: 91 },
    // === Comparaisons et révision croisée ===
    { recto: "Quelle est la différence de croisement uretère chez la femme vs l'homme ?", verso: "· <b>Femme</b> : uretère passe <b>sous l'artère utérine</b> dans le paramètre\n· <b>Homme</b> : canal déférent passe en <b>avant de l'uretère</b>", order_index: 92 },
    { recto: "Résumer les différences entre les touchers pelviens chez l'homme et la femme", verso: "<b>Homme</b> (toucher rectal) :\n· Partie basse : <b>prostate</b>\n· Au-dessus : voies séminales\n\n<b>Femme</b> (touchers pelviens) :\n· Toucher vaginal : <b>col utérin</b>, culs-de-sac\n· Toucher rectal : fosse pararectale, <b>annexes</b>", order_index: 93 },
    { recto: "Qu'est-ce que l'antéversion utérine ?", verso: "L'axe du col utérin fait un angle ouvert en avant avec l'axe du vagin\nL'utérus est basculé <b>vers l'avant</b> sur la vessie", order_index: 94 },
    { recto: "Qu'est-ce que l'antéflexion utérine ?", verso: "Le corps utérin fait un angle ouvert en avant avec le col utérin\nLe corps se <b>fléchit vers l'avant</b> sur le col", order_index: 95 },
    { recto: "VRAI ou FAUX : chez la femme, le rectum se situe en avant de l'utérus", verso: "<b>FAUX</b>\nLe rectum se situe <b>en arrière</b> de l'utérus\nL'ordre de ventral à dorsal est : vessie → utérus → rectum", order_index: 96 },
    { recto: "Qu'est-ce que le trigone vésical ?", verso: "Triangle formé sur la face interne de la vessie par :\n· Les <b>2 orifices urétéraux</b> (en haut)\n· L'<b>orifice urétral interne</b> (en bas)\nZone la plus fixe de la vessie", order_index: 97 },
    { recto: "Résumer les 3 principaux muscles du plancher et de la paroi pelvienne", verso: "Paroi :\n· <b>Grand psoas</b> (muscle iliaque + muscle psoas)\n· <b>Obturateur interne</b> (recouvert par l'élévateur de l'anus)\n\nPlancher :\n· <b>Muscle transverse profond du périnée</b>", order_index: 98 },
    { recto: "Résumer les structures vasculaires principales du petit bassin féminin", verso: "· <b>Artère iliaque primitive</b> → se divise en :\n  · <b>Artère iliaque externe</b>\n  · <b>Artère iliaque interne</b> (hypogastrique) → donne :\n    · <b>Artère utérine</b> → donne :\n      · Artère cervico-vaginale\n      · Artères vaginales, vésicales", order_index: 99 },
    { recto: "Résumer les 3 dangers chirurgicaux du petit bassin", verso: "1. <b>Croisement uretère/artère utérine</b> : risque de ligature de l'uretère lors d'hystérectomie\n2. <b>Lame SRGVP</b> : risque de dénervation vésicale et rectale\n3. <b>Bandelettes neuro-vasculaires</b> : risque de dysfonction érectile lors de prostatectomie", order_index: 100 },
  ],
  annales: [],
};

export default content;
