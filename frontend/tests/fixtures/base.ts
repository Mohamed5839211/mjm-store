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
  // NOTE on the targeted disable below (not global): `use` here is
  // Playwright's fixture-scoping callback — not a React Hook. This file
  // contains no React (no components, no JSX), and the fixture MUST be named
  // `errors` because specs destructure `{ errors }`; renaming it would change
  // test behavior, so the rule is a false positive for this line.
  errors: async ({ page }, use) => {
    const errors = await collectPageErrors(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture `use`, not a React Hook (see note above).
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
