#!/usr/bin/env python3
"""
migrate_blog.py — ekstrakcja artykułów bloga Krzysztof.PM (system.eu/blog/*.html)
do data-collection Astro (src/data/blog/*.json) dla nowego /blog na brand-hub (D79 FAZA 3).

Struktura źródła jednakowa: og:title / meta description / article:published_time / og:image /
.article-subtitle / <article class="article-content">…</article> (obcięte przed .cta-block).
"""
import re
import json
import html
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SRC = Path(r"G:\Mój dysk\AIBiznesLab\Asystenci\projekty\ZTO_System\public_html\blog")
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "blog"


def meta_prop(h, prop):
    m = re.search(r'<meta[^>]*property=["\']' + re.escape(prop) + r'["\'][^>]*>', h, re.I)
    if not m:
        return None
    c = re.search(r'content=["\'](.*?)["\']', m.group(0), re.I | re.S)
    return html.unescape(c.group(1).strip()) if c else None


def meta_name(h, name):
    m = re.search(r'<meta[^>]*name=["\']' + re.escape(name) + r'["\'][^>]*>', h, re.I)
    if not m:
        return None
    c = re.search(r'content=["\'](.*?)["\']', m.group(0), re.I | re.S)
    return html.unescape(c.group(1).strip()) if c else None


def clean_body(b):
    # usuń <script>…</script> i handlery on*=
    b = re.sub(r'<script\b[^>]*>.*?</script>', '', b, flags=re.I | re.S)
    b = re.sub(r'\son\w+\s*=\s*"[^"]*"', '', b, flags=re.I)
    b = re.sub(r"\son\w+\s*=\s*'[^']*'", '', b, flags=re.I)
    return b.strip()


def parse(fp):
    h = fp.read_text(encoding="utf-8", errors="replace")
    slug = fp.stem
    title = meta_prop(h, "og:title") or ""
    desc = meta_name(h, "description") or ""
    date = meta_prop(h, "article:published_time") or ""
    img = meta_prop(h, "og:image") or ""
    image = img.rsplit("/", 1)[-1] if img else ""
    sub = re.search(r'<p class="article-subtitle">(.*?)</p>', h, re.S)
    subtitle = html.unescape(re.sub(r'<[^>]+>', '', sub.group(1)).strip()) if sub else ""
    art = re.search(r'<article class="article-content">(.*?)</article>', h, re.S)
    if not art:
        return None
    body = art.group(1)
    body = body.split('<div class="cta-block"')[0]
    body = clean_body(body)
    if not title or not body:
        return None
    return {
        "slug": slug, "title": title, "description": desc, "date": date,
        "image": image, "subtitle": subtitle, "bodyHtml": body,
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in SRC.glob("*.html") if p.name != "index.html")
    ok, fail = 0, []
    for fp in files:
        data = parse(fp)
        if data is None:
            fail.append(fp.name)
            continue
        (OUT / f"{data['slug']}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        ok += 1
    print(f"OK: {ok} / {len(files)}")
    if fail:
        print("NIE sparsowano: " + ", ".join(fail))


if __name__ == "__main__":
    main()
