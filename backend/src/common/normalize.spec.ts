import { normalizeArabic, productSearchIndex } from './normalize';

describe('normalizeArabic', () => {
  it.each([
    ['أكياس', 'اكياس'],
    ['إكياس', 'اكياس'],
    ['آكياس', 'اكياس'],
    ['نفاية', 'نفايه'],
    ['على', 'علي'],
    ['مِياهٌ', 'مياه'],
    ['كرتون', 'كرتون'],
    ['', ''],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('handles null/undefined', () => {
    expect(normalizeArabic(null)).toBe('');
    expect(normalizeArabic(undefined)).toBe('');
  });
});

describe('productSearchIndex', () => {
  it('joins and normalizes product fields', () => {
    expect(
      productSearchIndex({
        name: 'أكياس نفايات',
        sku: 'BAG-001',
        description: null,
      }),
    ).toBe('اكياس نفايات bag-001');
  });
});
