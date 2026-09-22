import { toPageQuery, toPaginated } from './pagination';

describe('toPageQuery', () => {
  it('defaults to page 1 / limit 20', () => {
    expect(toPageQuery(undefined, undefined)).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it('parses string query values', () => {
    expect(toPageQuery('3', '10')).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it('clamps invalid values and caps limit at 100', () => {
    expect(toPageQuery('0', '-5')).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(toPageQuery('abc', '9999')).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
    });
  });

  it('respects a custom default limit', () => {
    expect(toPageQuery(undefined, undefined, 10)).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });
});

describe('toPaginated', () => {
  it('builds the { items, meta } envelope', () => {
    const result = toPaginated([1, 2], 25, { page: 2, limit: 10, skip: 10 });
    expect(result).toEqual({
      items: [1, 2],
      meta: { total: 25, page: 2, limit: 10, hasNextPage: true },
    });
  });

  it('marks the last page correctly', () => {
    const result = toPaginated([1], 21, { page: 3, limit: 10, skip: 20 });
    expect(result.meta.hasNextPage).toBe(false);
  });
});
