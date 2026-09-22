'use client';

import { useEffect } from 'react';

/** Per-page <title> for client-rendered routes (SEO + tab labels). */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | متجر MJM`;
  }, [title]);
}
