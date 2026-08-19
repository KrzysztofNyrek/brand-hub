// robots.txt (19.08.2026, @coo → @cto).
//
// Do dziś adres /robots.txt zwracał stronę główną z kodem 200, czyli klasyczny soft-404.
// Robot dostawał HTML zamiast reguł. Sam w sobie brak robots.txt nie blokuje indeksowania,
// ale to jest jedyne standardowe miejsce, w którym wskazuje się sitemapę, więc powstaje razem z nią.
//
// Generowany, a nie wrzucony do `public/`, z jednego powodu: wiersz `Sitemap:` musi wskazywać
// domenę TEGO builda. Build PL (domyślny) i build EN (HUB_LANG=en, .eu wg D118 pkt 10) mają
// różne adresy, a plik statyczny w `public/` byłby wspólny dla obu i w jednym z nich kłamałby.

import { HUB_PL, HUB_EN } from '../config.mjs';

const base = process.env.HUB_LANG === 'en' ? HUB_EN : HUB_PL;

export function GET() {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${base}/sitemap.xml`, ''].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
