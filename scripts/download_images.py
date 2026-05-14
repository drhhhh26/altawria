#!/usr/bin/env python3
"""
download_images.py
Downloads all question images from the source URLs and saves them locally
as WebP to assets/images/q{id}.webp.

Run AFTER parse_xlsx.py (reads assets/questions.json).
Requires: pip install pillow requests
"""

import json
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
    from PIL import Image
    import io
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "pillow", "--break-system-packages", "-q"])
    import requests
    from PIL import Image
    import io

QUESTIONS_PATH = Path(__file__).parent.parent / "assets" / "questions.json"
IMAGES_DIR     = Path(__file__).parent.parent / "assets" / "images"
MAX_WIDTH      = 800   # resize to max 800px wide (enough for any phone)
WORKERS        = 8     # parallel downloads

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def download_and_save(question_id: int, url: str, out_path: Path) -> tuple[int, bool, str]:
    """Download one image and save as WebP. Returns (id, success, message)."""
    if out_path.exists():
        return question_id, True, "cached"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        img = Image.open(io.BytesIO(resp.content)).convert("RGB")

        # Resize if wider than MAX_WIDTH
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_size = (MAX_WIDTH, int(img.height * ratio))
            img = img.resize(new_size, Image.LANCZOS)

        img.save(out_path, "WEBP", quality=85, method=6)
        return question_id, True, f"{img.width}x{img.height}"
    except Exception as e:
        return question_id, False, str(e)

def main():
    if not QUESTIONS_PATH.exists():
        print("ERROR: questions.json not found. Run parse_xlsx.py first.")
        sys.exit(1)

    with open(QUESTIONS_PATH, encoding="utf-8") as f:
        questions = json.load(f)

    # Collect unique (question_id, url) pairs that have images
    tasks = []
    seen_urls = set()
    for q in questions:
        if q.get("imageUrl") and q.get("imageFile"):
            url = q["imageUrl"]
            q_id = q["id"]
            out_path = IMAGES_DIR / q["imageFile"]
            # Each question_id gets its own file, even if URL repeats
            tasks.append((q_id, url, out_path))

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Images to download: {len(tasks)}")
    already_cached = sum(1 for _, _, p in tasks if p.exists())
    print(f"Already cached:     {already_cached}")
    print(f"To download:        {len(tasks) - already_cached}")
    print()

    success = 0
    failed = []

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(download_and_save, qid, url, path): qid
                   for qid, url, path in tasks}
        for i, future in enumerate(as_completed(futures), 1):
            q_id, ok, msg = future.result()
            if ok:
                success += 1
                status = "✅" if msg != "cached" else "📦"
                print(f"  [{i:>3}/{len(tasks)}] {status} Q{q_id:04d} — {msg}")
            else:
                failed.append((q_id, msg))
                print(f"  [{i:>3}/{len(tasks)}] ❌ Q{q_id:04d} — {msg}")

    print(f"\n✅ Done!")
    print(f"   Succeeded: {success}")
    print(f"   Failed:    {len(failed)}")

    if failed:
        print("\n⚠️  Failed downloads:")
        for q_id, err in failed:
            print(f"   Q{q_id:04d}: {err}")
        print("\nTip: Re-run the script to retry failed downloads.")

    # Print total size
    total_bytes = sum(p.stat().st_size for _, _, p in tasks if p.exists())
    print(f"\n📦 Total image size: {total_bytes / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
