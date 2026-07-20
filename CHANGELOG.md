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
