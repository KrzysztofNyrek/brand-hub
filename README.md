# Brand Hub — Krzysztof Nyrek (Faza 1)

Dwujęzyczny hub marki osobistej: **EN → `krzysztofnyrek.eu`**, **PL → `krzysztofnyrek.pl`**.
Stack: **Astro (SSG) + Cloudflare Pages** (+ Pages Functions dla waitlisty). Identity = dedykowana
personal-brand „The Practitioner's Desk" (NIE brandbook AIBiznesLab).

> **Faza 1 = preview only.** Zero cutoveru DNS/apex/poczty (to Faza 2). Hub żyje na CF Pages preview URL.

## Struktura

```
src/
  layouts/Hub.astro          # sticky NAV + flaga PL/EN + stopka + hreflang (prop `lang`)
  components/
    HubHome.astro            # kompozycja sekcji wg języka (EN 6 sekcji / PL lżejszy, bez bloga)
    Hero / Doors / Authority / AboutTeaser / BlogTeaser / Contact.astro
  pages/
    index.astro              # „/" — EN domyślnie; PL gdy build z HUB_LANG=pl (patrz niżej)
    pl/index.astro           # „/pl/" — PL (do preview obu wariantów w jednym buildzie)
    subscribed.astro         # PRG thank-you EN (/subscribed)
    zapisano.astro           # PRG thank-you PL (/zapisano)
  styles/tokens.css          # design tokeny kier. 1 (T1) + @font-face self-host
  config.mjs                 # linki + UTM helper (+ PLACEHOLDERY P2)
functions/api/
  subscribe.js               # POST /api/subscribe → MailerLite (waitlist), PRG redirect
  _subscribe_core.mjs        # czysta walidacja (honeypot/email/lang) — pokryta testami
public/
  fonts/                     # 6× WOFF2 self-host (Fraunces roman+italic, Work Sans; latin+latin-ext)
  portrait-krzysztof.webp/.jpg  # hero (1200px, wykadrowany do popiersia)
test/subscribe.test.mjs      # node:test — 4/4
```

## Komendy

Firmowy CA wymaga `NODE_OPTIONS=--use-system-ca` przy każdej komendzie sięgającej sieci (build/preview/deploy).

```sh
npm install
NODE_OPTIONS=--use-system-ca npm run build      # → dist/ (EN „/" + PL „/pl/")
NODE_OPTIONS=--use-system-ca npm run preview     # lokalny podgląd dist na :4321
node --test test/subscribe.test.mjs              # unit (4/4)
```

## Mechanizm 2 domen (decyzja implementacyjna — plan T6 Step 1, wariant (a))

**Jeden parametryzowany build, przełącznik `HUB_LANG`, dwa projekty CF Pages.**

> 🔴 **ODWRÓCONE 03.08.2026. Domyślny build to teraz PL, nie EN.** Powód nie jest kosmetyczny:
> deploy produkcyjny poszedł kiedyś bez flagi `HUB_LANG=pl` i **cała domena `krzysztofnyrek.pl`
> stała po angielsku**, a przełącznik „PL" linkował sam na siebie, więc do polskiej wersji nie dało
> się dojść z żadnego linku. Flagi nie da się wymusić skryptem npm na Windowsie (cmd.exe nie rozumie
> `VAR=x` przed komendą), więc zabezpieczeniem nie jest ten akapit, tylko **odwrócona wartość
> domyślna**: zwykły `npm run build` produkuje wersję, której potrzebuje produkcja.

- **Domyślny build** (`HUB_LANG` nieustawiony): `/` = **PL**. To jest build dla `krzysztofnyrek.pl`.
  `/pl/` renderuje to samo i jest przekierowane na apex (`public/_redirects`), żeby nie robić duplikatu treści.
- **Build EN**: `HUB_LANG=en npm run build` → `/` renderuje **EN**. Przypadek szczególny: angielski hub
  docelowo mieszka pod `.eu` i **nie jest dziś nigdzie wdrożony** (pod `.eu` stoi osobny serwis WordPress).

Root-switch czyta `process.env.HUB_LANG` w `src/pages/index.astro` (build-time; static output bez zmian).

**hreflang:** deklarujemy wyłącznie `pl` + `x-default=pl`. Para `en↔pl` została usunięta 03.08, bo
wskazywała `krzysztofnyrek.eu` jako angielski odpowiednik tego huba, a to nieprawda: pod `.eu` stoi
osobny WordPress („Content Writer"), którego `/about` zwraca 404. Link „EN" w nawigacji zostaje jako
zwykłe przejście, bez twierdzenia o tłumaczeniu. Parę przywracamy, gdy angielski hub realnie zamieszka pod `.eu`.

| Domena | Projekt CF Pages | Build | Root serwuje |
|---|---|---|---|
| `krzysztofnyrek.pl` | `brand-hub-pl` | `npm run build` (domyślny) | **PL** (`/`) |
| `krzysztofnyrek.eu` | brak wdrożenia huba | `HUB_LANG=en npm run build` | EN (`/`) — nieużywane |

## Deploy (CF Pages — deploy na prod = osobny gated krok z K)

```sh
# PL, czyli produkcja. Jedna komenda, bez flag, bez okazji do pomyłki.
NODE_OPTIONS=--use-system-ca npm run deploy

# to samo rozpisane, gdyby trzeba było zatrzymać się między krokami
NODE_OPTIONS=--use-system-ca npm run build
wrangler pages deploy dist --project-name brand-hub-pl
```

Po deployu (cloud_safety B9): `curl -I <preview-url>` → oczekiwane **HTTP 200** + `content-type: text/html`.

## Zmienne środowiskowe (TYLKO w CF env — NIGDY w repo; cloud_safety A1/A2)

Ustawić w **CF Pages → Settings → Environment variables** (oba projekty EN i PL):

| Zmienna | Wartość | Uwaga |
|---|---|---|
| `MAILERLITE_API_KEY` | *(sekret)* | **reużycie** klucza z audyt-procesow.pl |
| `MAILERLITE_WAITLIST_GROUP_ID` | `192505291644864018` | grupa „AI-w-pracy early access" (P3) |

`.env` / `.dev.vars` są w `.gitignore` (`git check-ignore .env` = match). Function jest failure-safe:
brak env → user i tak dostaje thank-you (302), zapis pomijany, `console.error` w logach.

## Waitlist (linia #2)

`Doors.astro` → `POST /api/subscribe` (form-encoded): pola `email`, `lang` (en/pl), honeypot **`firma_www`**
(musi być pusty), `utm_*`. PRG: `lang=en` → `/subscribed`, `lang=pl` → `/zapisano`.

## Linia #1 (link-out z UTM)

Drzwi A → `system.krzysztofnyrek.eu` + `audyt-procesow.pl`, z
`?utm_source=hub&utm_medium=referral&utm_campaign=<en|pl>` (patrz `config.mjs` `utm()`).

## Fonty (self-host, SIL OFL 1.1)

6× WOFF2 w `public/fonts/` (subset **latin + latin-ext** dla polskich znaków), pobrane z Google Fonts:
Fraunces roman + **Fraunces italic** (prawdziwa kursywa — akcent „signature", `font-synthesis:none`) +
Work Sans. `@font-face` per-subset w `tokens.css`. Zero zewnętrznego CDN (CSP/perf).

> Uwaga: Chrome loguje benign warning „font preloaded but not used within a few seconds" dla
> subsetów latin przy unicode-range — pliki SĄ używane (bazowe a–z). Preload zostaje (LCP hero).

## ⚠️ PLACEHOLDERY do uzupełnienia PRZED prod (P2 — w `config.mjs` = `null` → render `href="#"` z `data-todo`)

| `data-todo` | Co | Gdzie |
|---|---|---|
| `amazon-project-coffee` | link do książki „Project Coffee" na Amazon | Authority (EN+PL) |
| `linkedin-profile` | profil LinkedIn Krzysztofa | Contact (EN+PL) |
| `lead-magnet-first5` | „First 5 PM Days" lead magnet | Authority (EN) |
| `about-pl` | pełne „o mnie" PL (interim WP w PL nie istnieje) | AboutTeaser (PL) |

Znane/wpięte: `system.krzysztofnyrek.eu`, `audyt-procesow.pl`, `krzysztofnyrek.eu/blog` i `/about`
(interim WP na apex), `mailto:contact@krzysztofnyrek.eu`.

## Do domknięcia w T7 (osobny gated krok z K)

- Utworzyć 2 projekty CF Pages (`brand-hub`, `brand-hub-pl`), ustawić env (wyżej), deploy preview, `curl -I` = 200.
- E2E waitlist realnym adresem — **@coo pyta K o odbiorcę PRZED testem** (nie `krzysztof@`).
- Uzupełnić 4 placeholdery P2.
