/**
 * Arabic search normalization (mirror of the frontend helper):
 * hamza forms -> bare alef, taa marbuta -> ha, alef maqsura -> ya,
 * diacritics/tatweel removed, whitespace collapsed, lowercased.
 * Used to build/query the `searchIndex` columns so "اكياس" finds "أكياس".
 */
export function normalizeArabic(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[ً-ٲـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Build a searchable index string from product fields. */
export function productSearchIndex(fields: {
  name?: string | null;
  sku?: string | null;
  description?: string | null;
}): string {
  return normalizeArabic(
    [fields.name, fields.sku, fields.description].filter(Boolean).join(' '),
  );
}
