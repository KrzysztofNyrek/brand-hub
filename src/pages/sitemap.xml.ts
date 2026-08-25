// SITEMAPA (19.08.2026, @coo → @cto).
//
// 🔴 POWÓD POWSTANIA, zmierzony a nie założony: Search Console dla `sc-domain:krzysztofnyrek.pl`
// pokazywał przez 90 dni wyświetlenia WYŁĄCZNIE dla strony głównej. Trzydzieści sześć artykułów
// bloga: zero wyświetleń, zero kliknięć. Przyczyna była po naszej stronie i była banalna:
// projekt NIE MIAŁ SITEMAPY W OGÓLE. `astro.config.mjs` nie ustawiał nawet pola `site`, więc
// żaden mechanizm nie miał z czego jej zbudować, a adresy /sitemap.xml i /robots.txt zwracały
// stronę główną z kodem 200 (soft-404), czyli wyglądały na „coś tam jest".
// W samym GSC wisiały dwie martwe sitemapy z czasów WordPressa: zgłoszona 07.12.2024 (1 błąd)
// oraz zgłoszona 29.11.2012 (177 adresów zgłoszonych, 0 zaindeksowanych).
//
// DLACZEGO WŁASNY ENDPOINT, A NIE `@astrojs/sitemap`: nie dokładamy zależności do builda dla
// pliku, który ma dwadzieścia linijek, a przy okazji mamy pełną kontrolę nad tym, co do niego
// NIE trafia. To jest tu istotne, bo część stron jest świadomie `noindex`.
//
// CO CELOWO POMIJAMY:
//   - /first-5-pm-days, /pm-gotowe, /zapisano, /subscribed — mają `<meta name="robots" content="noindex">`,
//     bo to landingi i strony podziękowania. Adres w sitemapie przy noindex to sprzeczny sygnał.
//   - /pl/ — ten sam widok co „/" (patrz src/pages/pl/index.astro), czyli duplikat treści.

import { HUB_PL, HUB_EN } from '../config.mjs';

const base = process.env.HUB_LANG === 'en' ? HUB_EN : HUB_PL;

// Statyczne strony, które MAJĄ być indeksowane. Ścieżki dokładnie takie, jak deklarują
// je znaczniki `rel="canonical"` w tych stronach.
// 🔴 UKOSNIK NA KONCU JEST OBOWIAZKOWY. Cloudflare Pages odpowiada 308 na kazdy adres bez niego
// (sprawdzone 19.08 na zywej domenie, z wylaczonym podazaniem za przekierowaniem).
// Sitemapa z adresami, ktore natychmiast przekierowuja, marnuje budzet indeksowania.
const STATIC_PATHS = [
  '/',
  '/blog/',
  '/jak-powstaja-teksty/',
  '/polityka-prywatnosci/',
  '/regulamin/',
  '/polityka-zwrotow/',
  // Strona ofertowa zestawu o interesariuszach (24.08.2026). Publiczna i indeksowalna
  // ŚWIADOMIE, inaczej niż landingi z formularzem: ta strona ma sprzedawać i ma być
  // znajdowana. Nie ma na niej `noindex`, więc wpis w sitemapie nie jest sprzecznym sygnałem.
  '/interesariusze/',
  // Strona produktowa Interwencji Projektowej (25.08.2026). Indeksowalna, choc uslugi nie
  // sprzedajemy z ruchu: ma byc adresem, ktory da sie podac w rozmowie i znalezc po nazwisku.
  '/interwencja/',
];

export function GET() {
  const mods = import.meta.glob('../data/blog/*.json', { eager: true });
  const posts = Object.values(mods)
    .map((m: any) => m.default)
    .sort((a: any, b: any) => (a.date < b.date ? 1 : -1));

  const urls: { loc: string; lastmod?: string }[] = [
    ...STATIC_PATHS.map((p) => ({ loc: `${base}${p}` })),
    ...posts.map((p: any) => ({ loc: `${base}/blog/${p.slug}/`, lastmod: p.date })),
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          '  <url>\n' +
          `    <loc>${u.loc}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
          '  </url>\n',
      )
      .join('') +
    '</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
