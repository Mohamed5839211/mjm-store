import { test as base, expect } from '@playwright/test';
import {
  collectPageErrors,
  classifyErrors,
  type CollectedErrors,
} from '../helpers/js-errors';

/**
 * Shared fixture: every test automatically collects console/page/network
 * errors. Use `expectNoAppErrors(errors)` at the end of a test, or inspect
 * `errors` manually for negative-path tests (which allow 401/404/etc).
 */
export const test = base.extend<{ errors: CollectedErrors }>({
  errors: async ({ page }, use) => {
    const errors = await collectPageErrors(page);
    await use(errors);
  },
});

export { expect };

/** Fail on critical app errors only; external notes are logged, not failed. */
export function expectNoAppErrors(
  errors: CollectedErrors,
  allowedStatuses: number[] = [],
) {
  const { critical, notes } = classifyErrors(errors, {
    allowedStatuses,
  });
  for (const n of notes) console.log(`[note] ${n}`);
  expect(critical, `critical app errors:\n${critical.join('\n')}`).toEqual([]);
}
