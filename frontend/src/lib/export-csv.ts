'use client';

/**
 * Minimal CSV exporter (Excel-compatible via UTF-8 BOM, Arabic-safe).
 * Keeps reporting client-side: no backend endpoint needed.
 */
export function downloadCsv(
  filename: string,
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[],
): void {
  if (typeof window === 'undefined' || rows.length === 0) return;

  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    columns.map((c) => c.label).join(','),
    ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(',')),
  ];

  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}
