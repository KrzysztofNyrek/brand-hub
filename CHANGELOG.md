# CHANGELOG — brand-hub (krzysztofnyrek.pl + krzysztofnyrek.eu)

> Wymóg `cloud_safety.md` F7: każdy deploy na produkcję dostaje wpis z hashem commita.
> Założony 20.07.2026. **Wcześniejsze deploye (D79 re-skin, migracja bloga F3, 2 nowe artykuły)
> nie są tu odtwarzane wstecz** — ich historia żyje w `dane/log_pracy.md` w workspace.
>
> Dwa projekty Cloudflare Pages z jednego repo, wariant sterowany zmienną `HUB_LANG`:
> - `npm run build` → EN → `wrangler pages deploy dist --project-name brand-hub` (`krzysztofnyrek.eu`)
> - `HUB_LANG=pl npm run build` → PL → `... --project-name brand-hub-pl` (`krzysztofnyrek.pl`)
>
> ⚠️ Pomyłka wariantu = wgranie EN na `.pl`. Sprawdzaj `lang="..."` w `dist/index.html` przed deployem.

---

## [2026-07-21] deploy 7b5036d2 (working tree, bez commita — zgoda K) — 2. przebieg czystości copy na wariancie EN (`brand-hub`)

**Deploy:** EN → `brand-hub` (`https://7b5036d2.brand-hub-8bz.pages.dev`). Zgoda K (R2 / cloud_safety B1). Ten sam skorygowany source `src/data/blog/*.json` co wpis PL niżej — blog jest treścią wspólną obu wariantów (HUB_LANG steruje tylko hub-home root, nie blogiem). Wariant EN potwierdzony przed deployem: `dist/index.html` = `lang="en"` (NIE `pl` — brak pomyłki wariantu). Poprzedni deploy EN (`bd8e9cee`, 2026-07-20) był sprzed usunięcia strzałek, więc realnie wciąż miał 22 strzałki w prozie — to nie była pusta zmiana.

**Kontekst domenowy (ważne):** publiczny apex `krzysztofnyrek.eu` to **osobny interim WordPress (Apache)**, nie ten projekt CF — moje edycje JSON go nie dotyczą (artykuły tam = 404). Projekt `brand-hub` żyje na CF Pages i renderuje skorygowany blog, ale jego główny alias `brand-hub.pages.dev` jest za **Cloudflare Access** (ściana logowania). Weryfikacja live wykonana na aliasie per-deploy `7b5036d2.brand-hub-8bz.pages.dev` (bez Access).

**Weryfikacja live** (`Invoke-WebRequest`): 3 edytowane artykuły = **HTTP 200 + text/html**, 0 strzałek w prozie (tylko 1 przycisk UI „Zapisuję się →"/stronę), fix-served = **True** (świeża treść, bez lagu). Root = `lang="en"` + tytuł EN hub „…a project manager who runs on AI" (właściwy wariant). Zakres zmian identyczny jak wpis PL niżej (22 strzałki + 12 półpauz + 1 „Co więcej").

## [2026-07-21] deploy cb54e1f5 (working tree, bez commita — zgoda K) — strzałki w prozie + półpauzy usunięte (2. przebieg czystości copy)

**Deploy:** PL → `brand-hub-pl` (`https://cb54e1f5.brand-hub-pl.pages.dev` → `krzysztofnyrek.pl`). Zgoda K (R2 / cloud_safety B1). Wariant PL potwierdzony przed deployem: `dist/index.html` = `lang="pl"`. **EN (`brand-hub` / `.eu`) NIE ruszany** — ten sam content artykułów żyje też na `.eu`, jego redeploy to osobny gated krok, jeśli K zechce.

### Co się zmieniło
- **22 strzałki „→" jako łącznik w prozie usunięte** z 10 artykułów (agenci-ai, architektura-przed-automatyzacja, artykul-2, artykul-4, dlaczego-automatyzacja, reforma-pip, wypalenie-zawodowe + pojedyncze). Przepisane na poprawną polszczyznę z **zachowaniem kierunku** (najpierw/potem/dalej/na końcu, „z 15h na 5h", „od As-Is do To-Be"), nie kasowanie samego znaku. Zgodnie z `ghost_styl.md:71` / `ghost.md` 3.7. To domknięcie pozycji „Znane, świadomie nietknięte" z wpisu 2026-07-20.
- **Strzałka UI na przycisku „Zapisuję się →" (`[slug].astro:79`) ZOSTAJE** — afordancja interfejsu, wyjątek `ghost.md` 3.7. 1 sztuka na każdej stronie, to jedyne „→" w zbudowanym HTML.
- **12 półpauz „–" użytych jako pauza w prozie** (artykul-1, artykul-2 w tym 3 nagłówki H2, artykul-3) → przecinek / dwukropek / kropka i nowe zdanie. **Półpauzy w zakresach liczb/dat zostają** (5–15 osób, 39 000–52 000, pon–pt, 300–500 PLN/h) — poprawny znak zakresu.
- **1 konstrukcja „Co więcej," usunięta** (cmo-obcina-agencje) — lista zakazanych `ghost.md` 3.7.

### Weryfikacja
- Źródła: `→` w prozie 22 → **0**, em-dash „—" **0**, półpauza-w-prozie 12 → **0**, JSON **31/31** poprawny.
- `lint_copy.py --kontekst blog` na 31 plikach = **0 błędów** (10 ostrzeżeń: plusy w wyliczeniach arytmetycznych/danych, uprawnione).
- Build: `HUB_LANG=pl NODE_OPTIONS=--use-system-ca npm run build` = 36 stron, `lang="pl"` na root i artykułach, poprawki obecne w `dist`.
- Live (`Invoke-WebRequest`, curl.exe pada na firmowym CA): 3 edytowane artykuły na `krzysztofnyrek.pl` = **HTTP 200 + text/html + lang=pl**, 0 strzałek w prozie (tylko 1 przycisk UI), fix served = True (świeża treść na brzegu, bez lagu).

## [2026-07-20] commit 5f0b34e — 298 długich pauz usuniętych + nowa nazwa newslettera

**Deploy:** PL → `brand-hub-pl` (`67d56387`), EN → `brand-hub` (`bd8e9cee`). Zgoda K (R2 / cloud_safety B1).

### Co się zmieniło
- **298 długich pauz („—") usuniętych z 21 artykułów.** Redakcja @ghost w 3 równoległych sesjach: interpunkcja **przepisana** (przecinek / kropka i nowe zdanie / dwukropek / nawias), nie kasowanie samego znaku. Zgodnie z `ghost_styl.md:71`.
- **Newsletter przemianowany** na wszystkich 31 artykułach: „Agencja na Autopilocie — 1 trik automatyzacji tygodniowo" → **„System zamiast Ciebie: jedna automatyzacja tygodniowo"**, adresat „właściciele firm 5–30 osób" (D81/D82). Przesłanka: grupa „Agencja na autopilocie" miała 1 subskrybenta na 14 aktywnych, a realny skład listy to instalatorzy HVAC i zapytania ofertowe, zero agencji.
- **Naprawione przy okazji:** martwy link `…-w-agencji.html#cta` (ostatni ocalały z naprawy 83 linków 17.07 — prowadził na stronę główną, bo domena ma soft-404), literówki `gasiszpożary` i `przetważające`, konstrukcja „Co ciekawe (…)" z listy zakazanych `ghost.md` 3.7.

### Widoczne w Google
- **1 tytuł:** „GEO — co zastąpi SEO…" → „**GEO, czyli** co zastąpi SEO…" (fraza GEO zostaje na początku; żaden inny artykuł nie linkuje do GEO, brak anchor textów do poprawy).
- **7 meta description** — kosmetyka interpunkcyjna, słowa kluczowe i długości zachowane.

### Weryfikacja
`lint_copy.py --kontekst blog` na 32 stronach = **0 błędów** (12 ostrzeżeń: plusy w wyliczeniach arytmetycznych, uprawnione). JSON 31/31 poprawny. 89 linków wewnętrznych — wszystkie prowadzą do istniejących artykułów. Encje HTML pauzy (`&mdash;`, `&#8212;`) = 0. Live: `krzysztofnyrek.pl/blog` + 3 artykuły = HTTP 200, 0 widocznych pauz, nowa nazwa obecna.

### Znane, świadomie nietknięte
Strzałki w prozie („As-Is → To-Be") i zdania zaczynające się od „I"/„A" — łamią `ghost_styl.md` tak samo jak pauzy, ale to inny wzorzec i osobna robota. Zgłoszone przez wszystkie trzy sesje redakcyjne. Dywiz ASCII w tytule „Tribal Knowledge - co się dzieje…" — decyzja K.

### Nowa bramka
`narzedzia/lint_copy.py` (workspace) — mechaniczna kontrola copy, kod wyjścia 0 wymagany przed publikacją. Konteksty: `www` (copy sprzedażowe, D1/D2 egzekwowane) / `blog` (publicystyka, nazwy narzędzi dozwolone) / `mail` / `linkedin`. Powstała z incydentu 18 pauz na landingu D81 tego samego dnia.
