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

- **Domyślny build** (`HUB_LANG` nieustawiony): `/` = **EN**, `/pl/` = **PL**. Służy do lokalnej
  weryfikacji obu wariantów naraz + jest deploy-em dla domeny **`.eu`** (root = EN). ✅
- **Build dla `.pl`**: `HUB_LANG=pl npm run build` → `/` renderuje **PL** (root domeny `.pl` = PL).
  Deploy tego `dist/` do **osobnego** projektu CF Pages podpiętego pod `krzysztofnyrek.pl`.

Root-switch czyta `process.env.HUB_LANG` w `src/pages/index.astro` (build-time; static output bez zmian).
hreflang w obu wariantach zawsze wskazuje **absolutne domeny produkcyjne** (`.eu`/`.pl`, x-default=en),
nie preview URL.

| Domena | Projekt CF Pages | Build | Root serwuje |
|---|---|---|---|
| `krzysztofnyrek.eu` | `brand-hub` (EN) | `npm run build` | EN (`/`) |
| `krzysztofnyrek.pl` | `brand-hub-pl` (PL) | `HUB_LANG=pl npm run build` | PL (`/`) |

## Deploy (CF Pages — Faza 1 = PREVIEW; deploy na prod = osobny gated krok z K)

```sh
# EN
NODE_OPTIONS=--use-system-ca npm run build
wrangler pages deploy dist --project-name brand-hub

# PL
HUB_LANG=pl NODE_OPTIONS=--use-system-ca npm run build
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
