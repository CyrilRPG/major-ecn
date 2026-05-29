#!/usr/bin/env python3
"""
Extraction structurée d'un fichier .DOC (OLE2) d'annale EVC – Médecine générale.

Pipeline :
1. Extraction binaire avec une plage large (0x09,0x0a,0x0d,0x20-0xff) pour
   capturer aussi les caractères « smart » (CP1252 : ’°…) qui cassaient les
   chunks dans la version précédente.
2. Décodage CP1252/latin-1, normalisation Unicode des apostrophes/tirets.
3. Filtrage des résidus binaires (bjbj, polices, MsoNormal, etc.).
4. Détection des marqueurs SUJET (toutes casses, formats PARTIE/CAS/Dossier
   acceptés).
5. Découpe en questions sur les marqueurs « Question N° N », « N) Lettre »,
   « N  Lettre » (digit + ≥2 espaces).
6. Normalisation finale : un texte par question, propre, sans \n résiduels.

Sortie : { year, type, title, sujets: [{ label, enonce, questions: [{ num, text }] }] }.
"""
import sys, re, json, unicodedata

# ---------- Décodage & nettoyage --------------------------------------------

# Mapping CP1252 → Unicode pour les caractères 0x80–0x9F (qui n'existent pas
# en latin-1). On les remplace avant le décodage.
CP1252_FIX = {
    0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…',
    0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š',
    0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž',
    0x91: '‘', 0x92: '’',  # ‘ ’
    0x93: '“', 0x94: '”',  # “ ”
    0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜', 0x99: '™',
    0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
}

def decode_bytes(b: bytes) -> str:
    """Décodage tolérant byte-par-byte avec mapping CP1252."""
    out = []
    for byte in b:
        if byte in CP1252_FIX:
            out.append(CP1252_FIX[byte])
        elif 0x20 <= byte <= 0x7e or byte in (0x09, 0x0a, 0x0d):
            out.append(chr(byte))
        elif 0xa0 <= byte <= 0xff:
            out.append(chr(byte))  # latin-1
        # sinon on saute (bruit binaire)
    return ''.join(out)

def normalize(s: str) -> str:
    """Apostrophes droites, tirets, espaces unicode."""
    s = s.replace('’', "'").replace('‘', "'")
    s = s.replace('“', '"').replace('”', '"')
    s = s.replace('–', '-').replace('—', '-')
    s = s.replace('…', '…')
    s = s.replace('\xa0', ' ').replace(' ', ' ').replace(' ', ' ')
    return s

# ---------- Filtrage des résidus binaires -----------------------------------

GARBAGE_RES = [
    re.compile(p, re.IGNORECASE) for p in [
        r'^bjbj+', r'^bd[A-Za-z]+\d', r'^_?PID_[A-Z]', r'^Microsoft\b',
        r'^Word\.', r'^Times New Roman', r'^Arial\b', r'^Calibri',
        r'^Symbol\b', r'^Wingdings', r'^Cambria', r'^Normal\.dot',
        r'^Root Entry', r'^WordDocument', r'^SummaryInformation',
        r'^DocumentSummary', r'^1Table', r'^Object Pool', r'^MsoNormal',
        r'^Espace Jean Monnet', r'^[A-Z]{2,}\d{1,3}\.\d{1,3}$',
        r'^Symbol-?\w*$',
    ]
]

def is_garbage(s: str) -> bool:
    if len(s) < 3:
        return True
    if re.match(r'^[\W_]{4,}$', s):
        return True
    for r in GARBAGE_RES:
        if r.search(s):
            return True
    # Trop de caractères non-imprimables ?
    bad = sum(1 for c in s if ord(c) > 127 and not c.isprintable())
    return bad > len(s) * 0.3

def strip_inline_garbage(s: str) -> str:
    """Supprime les artefacts qui apparaissent en plein milieu du texte."""
    s = re.sub(r'\bbjbj\w*\b', '', s)
    s = re.sub(r'\bMsoNormal\b', '', s)
    s = re.sub(r'\b[A-Z]{3,}\d+\.\d+\b', '', s)  # EVCF02.31 etc.
    s = re.sub(r'\bRgs\b', '', s)
    s = re.sub(r'\bTSVP\b', '', s)  # « Tournez s'il vous plaît »
    s = re.sub(r'\bSuite au verso\b', '', s, flags=re.IGNORECASE)
    # Codes de champ Word (FILENAME, PAGE, etc.) avec leurs options
    s = re.sub(r'\b(FILENAME|PAGE|DATE|TIME|TITLE|AUTHOR)\s*\\\\?[a-z]\s*[^\s]+\b', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\bFILENAME\b.*$', '', s)  # filets résiduels
    s = re.sub(r'\bMacro\s*Button\b.*?(?=[A-ZÉ]|$)', '', s, flags=re.IGNORECASE)
    return s

# ---------- Extraction & filtrage --------------------------------------------

def extract_raw(path: str) -> list[str]:
    with open(path, 'rb') as f:
        data = f.read()
    # Plage large : on prend 0x09,0x0a,0x0d et 0x20-0xff (smart quotes incl.).
    chunks = re.findall(rb'[\x09\x0a\x0d\x20-\xff]{4,}', data)
    return [normalize(decode_bytes(c)).strip() for c in chunks]

def filter_segments(segments: list[str]) -> list[str]:
    out, seen = [], set()
    for s in segments:
        s = s.strip()
        if is_garbage(s):
            continue
        key = s.lower()[:200]
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    return out

# ---------- Marqueurs SUJET / QUESTION --------------------------------------

# SUJET — accepte SUJET, Sujet, Dossier, PARTIE, CAS (toutes casses).
# Préfixe permissif. Entre le mot-clé et le numéro on tolère N°/colon/o dans
# n'importe quel ordre : « Sujet 1 », « Sujet : 1 », « Sujet N° 1 »,
# « Sujet : N°1 », « CAS N°1 ».
SUJET_RE = re.compile(
    r'(?:^|[\s.;:!?\)])'
    r'(?:SUJET|Sujet|sujet|DOSSIER|Dossier|PARTIE|Partie|CAS)'
    r'[\s.:N°ºo]{0,10}(\d{1,2})\b'
)

# Format moderne : « Question N° N : » ou « Question N : ».
# Utilisé quand le sujet contient au moins un marqueur « Question N… »
# explicite — sinon faux positifs sur les chiffres en plein texte.
QUESTION_RE_EXPLICIT = re.compile(
    r'(?:^|[\s.;,])'
    r'(?:'
        # « Question N° N : » ou « Question N : »
        r'(?:[Qq][Uu][Ee][Ss][Tt][Ii][Oo][Nn]\s*(?:[NnMm]\s*[°ºo]?\s*)?(\d{1,2})\b\s*[:.]?\s*)'
        r'|'
        # « Question N°: » sans numéro (auto-numéroté)
        r'(?:[Qq][Uu][Ee][Ss][Tt][Ii][Oo][Nn]\s*[NnMm]\s*[°ºo]?\s*[:.])'
    r')'
)

# Format historique — couvre 2009 → 2015 :
#   • « 1°) Lettre… »  (digit + ° + closing-paren)
#   • « 1°  Lettre… »  (digit + ° + espaces + capitale)
#   • « 1 -  Lettre… » (digit + tiret + espaces + capitale)
#   • « 1) Lettre… »   (digit + closing-paren)
#   • « 1  Lettre… »   (digit + ≥2 espaces + capitale)
QUESTION_RE_LEGACY = re.compile(
    r'(?:^|[\s.;,])'
    r'(?:'
        # digit + ° + ) OU - OU \s+ + Cap
        r'(?:(\d{1,2})\s*°\s*[)\-]?\s*(?=[A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇa-zà-ÿ]))'
        r'|'
        # digit + ) + Cap (sans ° devant)
        r'(?:(\d{1,2})\s*\)\s*(?=[A-ZÀ-Ÿa-zà-ÿ]))'
        r'|'
        # digit + - + espaces + Cap
        r'(?:(\d{1,2})\s+-\s+(?=[A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇ][a-zà-ÿ]))'
        r'|'
        # digit + ≥2 espaces + Cap_minuscule (verbe d'action typique)
        r'(?:(\d{1,2})\s{2,}(?=[A-ZÀ-ŸÉÈÊËÎÏÔÖÙÛÜÇ][a-zà-ÿ]))'
    r')'
)

# ---------- Normalisation finale --------------------------------------------

def norm_ws(s: str) -> str:
    """Collapse retours/tabs/résidus, supprime les ' \n ' injectés, recolle les
    apostrophes orphelines (« L \n examen » → « L'examen »)."""
    s = strip_inline_garbage(s)
    # Recolle les coupures du type « L \n suivi » → « L'suivi » (perte de
    # caractère smart-quote pendant l'extraction binaire).
    s = re.sub(r'\b([A-Za-z])\s*\n\s*([a-zàâäéèêëîïôöùûüç]{2,})', r"\1'\2", s)
    s = re.sub(r'[\r\n\t\x0b\x0c]+', ' ', s)
    s = re.sub(r'\s+', ' ', s)
    # Espace avant ponctuation française
    s = re.sub(r'\s+([,;.])', r'\1', s)
    s = re.sub(r'\s+([?!:])', r' \1', s)
    return s.strip()

# ---------- Parse principal --------------------------------------------------

def parse_structure(segments: list[str]) -> list[dict]:
    full = ' \n '.join(segments)

    # Suppression des en-têtes répétitifs
    full = re.sub(
        r'MEDECINE\s+GENERALE\s+Epreuve\s+de\s+v[ée]rification\s+des\s+connaissances\s+(?:fondamentales|pratiques)',
        '', full, flags=re.IGNORECASE,
    )
    full = re.sub(r"Traiter\s+l'?ensemble\s+des\s+\w+\s+sujets\.?", '', full, flags=re.IGNORECASE)
    full = re.sub(r'TOUS\s+LES\s+SUJETS\s+DOIVENT\s+ETRE\s+TRAITES', '', full, flags=re.IGNORECASE)
    full = re.sub(r'TOUTES\s+LES\s+PARTIES\s+SONT\s+A\s+TRAITER', '', full, flags=re.IGNORECASE)

    sujet_positions = [(m.start(), m.end(), int(m.group(1))) for m in SUJET_RE.finditer(full)]

    sujets = []
    if not sujet_positions:
        sujets.append(('Sujet 1', full.strip()))
    else:
        for i, (pos, end, num) in enumerate(sujet_positions):
            next_pos = sujet_positions[i + 1][0] if i + 1 < len(sujet_positions) else len(full)
            block = full[end:next_pos].strip()
            sujets.append((f'Sujet {num}', block))

    raw_sujets = []
    for label, body in sujets:
        # Détecte le format dominant : si le sujet contient au moins un
        # marqueur « Question N… » explicite (avec ou sans °, suivi d'un
        # numéro), on utilise UNIQUEMENT ce marqueur. Sinon on retombe sur
        # le format historique. Cela évite que « 2 Question » se fasse
        # capturer par le pattern « digit + espaces + Capitale ».
        has_explicit = re.search(r'[Qq][Uu][Ee][Ss][Tt][Ii][Oo][Nn]\s*[NnMm]?\s*[°ºo]?\s*\d', body) is not None
        marker_re = QUESTION_RE_EXPLICIT if has_explicit else QUESTION_RE_LEGACY
        valid_matches = list(marker_re.finditer(' ' + body))

        if valid_matches:
            enonce = body[:valid_matches[0].end() - 1 - len(valid_matches[0].group(0))].strip()
        else:
            enonce = body.strip()

        questions = []
        for i, m in enumerate(valid_matches):
            groups = [g for g in m.groups() if g]
            q_num = int(groups[0]) if groups else (i + 1)
            q_start = m.end() - 1
            q_end = valid_matches[i + 1].start() - 1 if i + 1 < len(valid_matches) else len(body)
            q_text = norm_ws(body[q_start:q_end])
            if not q_text or len(q_text) < 3:
                continue
            questions.append({'num': q_num, 'text': q_text})

        raw_sujets.append({
            'label': label,
            'enonce': norm_ws(enonce),
            'questions': questions,
        })

    # Filtre les en-têtes vides (PARTIE N sans contenu) et renumérote
    parsed_sujets = [s for s in raw_sujets if s['questions'] or len(s['enonce']) >= 60]
    for i, s in enumerate(parsed_sujets):
        s['label'] = f'Sujet {i + 1}'

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
