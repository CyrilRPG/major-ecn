/**
 * Cours 72 — reconstruction intégrale de la fiche.
 *
 * Le précédent contenu était rattaché à tort à une reconstruction cartilagineuse.
 * Cette fiche est donc réécrite depuis le DOCX canonique et ses images extraites :
 * aucun fragment de l'ancienne fiche, ni de ses snapshots, n'est réemployé.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { compileFicheModel, validateFicheModel } from './lib/orthopedie-fiche.mjs';

const courseId = 'c9e3194a-11d7-4fc7-8094-c1c968852316';
const title = 'Matériel d’ostéosynthèse : vis et plaques';
const root = resolve('.');
const chapterDir = resolve('../.corpus-orthopedie/materiel-d-osteosynthese-vis-et-plaques');
const outputDir = join(chapterDir, 'delivery', 'reconstruction-source-only-2026-08-11');
const qaDir = join(outputDir, 'qa');
mkdirSync(qaDir, { recursive: true });

const row = (concept, bullets, image) => ({ concept, bullets, ...(image ? { image } : {}) });
const section = (title, rows) => ({ title, rows });
const image = (index, caption, size = 'small') => ({
  path: `img/img_${String(index).padStart(3, '0')}.png`, position: 'after', size, caption,
  sourceCaption: JSON.parse(readFileSync(join(chapterDir, 'extract.json'), 'utf8')).images.find((entry) => entry.index === index)?.legende || '',
});

const fiche = {
  title,
  year: '2025-2026',
  coverSubtitle: 'Principes mécaniques, choix du montage et pose raisonnée',
  // Chaque ensemble de notions ci-dessous provient des blocs correspondants du DOCX canonique.
  sourceBlocks: [2, 4, 6, 9, 11, 13, 15, 20, 22, 26, 28, 31, 33, 36, 39, 42, 46, 49, 55, 57, 61, 64, 67, 73, 75, 79, 83, 91, 95, 101],
  parts: [
    {
      title: 'Vis : fonction et choix',
      sections: [
        section('Obtenir une prise osseuse fiable', [
          row('Rôle mécanique', ['Une vis peut rapprocher deux fragments et créer une compression interfragmentaire.', 'Son efficacité dépend de la qualité de l’os, du trajet de forage, du filetage et du contrôle de réduction.'], image(1, 'Préparation d’une vis de traction', 'large')),
          row('Forage et taraudage', ['La mèche est choisie légèrement plus fine que le diamètre extérieur de la vis afin de préserver la prise du filetage.', 'Une mèche émoussée échauffe l’os : l’instrumentation doit rester performante et utilisée sans contrainte excessive.']),
          row('Vis de traction', ['Pour comprimer un trait simple, la prise est recherchée dans le fragment opposé tandis que le fragment proche laisse coulisser la tige.', 'La compression ne remplace jamais une réduction anatomique et un contrôle radiographique du trajet.'])
        ]),
        section('Adapter le filetage au segment osseux', [
          row('Vis corticale', ['Son pas fin assure une prise dans l’os cortical.', 'Elle est fréquemment utilisée pour fixer une plaque contre la diaphyse.']),
          row('Vis spongieuse', ['Son filetage plus profond améliore l’ancrage dans l’os spongieux.', 'Elle est volontiers utilisée comme vis de traction dans les régions épiphysométaphysaires.'], image(3, 'Vis spongieuse')),
          row('Vis canulée', ['Son canal central permet un positionnement sur broche-guide et facilite le contrôle du trajet.', 'La broche sert également au repérage et à la mesure avant l’introduction de la vis.'])
        ])
      ]
    },
    {
      title: 'Vis spéciales et verrouillage',
      sections: [
        section('Vis enfouies et compression contrôlée', [
          row('Vis à double pas', ['Deux filetages de pas différents créent une compression lors de l’avancement de la vis.', 'Leur tête enfouie les rend utiles dans les petits os et les zones périarticulaires.']),
          row('Vis conique', ['La variation progressive du pas permet un effet de compression similaire à celui d’une vis à double pas.', 'Son insertion s’accompagne d’un taraudage progressif.']),
          row('Vis à compression sans tête', ['La compression est obtenue avant que la tête ne soit enfouie sous la surface osseuse.', 'Elles sont destinées aux sites où une tête saillante gênerait l’articulation ou les tendons.'])
        ]),
        section('Principe des vis verrouillées', [
          row('Blocage vis-plaque', ['La tête filetée se verrouille dans un trou prévu à cet effet.', 'La plaque et les vis constituent alors un implant à angle fixe plutôt qu’un simple appui contre l’os.'], image(10, 'Plaque à vis verrouillées', 'large')),
          row('Intérêt clinique', ['Le verrouillage est particulièrement utile dans l’os porotique et les fractures complexes.', 'Il limite la dépendance à la compression plaque-os et permet une stabilité adaptée au montage choisi.']),
          row('Précautions de pose', ['Le forage et l’axe de la vis doivent correspondre au système utilisé.', 'Un verrouillage imparfait, une vis trop courte ou une réduction insuffisante exposent à une perte de stabilité.'])
        ])
      ]
    },
    {
      title: 'Plaques : formes et mécanismes',
      sections: [
        section('Lire la géométrie de la plaque', [
          row('Plaque de neutralisation', ['Elle protège une réduction obtenue notamment par une vis de traction.', 'Elle absorbe les forces de torsion, de flexion et de cisaillement sans créer elle-même la compression du trait.']),
          row('Trou ovale de compression', ['La position excentrée de la vis dans un trou adapté permet de faire glisser la plaque et de comprimer le foyer.', 'Le guide-mèche et le sens d’excentration appartiennent à la technique du système utilisé.'], image(9, 'Compression dynamique par plaque', 'large')),
          row('Tendeur de plaque', ['Il met la plaque en tension et permet une compression axiale du foyer lorsque l’indication est une stabilité absolue.', 'La compression est contrôlée avant le serrage définitif des vis.'], image(8, 'Tendeur de plaque'))
        ]),
        section('Choisir la plaque pour son rôle', [
          row('Plaque de compression', ['Elle s’adresse aux traits simples réductibles où une compression interfragmentaire est recherchée.', 'Elle nécessite une réduction précise et un montage capable de maintenir cette compression.']),
          row('Plaque de pontage', ['Elle relie les segments principaux sans disséquer ni réduire chaque fragment de comminution.', 'La longueur de plaque et l’espacement des vis répartissent les contraintes sur le montage.'], image(16, 'Plaque longue de pontage', 'large')),
          row('Plaque anatomique', ['Sa forme est adaptée à une région osseuse donnée pour limiter le cintrage.', 'Elle ne dispense pas de vérifier l’axe, la rotation, la longueur et l’absence de conflit articulaire.'])
        ])
      ]
    },
    {
      title: 'Stratégie du montage et sécurité',
      sections: [
        section('Choisir le niveau de stabilité', [
          row('Stabilité absolue', ['Elle associe réduction anatomique et compression interfragmentaire pour supprimer la mobilité du foyer.', 'La consolidation attendue est directe, sans cal périosté visible.'], image(15, 'Exemple de stabilité absolue', 'large')),
          row('Stabilité relative', ['Elle est indiquée lorsque la comminution rend une réduction fragment par fragment délétère.', 'Le foyer est respecté ; la consolidation se fait alors avec formation d’un cal.']),
          row('Synthèse biologique', ['Un abord limité et une plaque à distance de l’os préservent l’hématome fracturaire et la vascularisation périostée.', 'La stabilité recherchée doit être suffisante sans transformer la plaque en implant surchargé.'])
        ]),
        section('Prévenir les échecs mécaniques', [
          row('Réduction avant fixation', ['L’implant maintient une réduction : il ne corrige pas durablement un défaut d’axe, de rotation ou de longueur.', 'Les contrôles peropératoires précèdent la fermeture et documentent la position des vis.']),
          row('Répartition des vis', ['Une plaque longue avec vis espacées est préférée dans un montage de pontage.', 'La zone de comminution reste dépourvue de vis afin de préserver la biologie du foyer et d’éviter un point de contrainte.']),
          row('Complications à rechercher', ['Une douleur persistante, une perte de réduction ou une rupture de matériel font rechercher une surcharge mécanique, une infection ou une absence de consolidation.', 'La surveillance associe examen clinique, radiographies et adaptation progressive de la rééducation.'])
        ])
      ]
    }
  ],
  synthesis: {
    tables: [
      { title: 'Choisir la vis', headers: ['Dispositif', 'Usage principal', 'Point de vigilance'], rows: [
        ['Corticale', 'Fixation de plaque dans la diaphyse', 'Prise dans l’os cortical'],
        ['Spongieuse', 'Compression dans l’os spongieux', 'Filetage profond, souvent partiel'],
        ['Canulée', 'Pose guidée sur broche', 'Contrôler le trajet avant vissage'],
        ['Sans tête / double pas', 'Compression périarticulaire', 'Éviter toute saillie articulaire']
      ] },
      { title: 'Choisir le montage', headers: ['Situation', 'Principe', 'Objectif'], rows: [
        ['Trait simple réductible', 'Compression ou neutralisation', 'Réduction anatomique stable'],
        ['Trait simple après vis de traction', 'Plaque de neutralisation', 'Protéger la compression'],
        ['Fracture comminutive', 'Plaque de pontage longue', 'Préserver la vascularisation'],
        ['Os porotique / fracture complexe', 'Plaque à vis verrouillées', 'Stabilité à angle fixe']
      ] },
      { title: 'Points de contrôle', headers: ['Temps', 'À vérifier', 'Risque évité'], rows: [
        ['Avant fixation', 'Axe, longueur, rotation, congruence', 'Cal vicieux ou conflit articulaire'],
        ['Pendant le vissage', 'Forage, longueur et trajet des vis', 'Effraction ou mauvaise prise'],
        ['Après montage', 'Réduction et stabilité radiologique', 'Perte secondaire de réduction'],
        ['Suivi', 'Douleur, cicatrice, consolidation, matériel', 'Infection ou défaillance mécanique']
      ] }
    ],
    keyPoints: [
      'Une vis de traction crée une compression seulement si le trait a été correctement réduit.',
      'La vis corticale est adaptée à l’os cortical ; la vis spongieuse à l’os spongieux.',
      'Une vis canulée se pose sur broche-guide et facilite le contrôle du trajet.',
      'Une plaque verrouillée forme avec ses vis un montage à angle fixe.',
      'La neutralisation protège une vis de traction ; la compression s’adresse à un trait simple réductible.',
      'Le pontage respecte la comminution, l’hématome et la vascularisation du foyer.',
      'Une plaque longue et des vis espacées diminuent les concentrations de contraintes dans un pontage.'
    ],
    eclair: [
      'Vis de traction : réduction puis compression interfragmentaire.',
      'Corticale = pas fin ; spongieuse = filetage profond ; canulée = broche-guide.',
      'Sans tête et double pas : compression enfouie près d’une articulation.',
      'Vis verrouillée : implant à angle fixe avec la plaque.',
      'Neutralisation : protège la réduction ; compression : trait simple ; pontage : comminution.',
      'Pontage : plaque longue, vis espacées, aucune vis dans la zone de comminution.',
      'Toujours contrôler axe, rotation, longueur, congruence et position des vis.'
    ]
  }
};

const validation = validateFicheModel(fiche, chapterDir);
if (validation.errors.length) throw new Error(`Fiche invalide :\n- ${validation.errors.join('\n- ')}`);
const rawBody = compileFicheModel(fiche, chapterDir);
const dataUri = (file) => `data:image/png;base64,${readFileSync(file).toString('base64')}`;
const logo = dataUri(join(root, 'public', 'major-ecn-logo.png'));
const watermark = dataUri(resolve('../major-ecn-fiche/assets/logo_watermark.png'));
const body = rawBody
  .replace(/__IMGFILE:([\s\S]*?)__/g, (_match, relative) => dataUri(join(chapterDir, relative)))
  .replaceAll('__LOGO__', logo)
  .replaceAll('__WATERMARK__', watermark);

writeFileSync(join(outputDir, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'fiche.body.html'), body, 'utf8');
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify({ courseId, title, sourceOnly: true, sourceDocx: 'Matériel d’ostéosynthèse - vis et plaques.docx', validation }, null, 2)}\n`, 'utf8');

config({ path: join(root, '.env.local') });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: course, error: courseError } = await db.from('cours').select('id,titre').eq('id', courseId).single();
if (courseError) throw courseError;
if (course.titre !== title) throw new Error(`Titre DB inattendu : ${course.titre}`);
const { data: currentFiche, error: currentFicheError } = await db.from('fiches').select('id,cours_id,titre,content_html,pages,storage_path,content_format').eq('cours_id', courseId).order('order_index').limit(1).single();
if (currentFicheError) throw currentFicheError;
// Sauvegarde de récupération, strictement séparée du contenu reconstruit.
writeFileSync(join(outputDir, 'published-before-reconstruction.snapshot.json'), `${JSON.stringify({ course, fiche: currentFiche }, null, 2)}\n`, 'utf8');

const css = readFileSync(join(root, 'src/lib/fiches/charte-styles.css'), 'utf8')
  .replace(/url\("fonts\/([^"]+)"\)/g, `url("${pathToFileURL(join(root, 'public/fonts/fiches')).href}/$1")`);
const fullHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;
writeFileSync(join(outputDir, 'fiche.html'), fullHtml, 'utf8');

const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(outputDir, 'fiche.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((img) => img.decode?.().catch(() => undefined))); });
const metrics = await page.evaluate(() => ({
  figures: document.querySelectorAll('figure.ft-figure').length,
  brokenImages: [...document.images].filter((img) => !img.naturalWidth || !img.naturalHeight).length,
  title: document.querySelector('.cover-title')?.textContent?.trim(),
  textLength: document.body.innerText.replace(/\s+/g, ' ').trim().length,
  tables: document.querySelectorAll('table').length,
}));
if (metrics.brokenImages || metrics.title?.replace(/\u00a0/g, ' ') !== title || metrics.figures !== validation.figureCount) throw new Error(`QA HTML invalide : ${JSON.stringify(metrics)}`);
const pdf = await page.pdf({ path: join(outputDir, 'fiche.pdf'), format: 'A4', printBackground: true, margin: { top: '24mm', right: '18mm', bottom: '22mm', left: '18mm' } });
await page.screenshot({ path: join(qaDir, 'page-full.png'), fullPage: true });
await browser.close();
const pages = (await PDFDocument.load(pdf)).getPageCount();
writeFileSync(join(qaDir, 'qa.json'), `${JSON.stringify({ courseId, title, pages, ...metrics }, null, 2)}\n`, 'utf8');

const pdfPath = `${courseId}/fiche.pdf`;
const { error: uploadError } = await db.storage.from('fiches').upload(pdfPath, Buffer.from(pdf), { contentType: 'application/pdf', upsert: true });
if (uploadError) throw uploadError;
const { error: updateError } = await db.from('fiches').update({ titre: title, content_html: body, content_format: 'html', storage_path: pdfPath, pages }).eq('id', currentFiche.id);
if (updateError) throw updateError;
const { data: published, error: readbackError } = await db.from('fiches').select('titre,content_html,pages,storage_path').eq('id', currentFiche.id).single();
if (readbackError) throw readbackError;
if (published.titre !== title || published.content_html !== body || published.pages !== pages || published.storage_path !== pdfPath) throw new Error('Lecture de contrôle après publication invalide.');
writeFileSync(join(outputDir, 'publish-readback.json'), `${JSON.stringify({ courseId, title, ficheId: currentFiche.id, pages, figures: metrics.figures, brokenImages: metrics.brokenImages, storagePath: pdfPath }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courseId, title, pages, figures: metrics.figures, brokenImages: metrics.brokenImages, outputDir }));
