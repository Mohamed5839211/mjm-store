/**
 * Arabic search normalization so queries match regardless of orthography:
 * - Hamza forms (أ إ آ ٱ) → bare alef (ا)
 * - Taa marbuta (ة) → ha (ه)
 * - Alef maqsura (ى) → ya (ي)
 * - Hamza-on-ya/waw (ئ ؤ) → ya/waw
 * - Diacritics (tashkeel) and tatweel (ـ) removed
 * - Whitespace collapsed, lowercased
 *
 * Example: "أكياس" and "اكياس" both normalize to "اكياس".
 */
export function normalizeArabic(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** True when `text` contains `query` after normalizing both sides. */
export function matchesNormalized(text: string | null | undefined, query: string): boolean {
  const q = normalizeArabic(query);
  if (!q) return true;
  return normalizeArabic(text).includes(q);
}
