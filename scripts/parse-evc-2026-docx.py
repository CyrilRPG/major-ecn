#!/usr/bin/env python3
"""Build a deterministic, lossless-as-text import manifest for the EVC 2026 DOCX files."""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn

INCLUDED = {
    "Médecine interne": "Médecine interne polyvalente",
    "Hématologie": "Hématologie",
    "Néphrologie": "Néphrologie",
    "Rhumatologie": "Rhumatologie",
    "Infectiologie": "Infectiologie",
    "Thérapeutique": "Pharmacologie",
    "Pneumologie": "Pneumologie",
}
IGNORED = {"Radiologie", "Médecine générale et situations fréquentes"}

ANSWER_RE = re.compile(r"^\s*(?:R[ée]ponse(?:\(s\)|s)?(?:\s+attendue)?|Correction)\b", re.I)
QROC_RE = re.compile(r"question\s+(?:r[ée]dactionnelle|à\s+r[ée]ponse\s+pr[ée]cis[ée]e)", re.I)
OPTION_RE = re.compile(r"^\s*(?:[A-K][.)]|[•●▪◦])\s+", re.I)
CORRECT_RE = re.compile(
    r"(?:R[ée]ponse(?:\(s\)|s)?(?:\s+attendue)?|Correction)\s*[:\-]\s*([A-K](?:\s*(?:,|;|/|et|à|&|-|–|—)\s*[A-K])*)\b", re.I
)


def norm(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split()).strip()


def htext(paragraph) -> str:
    return norm(paragraph.text)


def is_h1(paragraph) -> bool:
    return paragraph.style and paragraph.style.name.lower().startswith("heading 1")


def is_h2(paragraph) -> bool:
    return paragraph.style and paragraph.style.name.lower().startswith("heading 2")


def paragraph_images(paragraph, doc_part, assets_dir: Path, seen: dict[str, str]) -> list[str]:
    paths: list[str] = []
    for blip in paragraph._p.xpath('.//a:blip'):
        rid = blip.get(qn('r:embed'))
        if not rid:
            continue
        part = doc_part.related_parts.get(rid)
        if not part:
            continue
        blob = part.blob
        suffix = Path(str(part.partname)).suffix.lower() or ".bin"
        digest = hashlib.sha256(blob).hexdigest()
        name = seen.get(digest)
        if not name:
            name = f"{digest}{suffix}"
            (assets_dir / name).write_bytes(blob)
            seen[digest] = name
        paths.append(name)
    return paths


def fragment(paragraph, image_names: list[str]) -> str:
    text = html.escape(paragraph.text or "")
    images = "".join(f"<img src=\"{{{{IMG:{name}}}}}\" alt=\"Illustration source\" />" for name in image_names)
    return text + images


def join_fragments(parts: list[str]) -> str:
    return "<br>".join(p for p in parts if p).strip()


def is_option(paragraph, value: str) -> bool:
    style = (paragraph.style.name if paragraph.style else "").lower()
    return "list" in style or bool(OPTION_RE.match(value))


def letters_from_answer(parts: list[tuple[str, str]]) -> set[str]:
    label_re = r"\b(?:R[ée]ponse(?:\(s\)|s)?(?:\s+(?:attendue|correcte|exacte(?:s)?))?|Correction)\b"
    for text, _ in parts:
        if re.search(label_re, text, re.I):
            marker = re.split(label_re, text, maxsplit=1, flags=re.I)[-1]
            marker = marker.splitlines()[0].split(".")[0]
            letters = set(re.findall(r"\b[A-K]\b", marker.upper()))
            if letters:
                return letters
    return set()


def parse_document(source: Path, part_label: str, assets_dir: Path, seen: dict[str, str]) -> list[dict]:
    doc = Document(source)
    rows = []
    current_specialty = None
    paragraph_data = []
    for p in doc.paragraphs:
        image_names = paragraph_images(p, doc.part, assets_dir, seen)
        paragraph_data.append({"p": p, "text": htext(p), "html": fragment(p, image_names), "images": image_names})

    h2_indexes = [i for i, row in enumerate(paragraph_data) if is_h2(row["p"])]
    specialty_at: list[str | None] = []
    active_specialty = None
    for row in paragraph_data:
        if is_h1(row["p"]):
            active_specialty = row["text"]
        specialty_at.append(active_specialty)
    for pos, start in enumerate(h2_indexes):
        end = h2_indexes[pos + 1] if pos + 1 < len(h2_indexes) else len(paragraph_data)
        current_specialty = specialty_at[start]
        if current_specialty not in INCLUDED:
            continue

        # A topic line immediately preceding the heading belongs to this question.
        leading = []
        cursor = start - 1
        while cursor >= 0 and not paragraph_data[cursor]["text"] and not paragraph_data[cursor]["images"]:
            cursor -= 1
        if cursor >= 0:
            prev = paragraph_data[cursor]
            is_topic = (
                len(prev["text"]) <= 180
                and not ANSWER_RE.match(prev["text"])
                and "?" not in prev["text"]
                and not re.search(r"[.:]", prev["text"])
            )
            if not is_h1(prev["p"]) and not is_h2(prev["p"]) and is_topic and (prev["text"] or prev["images"]):
                leading.append(prev)

        body = paragraph_data[start + 1:end]
        # Do not consume a following college title if a malformed document omits an H2.
        body = [row for row in body if not is_h1(row["p"])]
        answer_at = next((i for i, row in enumerate(body) if ANSWER_RE.match(row["text"])), len(body))
        before, after = body[:answer_at], body[answer_at:]
        title = paragraph_data[start]["text"]
        kind = "qroc" if QROC_RE.search(title) else "qcm"
        pre = leading + before
        source_ref = f"{source.name} — {current_specialty}"

        if kind == "qroc":
            answer_html = join_fragments([row["html"] for row in after])
            rows.append({
                "part": part_label,
                "specialty": current_specialty,
                "course_name": INCLUDED[current_specialty],
                "format": "qroc",
                "source_ref": source_ref,
                "enonce": join_fragments([row["html"] for row in pre]),
                "reponse_attendue": answer_html,
                "correction_generale": answer_html,
                "items": [],
            })
            continue

        option_rows = [(row, row["text"]) for row in before if is_option(row["p"], row["text"])]
        # A number of source QCMs use plain Normal paragraphs for A/B/C choices.
        # When a keyed answer exists, the rows following the final question prompt
        # are necessarily the choices and must not be folded into the statement.
        if len(option_rows) < 2 and after:
            prompt_positions = [i for i, row in enumerate(before) if "?" in row["text"]]
            if prompt_positions:
                candidate_rows = [(row, row["text"]) for row in before[prompt_positions[-1] + 1:] if row["text"] or row["images"]]
                if len(candidate_rows) >= 2:
                    option_rows = candidate_rows
        # A heading labelled QCM without a keyed choice set is in fact an open
        # response in these documents (for example, "argumentez"). Preserve it
        # as QROC rather than publishing a non-functional multiple-choice item.
        if len(option_rows) < 2 or not after:
            prompt_positions = [i for i, row in enumerate(before) if "?" in row["text"]]
            split_at = prompt_positions[-1] + 1 if prompt_positions else len(before)
            open_statement = leading + before[:split_at]
            open_answer = after or before[split_at:]
            answer_html = join_fragments([row["html"] for row in open_answer])
            rows.append({
                "part": part_label,
                "specialty": current_specialty,
                "course_name": INCLUDED[current_specialty],
                "format": "qroc",
                "source_ref": source_ref,
                "enonce": join_fragments([row["html"] for row in open_statement]),
                "reponse_attendue": answer_html,
                "correction_generale": answer_html,
                "items": [],
            })
            continue
        # Only treat list paragraphs as answer choices when there are at least two of them.
        option_ids = {id(row) for row, _ in option_rows} if len(option_rows) >= 2 else set()
        statement = leading + [row for row in before if id(row) not in option_ids]
        correct = letters_from_answer([(row["text"], row["html"]) for row in after])
        items = []
        for ordinal, (row, value) in enumerate(option_rows):
            letter_match = re.match(r"^\s*([A-K])[.)]\s*", value, re.I)
            letter = letter_match.group(1).upper() if letter_match else chr(ord("A") + ordinal)
            clean_html = row["html"]
            if letter_match:
                clean_html = re.sub(r"^\s*[A-K][.)]\s*", "", clean_html, flags=re.I)
            items.append({"enonce": clean_html, "is_correct": letter in correct})
        rows.append({
            "part": part_label,
            "specialty": current_specialty,
            "course_name": INCLUDED[current_specialty],
            "format": "qcm",
            "source_ref": source_ref,
            "enonce": join_fragments([row["html"] for row in statement]),
            "reponse_attendue": None,
            "correction_generale": join_fragments([row["html"] for row in after]),
            "items": items,
        })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--part1", required=True, type=Path)
    parser.add_argument("--part2", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    if args.out.exists():
        shutil.rmtree(args.out)
    assets_dir = args.out / "assets"
    assets_dir.mkdir(parents=True)
    seen: dict[str, str] = {}
    questions = parse_document(args.part1, "Partie 1", assets_dir, seen)
    questions += parse_document(args.part2, "Partie 2", assets_dir, seen)
    bad_qcm = [q for q in questions if q["format"] == "qcm" and (len(q["items"]) < 2 or not any(x["is_correct"] for x in q["items"]))]
    summary = {
        "questions": len(questions),
        "by_part_specialty_format": Counter(f"{q['part']} | {q['specialty']} | {q['format']}" for q in questions),
        "images": len(list(assets_dir.iterdir())),
        "qcm_without_valid_choices": len(bad_qcm),
        "ignored_specialties": sorted(IGNORED),
    }
    (args.out / "manifest.json").write_text(json.dumps({"questions": questions, "summary": summary}, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=lambda x: dict(x)))
    if bad_qcm:
        print("INVALID_QCM", json.dumps([{k: q[k] for k in ('part','specialty','source_ref','enonce')} for q in bad_qcm[:10]], ensure_ascii=False))


if __name__ == "__main__":
    main()
