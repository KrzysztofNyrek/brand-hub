# tasks.md — FAZA 3 (D79): Migracja bloga system.eu → krzysztofnyrek.pl/blog (Astro + DS)

> Owner: @cto · Wykonawca: `/goal` · Cel: przenieść ~32 artykuły z `system.krzysztofnyrek.eu/blog/` na
> natywny `/blog` w brand-hub (Astro, nowy DS) + przekierowania 301. **Deploy = osobna bramka K.**

## CEL
Blog „Krzysztof.PM" (~32 artykuły agencje/automatyzacja) migrowany do brand-hub jako natywny Astro `/blog`
(listing) + `/blog/[slug]` (artykuł) w Design System KN (Cormorant/Montserrat, navy/pale). Treść VERBATIM,
tylko warstwa wizualna = DS. Redirecty 301 ze starych URL-i. Docelowa domena: **krzysztofnyrek.pl** (build PL).

## KOŃCOWY DOWÓD (definicja ukończenia /goal)
- Parser wygenerował **32** wpisy danych (count == liczba plików `*.html` w źródle minus `index.html`).
- `npm run build` (EN) i `HUB_LANG=pl npm run build` (PL) zielone; zbudowane `/blog/index.html` + **32×** `/blog/[slug]/index.html`.
- `npm run preview`: `/blog` renderuje listing 32 kart w DS (Cormorant/navy); losowy artykuł renderuje hero image + tytuł Cormorant + body + CTA newsletter w DS; PL diakrytyki OK; brak poziomego scrolla.
- Obrazy hero obecne w `public/blog/img/`.
- Plik `.htaccess` z regułą 301 przygotowany (NIE wgrany — deploy gated).
- Zrzuty: `/blog` + 1 artykuł. **STOP przed deployem — gate K.**

## KONTEKST TECHNICZNY
- **Źródło:** `G:\Mój dysk\AIBiznesLab\Asystenci\projekty\ZTO_System\public_html\blog\` — `*.html` (32 artykuły + `index.html` do POMINIĘCIA) + `img\*` (~30 hero PNG/JPG).
- **Repo docelowe:** `D:\Projekty\brand-hub` (Astro/CF Pages). Build EN `npm run build`, PL `HUB_LANG=pl npm run build`. `NODE_OPTIONS=--use-system-ca`.
- **DS:** `src/styles/tokens.css` (już re-skinowany D79 — używaj istniejących klas/tokenów: `.h1/.h2/.h3`, `.eyebrow`, `.link`, `.btn-primary/secondary`, `.card`, `.container`, `.section-pad`, `--navy/--brass/--font-display(Cormorant)/--font-body(Montserrat)`).
- **Layout:** owijaj strony w `src/layouts/Hub.astro` (nav+stopka+hreflang) — prop `lang='pl'`.
- **Struktura artykułu źródłowego (identyczna we wszystkich):** `<h1>` + `og:title` (tytuł), `meta[name=description]` (opis), `meta[property=article:published_time]` (data YYYY-MM-DD), `og:image` (hero — bierz basename), `.article-subtitle` (podtytuł), `<article class="article-content">…</article>` (body: h2/p/hr/strong/em) zakończone `<div class="cta-block">` (newsletter — WYTNIJ z body, damy własny CTA w szablonie).

## ZADANIA

### T1 [CLAUDE] Parser artykułów → dane
Napisz `D:\Projekty\brand-hub\scripts\migrate_blog.py` (Python, stdlib: `pathlib`, `re`, `html`, `json`; UTF-8):
- czyta wszystkie `*.html` w źródle (pomiń `index.html`),
- per plik ekstrahuje: `slug` (nazwa pliku bez `.html`), `title` (og:title), `description`, `date` (article:published_time), `image` (basename z og:image, np. `cmo-obcina-agencje.png`), `subtitle` (`.article-subtitle` tekst), `bodyHtml` (inner `<article class="article-content">` **obcięty przed** `<div class="cta-block"`),
- czyści `bodyHtml`: usuń ewentualne `on*=` handlery i `<script>`; zostaw h2/h3/p/hr/ul/ol/li/strong/em/a/img (przepisz `src="/blog/img/..."` → `/blog/img/...` bez zmian — zostają),
- zapisuje `src/data/blog/[slug].json` (pola wyżej) — UTF-8, `ensure_ascii=false`,
- na końcu drukuje licznik: `OK: N / total`.
**DoD:** `python scripts/migrate_blog.py` → `OK: 32 / 32` (lub loguje które nie sparsowały); 32 pliki w `src/data/blog/`.

### T2 [CLAUDE] Obrazy hero
Skopiuj `…/public_html/blog/img/*` → `D:\Projekty\brand-hub\public\blog\img\` (bez `README.md`).
**DoD:** obrazy w `public/blog/img/`; każdy `image` z JSON ma odpowiadający plik (weryfikuj, zaloguj braki).

### T3 [CLAUDE] Listing `/blog`
`src/pages/blog/index.astro`: `import.meta.glob('../../data/blog/*.json', { eager:true })`, sortuj **malejąco po dacie**, renderuj siatkę kart (`.card`): hero image (`/blog/img/{image}`, `loading=lazy`, `width/height`), data (`.caption`), tytuł (`.h3` link do `/blog/{slug}`), `subtitle` (muted). Nagłówek sekcji: eyebrow „Blog" + h1 „Notatki z biurka" (lub sensowny PL). Owiń w `Hub.astro lang='pl'`, `.container .section-pad`. Meta title/description sensowne.
**DoD:** `/blog` listuje 32 karty posortowane od najnowszej; klik → `/blog/[slug]`.

### T4 [CLAUDE] Szablon artykułu `/blog/[slug]`
`src/pages/blog/[slug].astro`: `getStaticPaths` z globa danych; render: breadcrumb (Blog / tytuł, `.link`), `<h1 class="h1">` (Cormorant), `.article-subtitle` (body-lg muted), data (`.caption`), hero `<img>` (radius DS, `fetchpriority=high`), body przez `set:html={bodyHtml}` w kontenerze `.article-content` (styl DS: prose max-width ~`--maxw-prose`+, h2 Cormorant, p Montserrat 1.7, hr hairline, `a`→`.link`), na końcu **jeden CTA newsletter** (blok DS: nagłówek + akapit + form MailerLite `action="https://assets.mailerlite.com/jsonp/953911/forms/185269506350777723/subscribe"` method=post target=_blank, input email + hidden `ml-submit=1`/`anticsrf=true`, `.btn-primary`). Owiń w `Hub.astro lang='pl'`.
- **SEO:** `<link rel=canonical href="https://krzysztofnyrek.pl/blog/{slug}">`, OG (type=article, title, description, image absolutny `https://krzysztofnyrek.pl/blog/img/{image}`, url), `article:published_time`, JSON-LD Article (autor „Krzysztof Nyrek", publisher „Krzysztof Nyrek", datePublished=data, mainEntityOfPage=nowy URL). Te meta idą do `<head>` — dodaj do Hub.astro slot na dodatkowe head-tagi albo props (spójnie z istniejącym wzorcem).
- Style artykułu w scoped `<style>` (prose), NIE globalnie.
**DoD:** losowy artykuł renderuje: breadcrumb, hero, tytuł Cormorant, body sformatowany DS, CTA; canonical/OG/JSON-LD wskazują `krzysztofnyrek.pl`.

### T5 [CLAUDE] Nawigacja + BlogTeaser
- Dodaj „Blog" do nawigacji **PL** w `Hub.astro` (link `/blog`) — obecnie PL nav go nie ma.
- `BlogTeaser.astro`: przepnij CTA na `/blog` (zamiast interim `krzysztofnyrek.eu/blog` z `config.mjs`); rozważ pokazanie 3 najnowszych. Minimum: link „Czytaj blog →" na `/blog`.
**DoD:** z nawigacji PL da się wejść na `/blog`; BlogTeaser kieruje na `/blog`.

### T6 [CLAUDE] Przekierowania 301 (przygotowanie — NIE wgrywać)
Utwórz `projekty/ZTO_System/public_html/blog/.htaccess` (lub dopisz do istniejącego root `.htaccess` — sprawdź) z regułą:
```
RedirectMatch 301 ^/blog/index\.html$ https://krzysztofnyrek.pl/blog
RedirectMatch 301 ^/blog/([^/]+)\.html$ https://krzysztofnyrek.pl/blog/$1
```
(jeden wzorzec pokrywa wszystkie 32 + index). Zweryfikuj że nie koliduje z istniejącymi regułami ZTO.
**DoD:** `.htaccess` przygotowany; w tasks-notatce lista: co wgrać na FTP (deploy.py) w bramce deployu.

### T7 [CLAUDE — WERYFIKACJA LOKALNA = KOŃCOWY DOWÓD]
`npm run build` (EN) + `HUB_LANG=pl npm run build` (PL) + `npm run preview`. Sprawdź `/blog` + 2 artykuły. Zrzuty. Policz zbudowane `/blog/[slug]` (== 32). Grep polskich znaków OK. Brak poziomego scrolla.
**DoD:** oba buildy zielone; 32 artykuły + listing renderują DS; zrzuty jako dowód. **STOP — gate K.**

### T8 [MANUAL — GATE K, NIE w /goal]
Po OK K: (a) deploy brand-hub-pl (`HUB_LANG=pl` build → `wrangler pages deploy dist --project-name brand-hub-pl`) + EN → `brand-hub`; `curl -I krzysztofnyrek.pl/blog` = 200. (b) Wgraj `.htaccess` na FTP `system.krzysztofnyrek.eu` (przez `narzedzia/deploy.py` — dry-run first), przetestuj `curl -I system.krzysztofnyrek.eu/blog/cmo-obcina-agencje.html` = **301 → krzysztofnyrek.pl/blog/cmo-obcina-agencje**. (c) commit brand-hub.
**DoD:** `/blog` LIVE na .pl; stare URL-e 301 na nowe.
