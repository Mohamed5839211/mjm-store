'use client';

import { AnimatePresence, motion } from "framer-motion";
import { BadgePercent, Sparkles, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useCmsSettings } from "@/hooks/queries/use-catalog";

const ROTATE_EVERY_MS = 4000;

// CMS texts are editor-written and may contain emojis — strip them so the
// bar keeps a clean, iconic look regardless of stored content.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

function cleanText(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

function iconKindFor(text: string): 'truck' | 'badge' | 'zap' | 'sparkles' {
  if (/شحن|توصيل/.test(text)) return 'truck';
  if (/خصم|تخفيض|%/.test(text)) return 'badge';
  if (/سريع|24|عاجل/.test(text)) return 'zap';
  return 'sparkles';
}

/**
 * Fixed utility bar pinned to the very top of the viewport (above the
 * floating header pill, so the two can never overlap). Rotates one offer at
 * a time with a soft fade instead of a marquee.
 */
export default function AnnouncementBar() {
  const { data: settings } = useCmsSettings();
  const [index, setIndex] = useState(0);

  const announcements = Array.isArray(settings?.announcements)
    ? (settings.announcements as string[]).map(cleanText).filter(Boolean)
    : [];

  useEffect(() => {
    if (announcements.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, ROTATE_EVERY_MS);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[index % announcements.length];
  const kind = iconKindFor(current);

  return (
    <div
      role="region"
      aria-label="إعلانات وعروض المتجر"
      className="fixed top-0 inset-x-0 z-[70] h-9 bg-gradient-to-l from-primary via-[#24365c] to-primary text-white overflow-hidden"
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-secondary/20 border border-secondary/30 px-2.5 py-0.5 text-[10px] font-black text-secondary">
          <Sparkles size={11} aria-hidden="true" />
          عروض MJM
        </span>
        <div className="relative h-full flex-1 sm:flex-none flex items-center justify-center overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${index}-${current}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 text-[11px] sm:text-xs font-bold whitespace-nowrap truncate"
            >
              {kind === 'truck' ? (
                <Truck size={14} className="text-secondary shrink-0" aria-hidden="true" />
              ) : kind === 'badge' ? (
                <BadgePercent size={14} className="text-secondary shrink-0" aria-hidden="true" />
              ) : kind === 'zap' ? (
                <Zap size={14} className="text-secondary shrink-0" aria-hidden="true" />
              ) : (
                <Sparkles size={14} className="text-secondary shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{current}</span>
            </motion.p>
          </AnimatePresence>
        </div>
        {announcements.length > 1 && (
          <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
            {announcements.map((_, i) => (
              <span
                key={i}
                className={
                  i === index % announcements.length
                    ? "w-4 h-1 rounded-full bg-secondary transition-all"
                    : "w-1 h-1 rounded-full bg-white/30 transition-all"
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
