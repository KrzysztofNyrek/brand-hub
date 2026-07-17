# tasks.md — FAZA 1: Re-skin brand-hub „Spec Sheet" → Design System KN (D79)

> Owner: @cto · Wykonawca: `/goal` (autonomiczny loop) · Źródło HOW: @architect (17.07)
> **Deploy (T10) = POZA zakresem tego /goal — osobna bramka Krzysztofa (curl 200).**

## CEL
Przeskinować `brand-hub` (`.pl` PL + `.eu` EN, **wspólny kod**) z systemu „Spec Sheet" (Space Grotesk/IBM Plex/kobalt, motyw inżynierskiego arkusza) na **Design System KN** (Navy `#225378` + pale blue `#EBF3F9` + mosiądz `#A67A38`, Cormorant Garamond + Montserrat, styl edytorski). D79.

## KOŃCOWY DOWÓD (definicja ukończenia /goal)
Po wykonaniu T1-T9: `npm run build` (EN) **oraz** `HUB_LANG=pl npm run build` (PL) przechodzą bez błędu; `npm run preview` — 4 widoki (`/`, `/pl/`, `/subscribed`, `/zapisano`) renderują nowy DS; **grep w `src/` = 0 odwołań** do usuniętych elementów arkusza (`.sheet` grid, `.reticle`, `.eyebrow-fig`, `.kn-tag` tekstowy, `--grid-step`, `--font-mono`); brak poziomego scrolla; polskie diakrytyki OK. Zrzuty 4 widoków jako dowód. **STOP — czekaj na wizualny gate K przed T10.**

## KONTEKST TECHNICZNY
- **Repo:** `D:\Projekty\brand-hub` (Astro/CF Pages). PL build: `HUB_LANG=pl npm run build`. EN build: `npm run build`. Podgląd: `npm run preview`.
- **Źródło prawdy DS:** `G:\Mój dysk\AIBiznesLab\Asystenci\Brandbook\design-system\project\` — `tokens/colors.css`, `typography.css`, `fonts.css`, `spacing.css`, `effects.css`, `readme.md`, `assets/logo-kn*.svg`.
- **DECYZJE K (wpięte, nie pytać ponownie):**
  - Fonty: **Google Fonts @import** (jak DS fonts.css) — NIE self-host. Odwraca `tokens.css:7` „zero CDN" świadomie (brak CSP dziś).
  - Portret Hero: **miękka chłodna desaturacja** (NIE twardy `grayscale(1)`).
  - Drzwi A/B: **A = karta navy (brand-variant) / B = biała** (utrzymać rozróżnienie).
  - Retune metryki fontu (Cormorant lżejszy niż Space Grotesk — clampy `--fs-hero/h1/h2`) → wizualnie po T9, gate K.
- **NIE RUSZAĆ:** copy/głos EN+PL (verbatim — „nie guru", liczby-first), `/api/subscribe`, honeypot, UTM, hreflang, rozdział `.eu/.pl` (D74).
- **De-ryzykowanie:** przed skasowaniem KAŻDEGO vara → `grep` odwołań w `src/`; alias-shim przez jedną iterację; klasy nośne layoutu (`.container`, `.section-pad`) ZOSTAJĄ globalne (nie do scoped `<style>` — incydent 09.07).

## MAPA VARS (Spec Sheet → DS)
| Stary var | stara wartość | → nowa wartość DS |
|---|---|---|
| `--color-paper` | `#F4F5F3` | `#EBF3F9` (pale blue) |
| `--color-panel` | `#FFFFFF` | `#FFFFFF` |
| `--color-ink` | `#16181A` | `#14212B` (ink-900) |
| `--color-signal` (kobalt) | `#1F4BE0` | `#225378` (navy — linki/focus/btn) |
| `--color-signal-deep` | `#163BB8` | `#163A56` (navy-800 hover) |
| `--color-muted` | `#6B7075` | `#556673` (ink-600) |
| `--color-grid` | `#D7DBD9` | `#DEE6EE`/`#C2CED8` (hairline; siatka znika) |
| `--accent-do` (btn fill) | ink | `#225378` (navy) |
| `.accent-italic` (kobalt, `font-style:normal`) | — | **`#A67A38` brass + `font-style:italic` + serif** |
| `--font-display` | Space Grotesk | Cormorant Garamond |
| `--font-body` | IBM Plex Sans | Montserrat |
| `--font-mono`/`--font-utility` | IBM Plex Mono | Montserrat (tracked upper) lub usunięcie |
| `--radius-lg` | `6px` | `10px` |
| `--radius-pill` | `5px` | `999px` |
| cienie | none/subtelne | navy-tinted (`rgba(15,42,64,…)`) + `--shadow-brand` glow pod navy btn |

## ZADANIA

### T1 [CLAUDE] Rewrite `src/styles/tokens.css` — warstwa wartości
Przepisz WARTOŚCI vars wg mapy (nazwy vars BEZ zmian). Usuń 8 bloków `@font-face` (Space/Plex, `tokens.css:20-70`). Na górze wepnij `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&display=swap');`. Ustaw `--font-display`→Cormorant, `--font-body`/`--font-mono`/`--font-utility`→Montserrat.
**DoD:** `npm run build` przechodzi; vars mają wartości DS; brak `@font-face` Space/Plex.

### T2 [CLAUDE] Usuń globalne klasy motywu arkusza z `tokens.css`
Skasuj: `.sheet` grid+border (`:223-232`), `.reticle`/`.cross` (`:488-497`), `.eyebrow-fig` (`:283-288`), `.spec-note` (`:459-466`), `.kn-tag` (`:471-483`), `--grid-step` (`:179`). Przywróć `.accent-italic{font-style:italic; color:var(...brass); font-family:var(--font-display)}` (`:261-266`).
**DoD:** `grep -r` w `src/` = 0 odwołań do skasowanych nazw.

### T3 [CLAUDE] `src/layouts/Hub.astro`
`[KN]` tekstowy w nav → `<img>` `logo-kn.svg`; usuń mono-role (`nav-brand-role`, `.class/.build`); usuń wrapper `.sheet`; stopka `--color-ink` tło → navy-800/900 inverse (użyj `logo-kn-navy-bg.svg`); `theme-color #F4F5F3`→`#EBF3F9`; usuń 3 `<link rel=preload>` fontów (`:61-63`); dodaj `<link rel=preconnect href="https://fonts.gstatic.com" crossorigin>`; restyle `.nav-flag ⇄` mono→Montserrat (funkcja PL/EN zostaje).
**DoD:** nav renderuje logo SVG; stopka navy; brak `[KN]` tekstowego; build OK.

### T4 [CLAUDE] `src/components/Hero.astro`
Usuń: REV-strip `FIG.00/REV` (`:25-28,71-79`), reticle (`:51-55`), plate portretu — etykiety `FIG.01 OPERATOR`/`x:0640 y:0400`/`SUBJECT/SCALE 1:1` (`:44-60,86-109`), `spec-note //` tagline (`:37`). Portret → **miękka chłodna desaturacja** (NIE `grayscale(1)`), karta radius-lg. Słowo-akcent w h1 → serif italic brass. Eyebrow czysty (rule + tracked upper).
**DoD:** render bez etykiet arkusza; h1 z jednym słowem brass italic; portret desaturowany miękko.

### T5 [CLAUDE] `src/components/Doors.astro`
Usuń `[MODULE A/B]` + slug-id (`aId/bId`) + strip koloru (`:59,71`). **Drzwi A → karta navy (brand-variant), B → biała.** Pole waitlist radius DS. Eyebrow-fig out.
**DoD:** karty w stylu DS (A navy/B biała); formularz `/api/subscribe` DZIAŁA (nietknięty).

### T6 [CLAUDE] `Authority.astro` + `Contact.astro`
Authority: eyebrow-fig out; metric-strip kobalt→navy; tytuł „Project Coffee" → serif italic brass; **fix niezdefiniowany `--hairline-strong` (`:164`)**; ikony SVG cienkie ZOSTAJĄ (zgodne z DS Lucide-style). Contact: reticle + `[KN]` stamp out (→ logo lub usuń); panel border ink→navy; eyebrow-fig out.
**DoD:** oba renderują DS; `Project Coffee` brass italic; brak niezdefiniowanych vars.

### T7 [CLAUDE] `AboutTeaser.astro` + `BlogTeaser.astro` + `subscribed.astro` + `zapisano.astro`
Eyebrow-fig out; `[KN]` → logo na thank-you. Proza NIE ruszana.
**DoD:** render DS na obu thank-you (`/subscribed` EN + `/zapisano` PL).

### T8 [CLAUDE] Assety + sprzątanie
Skopiuj `Brandbook/design-system/project/assets/logo-kn.svg` + `logo-kn-navy-bg.svg` → `D:\Projekty\brand-hub\public\`. Usuń martwe `public/fonts/*.woff2` (Space/Plex — dead weight).
**DoD:** logo obecne w public; brak odwołań do usuniętych fontów; build OK.

### T9 [CLAUDE — WERYFIKACJA LOKALNA = KOŃCOWY DOWÓD]
`npm run build` (EN) + `HUB_LANG=pl npm run build` (PL) + `npm run preview`. Sprawdź `/`, `/pl/`, `/subscribed`, `/zapisano`. Zrób zrzuty. Grep 0 artefaktów arkusza. Brak poziomego scrolla. PL diakrytyki OK.
**DoD:** 4 widoki renderują nowy DS bez artefaktów; oba buildy zielone; zrzuty jako dowód. **STOP — gate wizualny K.**

### T10 [MANUAL — GATE K, NIE wykonywać w /goal]
Po OK K: rebuild + `wrangler pages deploy dist` dla DWÓCH projektów CF (EN→`krzysztofnyrek.eu`, `HUB_LANG=pl` build→`krzysztofnyrek.pl`); po każdym `curl -I` = **200** + Content-Type (cloud_safety B9).
**DoD:** oba URL 200, oba renderują DS.
