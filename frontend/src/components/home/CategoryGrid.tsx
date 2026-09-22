"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Grid } from "lucide-react";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategories, useProducts } from "@/hooks/queries/use-catalog";
import { categoryColor, categoryIcon, categoryTint } from "@/lib/maps";

export default function CategoryGrid() {
    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { data: productsData } = useProducts({ limit: 100 });
    const loading = isLoadingCategories;

    const categoriesWithCounts = useMemo(() => {
        const products = productsData?.items ?? [];
        return categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return {
                ...cat,
                count,
                IconComponent: categoryIcon(cat.icon),
                colorClass: categoryColor(cat.color),
                tintClass: categoryTint(cat.color),
            };
        });
    }, [productsData, categories]);

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
            className="container mx-auto px-4 py-20 relative"
        >
            <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
                <div className="space-y-4">
                    <motion.div variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-2 text-bronze dark:text-secondary font-bold uppercase tracking-widest text-sm">
                        <Grid size={16} />
                        أقسام المتجر
                    </motion.div>
                    <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-3xl lg:text-5xl font-black text-primary dark:text-ink">تصفح حسب <span className="text-secondary">التصنيف</span></motion.h2>
                </div>
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-primary/15 dark:border-white/15 px-5 py-2.5 text-sm font-bold text-primary dark:text-ink hover:border-secondary hover:text-secondary transition-all">
                        تصفح المتجر بالكامل
                        <ArrowLeftIcon size={16} />
                    </Link>
                </motion.div>
            </div>

            {loading && categories.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-[28px] border border-primary/5 dark:border-white/10 overflow-hidden">
                            <Skeleton className="h-40 w-full rounded-none" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
                    {categoriesWithCounts.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 160 } } }}
                        >
                            <Link
                                href={`/shop?category=${cat.slug}`}
                                className="group flex flex-col h-full rounded-[28px] bg-white dark:bg-card border border-primary/5 dark:border-white/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1.5 hover:border-secondary/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Visual */}
                                <div className={cn("relative h-40 flex items-center justify-center bg-gradient-to-br overflow-hidden", cat.tintClass)}>
                                    <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/40 dark:bg-card/40 dark:bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                                    <Image
                                        src={(cat.image || '/categories/bags.png').replace('/images/categories/', '/categories/')}
                                        alt={cat.name}
                                        width={120}
                                        height={120}
                                        className="h-28 w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2"
                                        loading="lazy"
                                    />
                                    <span className="absolute top-3 right-3 rounded-full bg-primary/70 dark:bg-black/50 text-white backdrop-blur px-2.5 py-1 text-[11px] font-black">
                                        {loading ? "…" : `${cat.count} منتج`}
                                    </span>
                                    <span className="absolute top-3 left-3 rounded-full bg-secondary text-primary p-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowLeftIcon size={16} />
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="flex items-center gap-3 p-4">
                                    <span className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110", cat.colorClass)}>
                                        <cat.IconComponent size={22} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-black text-primary dark:text-ink group-hover:text-secondary transition-colors truncate">{cat.name}</span>
                                        <span className="block text-[11px] font-bold text-gray-400 dark:text-muted mt-0.5">تسوق الآن</span>
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}
