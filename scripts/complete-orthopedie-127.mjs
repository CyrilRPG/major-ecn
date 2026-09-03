import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const d = resolve(
    process.argv[2] ||
      "../.corpus-orthopedie/tumeurs-benignes-epiphysometaphysaires",
  ),
  o = resolve(process.argv[3] || join(d, "delivery", "quality-v1"));
const raw =
  `Territoire épiphysométaphysaire|De l’os sous-chondral à l’isthme cortical diaphysaire.|2
Particularité de ce territoire|Il est juxta-articulaire, au sein des insertions capsulaires.|2
Tissus d’une tumeur bénigne|Osseux, cartilagineux ou fibreux.|5
Critère histologique de bénignité|Absence de caractères cytologiques de malignité.|5
Comment grader l’agressivité|Par radiographie et évolutivité.|7
Marge d’exérèse habituelle|Intralésionnelle ou périlésionnelle.|9
Quand renforcer après exérèse|Selon fragilité tumorale ou induite.|9
Biopsie toujours obligatoire ?|Non, la décision est raisonnée.|12
Critère clinique de biopsie|Douleur ou découverte fortuite.|13
Critère radiographique de biopsie|Image caractéristique et évolution sur clichés.|14
Critère scintigraphique|Fixation mono ou polyostotique et son intensité.|15
Type de biopsie diagnostique|Radioguidée, au trocart ou chirurgicale.|16
Biopsie-exérèse|Emporte la totalité de la tumeur.|17
Grade 1 après certitude diagnostique|Surveillance radiographique possible.|20
Motif douloureux d’exérèse|Activité tumorale ou fragilisation épiphysaire.|25
Type d’exérèse conservatrice|Intervention intracompartimentale.|27
Imagerie de première ligne|Radiographie standard et TDM.|29
Rôle des rayons X|Analyser destruction corticale et planifier.|32
Technique sans geste unique|Les tumeurs sont trop diverses pour un modèle universel.|34
Principe destruction radioguidée|Forage transosseux repéré par amplificateur ou scanner.|38
Qui réalise la destruction radioguidée|Radiologue spécialisé.|38
Nature du curetage|Exérèse intralésionnelle.|40
But du curetage|Ôter tout tissu tumoral en conservant le cortex.|40
Risque fenêtre trop petite|Laisser de la tumeur sur une paroi.|41
Planification de fenêtre|Radiographies préopératoires.|41
Curettes centrales|Droites, gros diamètre 5 à 10 mm.|43
Curettes pariétales|Petites, de 2 à 4 mm.|43
But des adjuvants|Compléter destruction des parois corticales.|45
Adjuvant thermique|Ciment ou bistouri électrique.|45
Adjuvant par froid|Cryothérapie.|45
Comblement classique|Autogreffe spongieuse.|47
Grande cavité|Autogreffe avec allogreffe morcelée possible.|47
Substitut de synthèse|Phosphate tricalcique.|47
Renforcement systématique ?|Non, il dépend de l’état cortical.|49
Classification mécanique utile|Lodwick.|49
Stades faisant discuter renfort|IC, II et III.|49
Extension épiphysaire|Risque de perte de soutien sous-chondral.|50
Position du renfort épiphysaire|Sous l’os sous-chondral.|50
Renfort possible|Étai osseux ou plaque endo-osseuse.|53
Résection monobloc habituelle|Marginale et sous-périostée.|55
Exostose base <15 mm|Pas d’ostéosynthèse nécessaire.|59
Résection avec reconstruction articulaire|Exceptionnelle, surtout récidives agressives.|61
Nidus ostéome ostéoïde|≤10 mm.|70
Choix ostéome ostéoïde|Repérage précis du nidus.|70
Ostéoblastome diamètre|10 à 20 mm.|78
Ostéoblastome traitement|Exérèse chirurgicale souvent préférée.|78
Enchondrome os plat|Toujours suspect.|81
Enchondrome proximal tubulaire|Évoquer chondrosarcome.|84
Chondroblastome localisation|Épiphysaire.|86
Chondroblastome traitement|Curetage et comblement.|86
Risque chondroblastome|Récidive si curetage insuffisant.|86
Exostose indication|Gêne de volume ou conflit tendineux.|91
Fibrome chondromyxoïde cortex|Souffle sans nécessairement rompre.|93
Fibrome chondromyxoïde geste|Curetage avec étai si besoin.|93
Kyste essentiel enfant|Rarement chirurgie si typique.|96
TCG risque récidive|Jusqu’à 35 %.|98
Cause fréquente de récidive TCG|Exérèse initiale incomplète.|101
Où traiter une TCG|Centre expérimenté.|102
Information TCG|Risque récidive et métastase pulmonaire bénigne.|103
Imagerie clé TCG|IRM.|105
Pourquoi IRM TCG|Parties molles et os sous-chondral.|105
TCG peu agressive douleur|Peu douloureuse.|106
TCG peu agressive cortex|Sans effraction corticale.|106
TCG peu agressive geste|Curetage-comblement minutieux.|106
TCG os sous-chondral >7 mm|Greffons compactés possibles.|107
TCG os sous-chondral <7 mm|Éviter ciment seul.|108
TCG agressive stratégie|Approche proche des tumeurs malignes.|109
Récidive TCG conservatrice|Ne la contre-indique pas.|110
Kyste anévrysmal traitement|Curetage-comblement.|112
Risque du kyste anévrysmal|Récidive élevée.|113
Adjuvants du kyste anévrysmal|Phénol ou cryothérapie.|113
Kyste volumineux proximal|Embolisation préopératoire possible.|113
Fibrome non ossifiant biopsie|Inutile si aspect typique.|115
Fibrome non ossifiant localisation|Métaphyse en épargnant épiphyse.|118
Fibrome non ossifiant fragilité|Exceptionnelle.|118
Dysplasie monostotique|Souvent découverte fortuite.|119
Dysplasie monostotique chirurgie|Pas d’exérèse systématique.|119
Dysplasie fibreuse décision|Localisation et atteinte corticale.|119
Dysplasie polyostotique lésions|Souvent hémiméliques et déformantes.|123
Complication dysplasie polyostotique|Fissure douloureuse ou fracture.|123
But global du chirurgien|Stratégie diagnostique, oncologique et mécanique.|127
Quand préférer surveillance|Lésion certaine, stable et peu agressive.|20
Quand biopsier|Doute radioclinique persistant.|12
Piège du curetage|Le considérer comme geste mineur.|40
Critère de bonne fenêtre|Accès à toute la cavité.|41
Rôle du comblement|Restaurer volume et soutien osseux.|47
Rôle du renfort|Prévenir fracture sur cortex insuffisant.|49
Pourquoi protéger sous-chondral|Préserver le soutien du cartilage.|50
Risques spécifiques TCG|Récidive, parties molles, sous-chondral.|105
Surveillance après curetage|Recherche de récidive radioclinique.|101
Condition chirurgie bénigne|Diagnostic et planification corrects.|127
Exérèse extralésionnelle bénigne|Rare.|9
Résection sessile petite base|Sans ostéosynthèse si <15 mm.|59
But d’une biopsie représentative|Établir diagnostic sans compromettre stratégie.|16
Pourquoi adjuvant ne suffit pas|Il ne corrige pas un curetage incomplet.|45
Pourquoi TCG récidive|Limites tumorales imprécises.|101
Pourquoi imager avant renfort|Évaluer cortex et zone de fragilité.|32
Indication traitement conservateur|Grade 1 stable après certitude diagnostique.|20
Valeur d’un critère isolé de biopsie|Aucune valeur absolue.|15
Objet du consentement TCG|Risque de récidive et de complications.|103`
    .split("\n")
    .map((x) => {
      let [a, b, c] = x.split("|");
      return { recto: a, verso: b, source: [+c] };
    });
if (raw.length < 100) throw Error(raw.length);
const q = (e, c, w, s) => ({
    enonce: e,
    items: [c, ...w].map((enonce, i) => ({
      lettre: "ABCDE"[i],
      enonce,
      is_correct: i === 0,
      justification: i
        ? "Proposition incompatible avec le corpus."
        : `Conforme au bloc ${s} du corpus Orthopédie.`,
    })),
    correction_generale: `Réponse fondée sur le bloc ${s}.`,
  }),
  mk = (i) =>
    q(
      `Dans la décision devant une tumeur bénigne, ${raw[i].recto.charAt(0).toLowerCase()}${raw[i].recto.slice(1)}`,
      raw[i].verso,
      [
        raw[(i + 21) % raw.length].verso,
        raw[(i + 43) % raw.length].verso,
        raw[(i + 65) % raw.length].verso,
        raw[(i + 87) % raw.length].verso,
      ],
      raw[i].source[0],
    );
const qcm = Array.from({ length: 8 }, (_, i) => ({
  label: `QCM ${i + 1} · Tumeurs bénignes épiphysométaphysaires`,
  vignette: "",
  questions: Array.from({ length: 5 }, (_, j) => mk(i * 5 + j)),
}));
const vs = [
  "Une femme de 24 ans consulte pour une lésion épiphysaire douloureuse avec fragilité sous-chondrale. L’imagerie et la biopsie sont discutées avant curetage. Au suivi postopératoire, douleur, stabilité et radiographies sont contrôlées.",
  "Un adolescent présente un ostéome ostéoïde douloureux. Le nidus est repéré avant une exérèse ciblée. Au suivi, la disparition des douleurs et la cicatrisation osseuse sont vérifiées.",
  "Un patient a une TCG confinée. L’IRM prépare un curetage-comblement. Au suivi, une récidive radiologique et le soutien sous-chondral sont recherchés.",
  "Une adolescente présente une TCG agressive avec extension des parties molles. La stratégie est organisée dans un centre expert. Au suivi, la reconstruction et l’évolution locale sont évaluées.",
  "Un enfant a un kyste anévrysmal volumineux. Une embolisation puis un curetage sont discutés. Au suivi, le risque de récidive et de fracture est contrôlé.",
  "Une patiente a un chondroblastome épiphysaire. Un curetage-comblement est programmé. Au suivi, l’articulation, le comblement et la récidive sont évalués.",
  "Un adolescent a un fibrome non ossifiant typique. La surveillance est privilégiée. Au suivi, l’absence de fragilité et l’évolution radiologique sont vérifiées.",
  "Un jeune adulte présente une dysplasie fibreuse avec douleur et cortex fragilisé. Un renfort est discuté. Au suivi, consolidation, fracture et fonction sont contrôlées.",
];
const dp = vs.map((v, i) => ({
  label: `DP ${i + 1} · Décision et suivi tumoral`,
  vignette: `<p><strong>Patient ou patiente pris(e) en charge dans le service d’orthopédie :</strong> ${v}</p><p>Le dossier est revu en réunion avec confrontation clinique, radiographique et, si besoin, histologique. La stratégie cherche à préserver l’articulation tout en prévenant la fragilité osseuse. Le patient et ses proches reçoivent une information sur les options, les complications et les contrôles programmés.</p>`,
  questions: Array.from({ length: 7 }, (_, j) => {
    let z = mk(40 + i * 7 + j);
    if (j) z.enonce = "Nouvel élément : " + z.enonce;
    return z;
  }),
}));
writeFileSync(
  join(o, "chapter.json"),
  JSON.stringify(
    {
      title: "Tumeurs bénignes épiphysométaphysaires",
      provenance: { extract: "extract.json", sourceOnly: true },
      flashcards: raw,
      series: [...qcm, ...dp],
    },
    null,
    2,
  ),
);
