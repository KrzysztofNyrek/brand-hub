#!/usr/bin/env python3
"""
md_to_blog.py — konwersja draftu .md (DRAFTS/) na wpis kolekcji bloga src/data/blog/<slug>.json.
Użycie: python md_to_blog.py <draft.md> <slug> <YYYY-MM-DD> <image.png>
Markdown obsługiwany: ## TREŚĆ jako granica; ### -> h2, #### -> h3, --- -> hr,
listy '- ', **bold**, [tekst](url) (http -> target/rel; /blog -> wewn.), \\n w akapicie -> <br>.
"""
import re, json, sys
from pathlib import Path


def inline(t):
    t = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r'\[([^\]]+)\]\((/[^)]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    return t


def convert(tresc):
    blocks = re.split(r'\n\s*\n', tresc.strip())
    out = []
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        if b == '---':
            out.append('<hr />')
        elif b.startswith('#### '):
            out.append(f'<h3>{inline(b[5:].strip())}</h3>')
        elif b.startswith('### '):
            out.append(f'<h2>{inline(b[4:].strip())}</h2>')
        elif b.startswith('## '):
            out.append(f'<h2>{inline(b[3:].strip())}</h2>')
        else:
            lines = [l for l in b.split('\n')]
            if lines and all(l.strip().startswith('- ') for l in lines):
                items = ''.join(f'<li>{inline(l.strip()[2:].strip())}</li>' for l in lines)
                out.append(f'<ul>{items}</ul>')
            else:
                out.append('<p>' + '<br>'.join(inline(l.strip()) for l in lines) + '</p>')
    return ''.join(out)


def grab(text, label):
    m = re.search(r'\*\*' + re.escape(label) + r':\*\*\s*(.+)', text)
    return m.group(1).strip() if m else ''


def main():
    draft, slug, date, image = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    text = Path(draft).read_text(encoding='utf-8')
    title = grab(text, 'title')
    subtitle = grab(text, 'subtitle')
    desc = grab(text, 'description (meta SEO)') or grab(text, 'description')
    tresc = text.split('## TREŚĆ', 1)[1]
    body = convert(tresc)
    data = {
        'slug': slug, 'title': title, 'description': desc, 'date': date,
        'image': image, 'subtitle': subtitle, 'bodyHtml': body,
    }
    out = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'blog' / f'{slug}.json'
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'OK {slug}: title={title[:40]}... body={len(body)} znakow')


if __name__ == '__main__':
    main()
