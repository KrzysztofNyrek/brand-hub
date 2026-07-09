// Brand Hub — centralne linki + UTM helper (T5/T6, @cto).
// ZASADA (anty-halucynacja): NIE wymyślamy URL-i. Znane = wpisane; nieznane = null
// i renderowane jako placeholder href="#" data-todo (patrz components). P2 z planu.

export const HUB_EN = 'https://krzysztofnyrek.eu';
export const HUB_PL = 'https://krzysztofnyrek.pl';

export const LINKS = {
  // --- ZNANE / potwierdzone ---
  system: 'https://system.krzysztofnyrek.eu',   // linia #1 ZTO (interim; po Fazie 3 → .pl)
  audit:  'https://audyt-procesow.pl',           // linia #1 Mini-Audyt (domena standalone)
  blogEn: 'https://krzysztofnyrek.eu/blog',      // interim: obecny WP na apex .eu (Faza 1)
  aboutEn:'https://krzysztofnyrek.eu/about',     // interim: obecny WP na apex .eu (Faza 1)
  mail:   'contact@krzysztofnyrek.eu',           // mailto (real)

  // --- PLACEHOLDERY (P2 — do dostarczenia przez K PRZED T7). null = render href="#" data-todo ---
  amazonProjectCoffee: null,   // link do książki „Project Coffee" na Amazon
  linkedin:            null,   // profil LinkedIn Krzysztofa
  leadMagnetFirst5:    null,   // „First 5 PM Days" lead magnet / MailerLite delivery
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
