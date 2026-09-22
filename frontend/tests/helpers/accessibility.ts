import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Shared axe-core helper for MJM Store accessibility tests.
 *
 * Rules enforced here (per task brief):
 * - Default axe rules first; no global disable.
 * - `incomplete` results are LOGGED for manual review, never fail the test.
 * - Violations whose EVERY node belongs to an external service/ad are
 *   downgraded to notes (not a failure) and documented in the report.
 * - App violations fail the test and are logged with full remediation info:
 *   test name, path, count, impact, description, affected element, help URL.
 */

export interface LoggedViolation {
  id: string;
  impact: string | null | undefined;
  description: string;
  help: string;
  helpUrl: string;
  targetCount: number;
  targets: string[];
}

export interface AxeAuditResult {
  testName: string;
  path: string;
  violationCount: number;
  externalNoteCount: number;
  incompleteCount: number;
  /** App-owned violations — these fail the test. */
  violations: LoggedViolation[];
  /** External-only violations — notes, do not fail. */
  externalNotes: LoggedViolation[];
  /** Incomplete (needs-manual-review) rule ids. */
  incomplete: { id: string; impact: string | null | undefined; description: string }[];
}

/** Hosts / URL fragments that are NOT part of the application. */
const EXTERNAL_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'google-analytics.com',
  'googletagmanager.com',
  'sentry.io',
  'maps.googleapis.com',
  'maps.gstatic.com',
  'grainy-gradients.vercel.app',
  'vercel.app',
  'googlesyndication.com',
  'doubleclick.net',
];

function isExternalString(value: string): boolean {
  return EXTERNAL_PATTERNS.some((host) => value.includes(host));
}

function nodeToString(node: { target?: unknown; html?: string }): string {
  const target = Array.isArray(node.target) ? node.target.join(' ') : '';
  return `${target} ${node.html ?? ''}`;
}

/**
 * A violation is classified as external ONLY when every affected node
 * references an external host. Mixed app+external violations stay failures.
 */
function isExternalViolation(violation: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: { target?: any; html?: string }[];
}): boolean {
  if (violation.nodes.length === 0) return false;
  return violation.nodes.every((n) => isExternalString(nodeToString(n)));
}

function toLoggedViolation(v: {
  id: string;
  impact?: string | null;
  description: string;
  help: string;
  helpUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: { target?: any; html?: string }[];
}): LoggedViolation {
  return {
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    targetCount: v.nodes.length,
    targets: v.nodes.map((n) =>
      Array.isArray(n.target) ? n.target.join(' ') : String(n.target ?? ''),
    ),
  };
}

export interface RunAxeOptions {
  testName: string;
  path: string;
  /** Optional AxeBuilder scoping, e.g. `.include('main')`. Applied before analyze. */
  scope?: (builder: AxeBuilder) => AxeBuilder;
  /** Extra tags to run, defaults to axe default rules (no tags passed). */
  tags?: string[];
  /** Rules to explicitly skip — MUST be documented at the call site. Empty by default. */
  disableRules?: string[];
}

/**
 * Run axe-core on the current page, log everything, and return the split
 * result. Callers assert on `result.violations` (app-owned only).
 *
 * NOTE (2026-09-20 fix step): axe-core blends element opacity into its
 * contrast computation, and this app uses framer-motion entrance animations
 * (`initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`) with no DOM-ready
 * signal when they finish. Analyzing mid-animation therefore reports
 * TRANSIENT contrast failures for text that fully passes at rest. The short
 * settle wait below lets entrance animations reach their steady state — the
 * state real users (and WCAG) actually evaluate. It never masks genuine
 * violations: any at-rest failure still fails loudly.
 */
export async function runAxeAudit(
  page: Page,
  opts: RunAxeOptions,
): Promise<AxeAuditResult> {
  // Necessary: no Playwright auto-wait covers time-based opacity animations.
  await page.waitForTimeout(1500);

  let builder = new AxeBuilder({ page });
  if (opts.tags) builder = builder.withTags(opts.tags);
  if (opts.disableRules?.length) builder = builder.disableRules(opts.disableRules);
  if (opts.scope) builder = opts.scope(builder);

  const results = await builder.analyze();

  const incomplete = (results.incomplete ?? []).map((i) => ({
    id: i.id,
    impact: i.impact,
    description: i.description,
  }));
  for (const inc of results.incomplete ?? []) {
    console.log(
      `[axe-incomplete] ${opts.testName} ${opts.path} :: ${inc.id} (${inc.impact ?? 'unknown'}) — needs manual review`,
    );
  }

  const violations = results.violations ?? [];
  const externalNotes: LoggedViolation[] = [];
  const appViolations: LoggedViolation[] = [];

  for (const v of violations) {
    const logged = toLoggedViolation(v);
    if (isExternalViolation(v)) {
      externalNotes.push(logged);
      console.log(
        `[axe-external-note] ${opts.testName} ${opts.path} :: ${v.id} (${v.impact}) — external-only, not failing`,
      );
    } else {
      appViolations.push(logged);
    }
  }

  if (appViolations.length > 0 || externalNotes.length > 0) {
    console.log(
      JSON.stringify(
        {
          testName: opts.testName,
          path: opts.path,
          violationCount: appViolations.length,
          externalNoteCount: externalNotes.length,
          incompleteCount: incomplete.length,
          violations: appViolations,
          externalNotes,
          incomplete,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(
      `[axe-pass] ${opts.testName} ${opts.path} :: 0 violations (${incomplete.length} incomplete logged)`,
    );
  }

  return {
    testName: opts.testName,
    path: opts.path,
    violationCount: appViolations.length,
    externalNoteCount: externalNotes.length,
    incompleteCount: incomplete.length,
    violations: appViolations,
    externalNotes,
    incomplete,
  };
}

/** Fail on app-owned violations only; external + incomplete are notes. */
export function expectNoAxeViolations(result: AxeAuditResult): void {
  expect(
    result.violations,
    `axe violations on ${result.path}:\n${JSON.stringify(result.violations, null, 2)}`,
  ).toEqual([]);
}
