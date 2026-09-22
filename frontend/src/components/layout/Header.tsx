"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Search, Menu, X, Package, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCmsSettings } from "@/hooks/queries/use-catalog";
import { fetchProducts } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/query/client";
import { getMediaUrl } from "@/lib/media";
import { matchesNormalized } from "@/lib/normalize-ar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toNumber } from "@/types/common";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoMark } from "@/components/layout/logo";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
    { name: "الرئيسية", href: "/" },
    { name: "المتجر", href: "/shop" },
    { name: "البكجات", href: "/bundles" },
];

/** Brand name shown in the header (Latin-only by design). */
const BRAND_NAME = "MJM Store";

function SearchField({ autoFocus = false, solid, onNavigate, idSuffix = "" }: { autoFocus?: boolean; solid: boolean; onNavigate?: () => void; idSuffix?: string }) {
    const router = useRouter();
    const { formatPrice } = useCart();
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);
    const debounced = useDebouncedValue(query, 300);
    const term = debounced.trim();
    // Unique combobox/listbox ids per instance: the desktop field and the
    // mobile-menu field are mounted together, so shared ids would duplicate
    // ARIA references (axe `duplicate-id-aria`).
    const inputId = `search-query${idSuffix}`;
    const resultsId = `search-results${idSuffix}`;

    // One shared cached fetch; filtering is local + Arabic-normalized
    // (hamza-insensitive), so it never depends on DB collation.
    const { data, isFetching } = useQuery({
        queryKey: [...queryKeys.products, 'suggest'],
        queryFn: () => fetchProducts({ limit: 100 }),
        enabled: term.length >= 2,
        staleTime: 10 * 60_000,
        gcTime: 30 * 60_000,
    });

    const results = useMemo(() => {
        if (term.length < 2) return [];
        const items = data?.items ?? [];
        return items
            .filter((p) => matchesNormalized(p.name, term) || matchesNormalized(p.sku, term))
            .slice(0, 6);
    }, [data, term]);

    const showPanel = open && focused && term.length >= 2;

    const go = (href: string) => {
        setOpen(false);
        setQuery("");
        onNavigate?.();
        router.push(href);
    };

    return (
        <div className="relative group w-full">
            <label htmlFor={inputId} className="sr-only">
                ابحث عن منتج، كرتون، أكياس...
            </label>
            <input
                id={inputId}
                name="search"
                type="text"
                role="combobox"
                aria-expanded={showPanel}
                aria-controls={resultsId}
                placeholder="ابحث عن منتج، كرتون، أكياس..."
                autoComplete="off"
                autoFocus={autoFocus}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => { setFocused(true); setOpen(true); }}
                onBlur={() => setFocused(false)}
                className={cn(
                    "w-full backdrop-blur-sm border rounded-full py-2.5 px-12 text-sm outline-none transition-all font-medium relative z-10",
                    solid
                        ? "bg-gray-100/80 dark:bg-white/10 border-transparent focus:bg-white dark:focus:bg-card focus:border-secondary/30 focus:shadow-lg focus:shadow-secondary/10 text-primary dark:text-ink placeholder:text-gray-400 dark:placeholder:text-muted"
                        : "bg-white/10 border-white/20 focus:bg-white/15 focus:border-white/30 text-white placeholder:text-white/50"
                )}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const val = (e.currentTarget as HTMLInputElement).value.trim();
                        go(val ? `/shop?search=${encodeURIComponent(val)}` : "/shop");
                    } else if (e.key === "Escape") {
                        setOpen(false);
                    }
                }}
            />
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-20 pointer-events-none", solid ? "text-gray-400 dark:text-muted group-focus-within:text-secondary" : "text-white/60 group-focus-within:text-white")} size={18} />
            {isFetching && term.length >= 2 && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-secondary z-20 pointer-events-none" />
            )}

            {showPanel && (
                <>
                    <div className="fixed inset-0 z-40 cursor-default" onMouseDown={() => setOpen(false)} aria-hidden="true" />
                        <div
                            id={resultsId}
                            role="listbox"
                        className="absolute top-full mt-2 inset-x-0 z-[60] rounded-2xl bg-white dark:bg-card border border-primary/10 dark:border-white/10 shadow-2xl shadow-primary/10 overflow-hidden"
                    >
                        {results.length > 0 ? (
                            <ul className="max-h-80 overflow-y-auto p-2">
                                {results.map((p) => {
                                    const img = getMediaUrl(p.images?.[0]?.url);
                                    const price = p.discountPrice != null ? toNumber(p.discountPrice) : toNumber(p.price);
                                    return (
                                        <li key={p.id} role="option" aria-selected="false">
                                            <button
                                                type="button"
                                                onMouseDown={(e) => { e.preventDefault(); go(`/products/${p.id}`); }}
                                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 dark:hover:bg-white/10 transition-colors text-right"
                                            >
                                                <span className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0 text-primary/30 dark:text-muted">
                                                    {img ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <Image src={img} alt="" width={44} height={44} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="block text-sm font-bold text-primary dark:text-ink truncate">{p.name}</span>
                                                    <span className="block text-[11px] text-gray-400 dark:text-muted font-inter" dir="ltr">{p.sku}</span>
                                                </span>
                                                <span className="text-sm font-black text-secondary shrink-0">{formatPrice(price)}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : !isFetching ? (
                            <p className="px-4 py-6 text-center text-sm font-bold text-gray-400 dark:text-muted">
                                لا توجد نتائج مطابقة — جرّب كلمة أخرى
                            </p>
                        ) : (
                            <p className="px-4 py-6 text-center text-sm font-bold text-gray-400 dark:text-muted">
                                جاري البحث...
                            </p>
                        )}
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); go(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop"); }}
                            className="w-full px-4 py-3 text-center text-xs font-black text-bronze dark:text-secondary hover:bg-secondary/10 transition-colors border-t border-primary/5 dark:border-white/10"
                        >
                            عرض كل النتائج في المتجر
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Header() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const { data: branding } = useCmsSettings();
    const logoUrl = typeof branding?.logoUrl === 'string' ? branding.logoUrl : undefined;
    // CMS may point at a missing file (e.g. the default "/logo.png").
    // Fall back to the designed mark if the image fails to load.
    const [logoBroken, setLogoBroken] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Scroll subscription (external system): toggles the glass pill.
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Transparent only over the homepage's dark hero; every other page
    // starts with the glass pill (their tops are light backgrounds where
    // white header text would vanish).
    const solid = isScrolled || menuOpen || pathname !== '/';

    const accountLabel = !user
        ? "دخول"
        : `${user.name.split(' ')[0]}${isAdmin ? ' (أدمن)' : ''}`;
    const accountHref = !user ? "/auth/login" : isAdmin ? "/admin" : "/profile";

    const iconBtn = cn(
        "p-2.5 rounded-full relative transition-colors flex items-center justify-center",
        solid
            ? "text-primary dark:text-ink bg-primary/5 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-white/10"
            : "text-white bg-white/10 hover:bg-white/20"
    );

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={cn(
                "fixed top-[52px] left-4 right-4 max-w-7xl mx-auto z-50 transition-all duration-500 rounded-full",
                solid
                    ? "bg-white/80 dark:bg-card/80 backdrop-blur-2xl shadow-2xl shadow-primary/10 py-3 px-4 sm:px-6 border border-white/50 dark:border-white/10"
                    : "bg-transparent py-3 px-4 sm:px-6 border border-white/30 shadow-lg shadow-black/10"
            )}
        >
            <div className="relative w-full flex items-center gap-3 lg:gap-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="MJM Store - الرئيسية">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-gradient-to-br from-primary to-[#2a3d66] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {logoUrl && !logoBroken ? (
                            // Decorative: the link already carries aria-label + the brand
                            // name as adjacent text (axe `image-redundant-alt`).
                            <Image src={logoUrl} alt="" width={40} height={40} onError={() => setLogoBroken(true)} className="w-full h-full object-contain p-1" />
                        ) : (
                            <LogoMark size={26} />
                        )}
                    </motion.div>
                    <div className="hidden md:block leading-none">
                        <span className={cn("block text-base font-black tracking-tight transition-colors font-inter", solid ? "text-primary dark:text-ink" : "text-white")} dir="ltr">{BRAND_NAME}</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="relative hidden lg:flex items-center gap-1 shrink-0" onMouseLeave={() => setHoveredLink(null)} aria-label="التنقل الرئيسي">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onMouseEnter={() => setHoveredLink(link.name)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-bold transition-colors hover:text-secondary dark:hover:text-secondary",
                                solid ? "text-primary dark:text-ink" : "text-white/90"
                            )}
                        >
                            {link.name}
                            {pathname === link.href && (
                                <motion.div layoutId="active-nav" className="absolute bottom-0 left-4 right-4 h-0.5 bg-secondary rounded-full" />
                            )}
                            <AnimatePresence>
                                {hoveredLink === link.name && (
                                    <motion.div
                                        layoutId="hover-nav"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        className={cn("absolute inset-0 rounded-full -z-10", solid ? "bg-primary/5 dark:bg-white/5" : "bg-white/10")}
                                    />
                                )}
                            </AnimatePresence>
                        </Link>
                    ))}

                    <Link href="/custom-printing" className={cn("relative group px-4 py-2 text-sm font-black flex items-center gap-2 overflow-hidden rounded-full border transition-colors ms-1", solid ? "text-teal-800 dark:text-accent border-teal-800/20 dark:border-accent/20 hover:border-teal-800/50 bg-teal-800/5 dark:bg-accent/5" : "text-accent border-accent/20 hover:border-accent/50 bg-accent/5")}>
                        <Package size={16} className="group-hover:rotate-12 transition-transform" />
                        <span>طباعة B2B</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </Link>
                </nav>

                {/* Search Bar Desktop */}
                <div className="hidden lg:block flex-1 max-w-md">
                    <SearchField solid={solid} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3 ms-auto">
                    <ThemeToggle className={cn(!solid && "bg-white/10 text-white hover:bg-white/20")} />

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/cart" aria-label="سلة التسوق" className={iconBtn}>
                            <ShoppingCart size={22} />
                            <AnimatePresence>
                                {itemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 bg-gradient-to-br from-secondary to-orange-500 text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-card"
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </motion.div>

                    <Link
                        href={accountHref}
                        aria-label={accountLabel}
                        className={cn(
                            "group relative flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-full text-sm font-bold transition-all shadow-xl active:scale-95 overflow-hidden",
                            isAdmin
                                ? "bg-accent text-primary shadow-accent/20 hover:bg-accent/80"
                                : "bg-primary text-white shadow-primary/20 hover:bg-secondary hover:text-primary"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <User size={18} className="relative z-10" />
                        <span className="hidden sm:inline relative z-10">{accountLabel}</span>
                    </Link>

                    {/* Mobile menu button (functional) */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        className={iconBtn + " lg:hidden"}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown panel */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden absolute top-full inset-x-0 mt-3 rounded-3xl bg-white dark:bg-card border border-primary/10 dark:border-white/10 shadow-2xl shadow-primary/10 p-4 space-y-2 overflow-hidden"
                    >
                        <div className="pb-2">
                            <SearchField autoFocus={false} solid idSuffix="-mobile" onNavigate={() => setMenuOpen(false)} />
                        </div>
                        {[...NAV_LINKS, { name: "طباعة B2B", href: "/custom-printing" }, { name: "تواصل معنا", href: "/contact" }].map((link) => (
                            <Link
                                key={link.href + link.name}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-colors",
                                    pathname === link.href
                                        ? "bg-primary/5 dark:bg-white/10 text-primary dark:text-ink"
                                        : "text-gray-600 dark:text-muted hover:bg-primary/5 dark:hover:bg-white/5"
                                )}
                            >
                                {link.name}
                                <span className={cn("w-1.5 h-1.5 rounded-full", pathname === link.href ? "bg-secondary" : "bg-transparent")} />
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
