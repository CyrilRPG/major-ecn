#!/usr/bin/env python3
"""
Extraction structurée d'un fichier .DOC (OLE2) d'annale EVC.
Renvoie un JSON sur stdout : { year, type, title, sujets: [{ enonce, questions: [{ num, text, items: [text] }] }] }.

Heuristique : on extrait le texte avec strings, on nettoie agressivement,
on segmente sur les marqueurs "Sujet N" puis on extrait les questions
numérotées et leurs items en cherchant les bullets/réponses possibles.
"""
import sys, re, json

GARBAGE_PATTERNS = [
    r'^bjbj+', r'^bd[A-Za-z]+', r'^_?PID_[A-Z]+', r'^Microsoft.{0,20}', r'^Word.\d',
    r'^Times New Roman', r'^Arial', r'^Calibri', r'^Symbol', r'^Wingdings', r'^Cambria',
    r'^Normal\.dot', r'^Root Entry', r'^WordDocument', r'^SummaryInformation',
    r'^DocumentSummary', r'^1Table', r'^Object Pool', r'^MsoNormal',
    r'^Espace Jean Monnet', r'^Rgs', r'^Author', r'^Title', r'^Subject', r'^Comments',
    r'^[A-Z]{3,}\d+\.\d+$',  # codes type EVCF02, etc.
    r'^Symbol-?\w*$',
    r'^[\W_]{2,}$',          # ponctuations seules
    r'^\d+$',                 # nombres isolés
    r'^[a-z]\.[a-z]+$',      # ext fichiers
    r'^[\x80-\xff]+$',       # haut-ASCII seul (résidus binaires)
]

def clean(text):
    # Décodage des accents perdus dans le binaire
    repl = {
        '\x92': "'", '\x91': "'", '\x93': '"', '\x94': '"',
        '\x96': '–', '\x97': '—', '\x85': '...', '\xa0': ' ',
        '\x95': '·', '\x99': '™', '\x88': '^',
    }
    for k, v in repl.items():
        text = text.replace(k, v)
    return text

def is_garbage(s):
    if len(s) < 3: return True
    if re.match(r'^[\W_]{4,}$', s): return True
    for pat in GARBAGE_PATTERNS:
        if re.search(pat, s, re.IGNORECASE):
            return True
    # Trop de caractères non-imprimables ?
    bad = sum(1 for c in s if ord(c) > 127 and c not in 'éèêëàâäîïôöùûüçÉÈÊËÀÂÄÎÏÔÖÙÛÜÇæœÆŒ–—…«»°²³µ·×÷±€£$%')
    if bad > len(s) * 0.3:
        return True
    return False

def extract_raw(path):
    """Extrait via 'strings' tous les segments imprimables, concatène avec espace."""
    with open(path, 'rb') as f: data = f.read()
    chunks = re.findall(rb'[\x09\x0a\x0d\x20-\x7e\xc0-\xff]{4,}', data)
    return [clean(c.decode('latin-1', errors='ignore')).strip() for c in chunks]

def filter_segments(segments):
    """Garde uniquement les segments qui ressemblent à du contenu pédagogique."""
    out = []
    seen = set()
    for s in segments:
        s = s.strip()
        if is_garbage(s): continue
        # Doublon ?
        key = s.lower()[:200]
        if key in seen: continue
        seen.add(key)
        out.append(s)
    return out

# Marqueurs de structure
SUJET_RE = re.compile(r'(?:^|[\s.])(?:[Ss]ujet|Dossier|PARTIE|CAS)\s*(?:N[°o ]\s*)?:?\s*([0-9]+)\b')
# Question : 4 formats supportés
#   • "N) Lettre…" (format historique 2009-2015)
#   • "Question N° N …" (format 2016+, parfois lowercase, parfois sans numéro)
#   • "QUESTION N°:" sans numéro (2010, 2013) → auto-numérotation
#   • "N  Lettre…" (digit + 2 espaces + Lettre majuscule, format 2011 etc.)
QUESTION_RE = re.compile(
    r'(?:^|[\s.;,])'
    r'(?:'
        r'(?:[Qq][Uu][Ee][Ss][Tt][Ii][Oo][Nn]\s*(?:[NnMm][°o ]?\s*)?(\d{1,2})\b\s*[:.]?\s*)'  # groupe 1: avec numéro
        r'|'
        r'(?:[Qq][Uu][Ee][Ss][Tt][Ii][Oo][Nn]\s*[NnMm][°o ]?\s*[:.])'                          # SANS groupe: auto-numéroter
        r'|'
        r'(?:(\d{1,2})\s*\)\s*(?=[A-ZÀ-Ÿa-zà-ÿ]))'                                              # groupe 2
        r'|'
        r'(?:(\d{1,2})\s{2,}(?=[A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇ][a-zà-ÿ]))'                                # groupe 3
    r')'
)

def parse_structure(segments):
    """Parse les segments en sujets et questions."""
    # Joint tout en un seul long texte avec séparateurs préservés
    full = ' \n '.join(segments)

    # Remove header noise
    full = re.sub(r'MEDECINE\s+GENERALE\s+Epreuve\s+de\s+v[ée]rification\s+des\s+connaissances\s+(?:fondamentales|pratiques)', '', full, flags=re.IGNORECASE)
    full = re.sub(r'Traiter\s+l\'?ensemble\s+des\s+\w+\s+sujets\.?', '', full, flags=re.IGNORECASE)

    # Détecte les positions des "Sujet N"
    sujet_positions = [(m.start(), int(m.group(1))) for m in SUJET_RE.finditer(full)]

    sujets = []
    if not sujet_positions:
        # Pas de sujets explicites — un seul gros bloc
        sujets.append(('Sujet 1', full.strip()))
    else:
        # Découpe en blocs entre les marqueurs Sujet N
        for i, (pos, num) in enumerate(sujet_positions):
            start = pos
            end = sujet_positions[i + 1][0] if i + 1 < len(sujet_positions) else len(full)
            # Saute le marqueur "Sujet N"
            block_start = SUJET_RE.match(full[start:]).end() + start
            block = full[block_start:end].strip()
            sujets.append((f'Sujet {num}', block))

    # Pour chaque sujet, sépare l'énoncé (vignette) des questions
    parsed_sujets = []
    for label, body in sujets:
        # NE PAS collapser les espaces avant matching : le format "N  Lettre"
        # (digit + 2+ espaces + capitale) dépend des espaces multiples. On
        # collapsera après extraction, sur chaque fragment.

        valid_matches = list(QUESTION_RE.finditer(' ' + body))

        if valid_matches:
            enonce = body[:valid_matches[0].end() - 1 - len(valid_matches[0].group(0))].strip()
        else:
            enonce = body.strip()

        # Découpe les questions
        questions = []
        for i, m in enumerate(valid_matches):
            captured = m.group(1) or m.group(2) or m.group(3)
            q_num = int(captured) if captured else (i + 1)  # auto-numérote si absent
            q_start = m.end() - 1  # -1 pour l'espace ajouté
            q_end = valid_matches[i + 1].start() - 1 if i + 1 < len(valid_matches) else len(body)
            q_text = body[q_start:q_end].strip()
            if not q_text:
                continue

            # Sépare la question des réponses proposées (présentées comme un bloc).
            # On ne tente PAS de splitter les items un par un car l'extraction
            # binaire perd les retours-ligne — fragments mal coupés.
            main = q_text
            choices_text = ''
            if '?' in q_text:
                qpos = q_text.index('?')
                main = q_text[:qpos + 1].strip()
                choices_text = q_text[qpos + 1:].strip()

            questions.append({
                'num': q_num,
                'text': main.strip(),
                'choices_text': choices_text,
            })

        parsed_sujets.append({
            'label': label,
            'enonce': enonce.strip(),
            'questions': questions,
        })
    return parsed_sujets

def main():
    if len(sys.argv) < 4:
        print("Usage: parse_annale_doc.py <doc> <year> <type>", file=sys.stderr); sys.exit(1)
    path, year, typ = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    segments = filter_segments(extract_raw(path))
    sujets = parse_structure(segments)
    out = {
        'year': year,
        'type': typ,
        'title': 'Médecine générale',
        'sujets': sujets,
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
