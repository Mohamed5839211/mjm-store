/** Shared pagination contract: { items, meta: { total, page, limit, hasNextPage } }. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface PageQuery {
  page: number;
  limit: number;
  skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Normalize raw page/limit query values (strings from HTTP) into safe numbers. */
export function toPageQuery(
  page?: unknown,
  limit?: unknown,
  defaultLimit: number = DEFAULT_LIMIT,
): PageQuery {
  const parsedPage =
    typeof page === 'string' || typeof page === 'number'
      ? parseInt(String(page), 10)
      : NaN;
  const parsedLimit =
    typeof limit === 'string' || typeof limit === 'number'
      ? parseInt(String(limit), 10)
      : NaN;
  const safePage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : DEFAULT_PAGE;
  const safeLimit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), MAX_LIMIT)
      : defaultLimit;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/** Build the { items, meta } envelope from parallel [findMany, count] results. */
export function toPaginated<T>(
  items: T[],
  total: number,
  query: PageQuery,
): Paginated<T> {
  return {
    items,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      hasNextPage: query.skip + query.limit < total,
    },
  };
}
