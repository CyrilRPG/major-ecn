"""Prépare la génération des fiches cardio restantes.

Pour chaque cours cardio : découvre le PDF source dans le bucket `fiches`
(via l'API storage list), le télécharge, en extrait le texte (PyMuPDF) vers
/tmp/cardio_src/<order>_<slug>.txt, et écrit un manifeste
/tmp/cardio_manifest.json consommé par l'orchestrateur.
"""
from __future__ import annotations
import json, os, re, unicodedata, urllib.parse, urllib.request
from pathlib import Path

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SRC = Path("/tmp/cardio_src"); SRC.mkdir(parents=True, exist_ok=True)

# (order, cours_id, item, titre) — Athérome (1) déjà fait, on ne le régénère pas.
COURSES = [
    (2,  "2b780993-d5c4-45bb-b0ab-52c972dd7f73", "222", "Facteurs de risque cardiovasculaire et prévention"),
    (3,  "0a94ae25-e04b-4fbf-820e-95836bf18f6d", "223", "Dyslipidémies"),
    (4,  "4f64f867-3860-4eee-9803-4fe45ab87d06", "224", "Hypertension artérielle de l'adulte et de l'enfant"),
    (5,  "f3bf0f3d-8ceb-4c20-ba99-7481bdfd5d5c", "339", "Syndromes coronariens aigus"),
    (6,  "af3d4d13-54f9-45d1-af18-9ccbcdb2fe72", "230", "Douleur thoracique aiguë"),
    (7,  "8e1c3e1e-1da1-46c9-bc13-0a042e9944f6", "225", "Artériopathie de l'aorte, des artères viscérales et des membres inférieurs ; anévrismes"),
    (8,  "9058bac2-c983-464f-90f7-e0cba4aa584e", "233", "Valvulopathies"),
    (9,  "d9a70b54-bda5-4f15-aa36-4f1265936f42", "152", "Endocardite infectieuse"),
    (10, "f40e98f8-578d-4eb1-b9ee-5089fe5b1136", "153", "Surveillance des porteurs de valve et prothèses vasculaires"),
    (11, "da455956-07e0-452f-a696-6ea217520686", "238", "Souffle cardiaque chez l'enfant"),
    (12, "28c92a0b-c8b1-4b5c-8365-77ddfcaabf26", "342", "Malaises, perte de connaissance, crise comitiale chez l'adulte"),
    (13, "236e4833-c2e5-4833-8ebb-0ba6cb1fe79c", "232", "Fibrillation atriale"),
    (14, "aeaa697e-330c-45de-9fab-95e983fd3a43", "236", "Troubles de la conduction intracardiaque"),
    (15, "30e9ea28-43c3-41cf-b297-9a1996bf1428", "231", "Électrocardiogramme"),
    (16, "667c88cf-26a4-4b36-8ae9-9d5b3a8a02c6", "237", "Palpitations"),
    (17, "f86a7854-179a-4d34-9103-ea31299a403c", "203", "Dyspnée aiguë et chronique"),
    (18, "4cfad25b-8318-4b7b-8307-e386c44317b5", "234", "Insuffisance cardiaque de l'adulte"),
    (19, "76b34f37-dc92-4258-9fd8-5d1655d2b3cb", "226", "Thrombose veineuse profonde et embolie pulmonaire"),
    (20, "8b91e3c5-9f7c-41c7-910e-88eff84cd0fe", "235", "Péricardite aiguë"),
    (21, "7b56afdd-cde2-40cc-ad63-e48075f09cfd", "331", "Arrêt cardiocirculatoire"),
    (22, "04137868-823c-4b6c-bdf8-b183655990af", "330", "Prescription et surveillance des classes de médicaments les plus courantes chez l'adulte et chez l'enfant, hors anti-infectieux. Connaître les grands principes thérapeutiques"),
]

def _req(method, url, body=None, headers=None):
    h = {"Authorization": f"Bearer {KEY}", "apikey": KEY}
    if headers: h.update(headers)
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(r, timeout=120) as resp:
        return resp.read()

def find_source_pdf(cours_id: str) -> str:
    """Liste le dossier du cours et renvoie le PDF source (Cardiologie_Item…)."""
    url = f"{SUPABASE_URL}/storage/v1/object/list/fiches"
    body = json.dumps({"prefix": f"{cours_id}/", "limit": 100,
                        "sortBy": {"column": "created_at", "order": "asc"}}).encode()
    objs = json.loads(_req("POST", url, body, {"Content-Type": "application/json"}))
    pdfs = [o["name"] for o in objs if o["name"].lower().endswith(".pdf")]
    src = [n for n in pdfs if "regen-" not in n and "Item" in n] or pdfs
    if not src:
        raise RuntimeError(f"Pas de PDF source pour {cours_id}: {[o['name'] for o in objs]}")
    return f"{cours_id}/{src[0]}"

def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]

def extract_text(pdf: bytes) -> str:
    import fitz
    doc = fitz.open(stream=pdf, filetype="pdf")
    return "\n".join(f"\n--- PAGE {i+1} ---\n{p.get_text()}" for i, p in enumerate(doc))

manifest = []
for order, cid, item, titre in COURSES:
    sp = find_source_pdf(cid)
    pdf = _req("GET", f"{SUPABASE_URL}/storage/v1/object/fiches/{urllib.parse.quote(sp, safe='/')}")
    txt = extract_text(pdf)
    tp = SRC / f"{order:02d}_{slug(titre)}.txt"
    tp.write_text(txt, encoding="utf-8")
    out = SRC / f"{order:02d}_{slug(titre)}.json"
    manifest.append({"order": order, "cours_id": cid, "item": item, "titre": titre,
                     "txt": str(tp), "json": str(out), "chars": len(txt)})
    print(f"  {order:02d} item {item} · {len(txt):>6} chars · {titre[:50]}")

Path("/tmp/cardio_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nManifest: {len(manifest)} fiches → /tmp/cardio_manifest.json")
