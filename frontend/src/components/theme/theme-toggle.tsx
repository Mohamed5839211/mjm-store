'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';
import { cn } from '@/lib/utils';

/** Day/night toggle for the header. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
      title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
      className={cn(
        'p-2.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center dark:text-ink dark:bg-white/10 dark:hover:bg-white/15',
        className,
      )}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
