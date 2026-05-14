#!/usr/bin/env python3
"""
parse_xlsx.py
Converts theoryexamar_data.arabic-1.xlsx → assets/questions.json
Run once before building the app.
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

def norm(text: str) -> str:
    """Normalize unicode and collapse whitespace for reliable comparison."""
    return unicodedata.normalize("NFKC", re.sub(r"\s+", " ", text or "")).strip()


try:
    import openpyxl
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl", "beautifulsoup4", "--break-system-packages", "-q"])
    import openpyxl
    from bs4 import BeautifulSoup

XLSX_PATH = Path(__file__).parent.parent.parent / "theoryexamar_data.arabic-1.xlsx"
OUT_PATH = Path(__file__).parent.parent / "assets" / "questions.json"

def extract_image_filename(question_id: int, image_url: str) -> str:
    """Map an image URL to a local WebP filename."""
    return f"q{question_id:04d}.webp"

def parse_answers(html: str, question_id: int):
    """
    Parse the 4 answer choices from the HTML blob.
    Returns (answers, correct_index, image_url, license_classes)
    """
    soup = BeautifulSoup(html, "html.parser")

    # Extract license classes from «X» tokens at the bottom
    full_text = soup.get_text()
    license_classes = re.findall(r"«([^»]+)»", full_text)
    license_classes = [c.strip() for c in license_classes if c.strip()]

    # Extract image URL
    img_tag = soup.find("img")
    image_url = img_tag["src"] if img_tag else None

    # Find the correct answer span anywhere in the HTML
    correct_span = soup.find("span", id=lambda x: x and x.startswith("correctAnswer"))
    correct_text = correct_span.get_text(strip=True) if correct_span else None

    # Extract answer <li> items
    answers = []
    correct_index = None
    li_items = soup.find_all("li")

    for i, li in enumerate(li_items):
        span = li.find("span")
        if not span:
            continue
        text = span.get_text(strip=True)
        is_correct = (correct_text is not None and norm(text) == norm(correct_text))
        if is_correct:
            correct_index = i
        answers.append({"text": text, "isCorrect": is_correct})

    return answers, correct_index, image_url, license_classes

def main():
    print(f"Loading: {XLSX_PATH}")
    if not XLSX_PATH.exists():
        print(f"ERROR: File not found at {XLSX_PATH}")
        sys.exit(1)

    wb = openpyxl.load_workbook(str(XLSX_PATH))
    ws = wb.active

    questions = []
    errors = []

    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        question_text = row[7]  # col 8: title2 = question
        html_content  = row[10] # col 11: description4 = answer HTML
        category      = row[12] # col 13: category
        source_date   = row[13] # col 14: pubDate

        if not question_text or not html_content:
            errors.append(f"Row {row_idx}: missing question or content")
            continue

        # Extract question number from text like "0555. هذه الإشارة..."
        # Handle edge cases like "1279( \"حسب..." (paren or quote before dot)
        q_num_match = re.match(r"^(\d+)", question_text.strip())
        if not q_num_match:
            errors.append(f"Row {row_idx}: could not parse question number from '{question_text[:40]}'")
            continue

        question_id = int(q_num_match.group(1))
        question_clean = question_text.strip()

        try:
            answers, correct_index, image_url, license_classes = parse_answers(html_content, question_id)
        except Exception as e:
            errors.append(f"Row {row_idx} (Q{question_id}): parse error: {e}")
            continue

        if correct_index is None:
            errors.append(f"Row {row_idx} (Q{question_id}): no correct answer found")
            continue

        if len(answers) != 4:
            errors.append(f"Row {row_idx} (Q{question_id}): expected 4 answers, got {len(answers)}")
            continue

        q = {
            "id": question_id,
            "question": question_clean,
            "category": category,
            "answers": answers,
            "correctIndex": correct_index,
            "licenseClasses": license_classes,
            "imageUrl": image_url,
            "imageFile": extract_image_filename(question_id, image_url) if image_url else None,
        }
        questions.append(q)

    # Sort by question number
    questions.sort(key=lambda q: q["id"])

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Done!")
    print(f"   Questions exported: {len(questions)}")
    print(f"   Questions with images: {sum(1 for q in questions if q['imageUrl'])}")
    print(f"   Output: {OUT_PATH}")

    if errors:
        print(f"\n⚠️  {len(errors)} warnings:")
        for e in errors[:20]:
            print(f"   - {e}")

if __name__ == "__main__":
    main()
