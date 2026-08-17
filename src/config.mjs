// Brand Hub — centralne linki + UTM helper (T5/T6, @cto).
// ZASADA (anty-halucynacja): NIE wymyślamy URL-i. Znane = wpisane; nieznane = null
// i renderowane jako placeholder href="#" data-todo (patrz components). P2 z planu.

export const HUB_EN = 'https://krzysztofnyrek.eu';
export const HUB_PL = 'https://krzysztofnyrek.pl';

// --- Analityka (D103) -------------------------------------------------------
// Identyfikator pomiaru GA4 dla tej domeny. `null` = analityki NIE MA i nie
// ładuje się ani baner, ani żaden skrypt Google. Tak jest do czasu, aż powstanie
// strumień danych w panelu GA4 (rekord [MANUAL K]).
//
// 🔴 TRZY WARUNKI Z POLITYKI PRYWATNOŚCI, których ten kod musi dotrzymać
// (materialy/2026-08-04_polityka-prywatnosci-krzysztofnyrek-pl.md, akceptacja K 05.08):
//   1. baner zgody realnie działa i DOMYŚLNIE BLOKUJE,
//   2. GA4 startuje dopiero PO kliknięciu, nie przed,
//   3. w banerze jest link do polityki.
// Polityka opisująca zgodę, której baner nie egzekwuje, jest gorsza niż jej brak.
export const GA4_ID = 'G-DTCRKLPCPP';   // strumień „Hub PL", utworzony przez K 17.08.2026

export const LINKS = {
  // --- ZNANE / potwierdzone ---
  system: 'https://oferta.krzysztofnyrek.pl/onboarding',   // System Onboardingu — produkt w katalogu (D79 F4: retire system.eu)
  audit:  'https://audyt-procesow.pl',           // linia #1 Mini-Audyt (domena standalone)
  blogEn: 'https://krzysztofnyrek.eu/blog',      // interim: obecny WP na apex .eu (Faza 1)
  aboutEn:'https://krzysztofnyrek.eu/about',     // interim: obecny WP na apex .eu (Faza 1)
  mail:   'contact@krzysztofnyrek.eu',           // mailto (real)

  // --- PLACEHOLDERY (P2 — do dostarczenia przez K PRZED T7). null = render href="#" data-todo ---
  amazonProjectCoffee: 'https://www.amazon.com/Project-Coffee-Keeping-business-afloat/dp/8397189017',   // książka „Project Coffee" (Amazon)
  linkedin:            'https://www.linkedin.com/in/krzysztof-nyrek/',   // profil LinkedIn Krzysztofa
  leadMagnetFirst5:    'https://krzysztofnyrek.eu/newsletter/',   // „First 5 PM Days" (INTERIM — K: newsletter do przebudowy, podmienić po rebuildzie)
  aboutPl:             null,   // pełne „o mnie" PL (interim WP nie istnieje w PL; docelowo Faza 4)
};

// Dodaje UTM linii #1 (spec §6): utm_source=hub&utm_medium=referral&utm_campaign=<en|pl>
export function utm(base, campaign) {
  const u = new URL(base);
  u.searchParams.set('utm_source', 'hub');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}
