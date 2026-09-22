"use client";

import { motion } from "framer-motion";
import { Sparkles, Package, ShieldCheck, ShoppingCart, Info, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useBundles } from "@/hooks/queries/use-catalog";
import { toNumber } from "@/types/common";
import { useDocumentTitle } from "@/hooks/use-document-title";

const GRADIENTS = [
    "from-blue-600 to-indigo-700",
    "from-amber-500 to-orange-600",
    "from-teal-500 to-emerald-600",
    "from-purple-600 to-pink-700",
    "from-rose-500 to-red-600"
];

export default function BundlesPage() {
    useDocumentTitle('البكجات والعروض');
    const { formatPrice, addToCart } = useCart();
    const { data: bundles = [], isLoading } = useBundles();

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary dark:text-ink animate-spin" />
                <p className="text-gray-400 dark:text-muted font-bold">جاري تحميل العروض الحالية...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 space-y-16">
            <header className="text-right space-y-6 max-w-5xl">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-secondary/10 text-primary dark:text-ink px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-4">
                    <Sparkles size={16} fill="currentColor" />
                    بكجات وعروض MJM
                </motion.div>
                <h1 className="text-4xl lg:text-6xl font-black text-primary dark:text-ink leading-tight">وفر الكثير مع <span className="text-bronze dark:text-secondary">مجموعاتنا المختارة</span> بعناية</h1>
                <p className="text-lg text-gray-500 dark:text-muted font-medium">اخترنا لك أفضل المنتجات في مجموعات اقتصادية توفر عليك الوقت والمال وتغطي جميع احتياجاتك.</p>
            </header>

            {bundles.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <Package size={64} className="mx-auto text-gray-200" />
                    <p className="text-xl font-bold text-gray-400 dark:text-muted">لا توجد بكجات معروضة حالياً. تابعنا للمزيد من العروض قريباً!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {bundles.map((bundle, i) => {
                        const gradient = GRADIENTS[i % GRADIENTS.length];
                        const bundlePrice = toNumber(bundle.bundlePrice);
                        const originalPrice = toNumber(bundle.originalPrice);
                        const hasDiscount = originalPrice > bundlePrice;
                        return (
                            <motion.div
                                key={bundle.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-[40px] blur-3xl transition-opacity duration-500`} />

                                <div className="bg-white dark:bg-card rounded-[40px] border border-primary/10 dark:border-white/10 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col relative z-10 hover:border-secondary/30 transition-all duration-500">
                                    <div className={`bg-gradient-to-br ${gradient} p-10 text-white relative overflow-hidden shrink-0`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-card/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="flex justify-between items-start relative z-10">
                                            <span className="bg-white/20 dark:bg-card/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase border border-white/20">
                                                {bundle.badgeText || "عرض خاص"}
                                            </span>
                                            <Package size={32} className="text-white/30" />
                                        </div>
                                        <div className="mt-6 space-y-2 relative z-10">
                                            <h2 className="text-2xl font-black">{bundle.name}</h2>
                                            <p className="text-white/70 text-sm font-bold line-clamp-2">{bundle.description || "استمتع بتوفير كبير مع هذا البكج المختار."}</p>
                                        </div>
                                    </div>

                                    <div className="p-10 space-y-8 flex-grow">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-bronze dark:text-secondary uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> محتويات البكج
                                            </div>
                                            <div className="space-y-3">
                                                {bundle.items?.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary group-hover/item:scale-150 transition-transform" />
                                                            <span className="text-sm font-bold text-primary dark:text-ink">{item.product?.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-muted px-2 py-1 rounded-md">{item.quantity} حبة</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-primary/5 dark:border-white/10 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="text-2xl font-black text-primary dark:text-ink font-inter">{formatPrice(bundlePrice)}</div>
                                                {hasDiscount && (
                                                    <div className="text-xs text-gray-600 dark:text-muted font-bold line-through font-inter">{formatPrice(originalPrice)}</div>
                                                )}
                                            </div>
                                            {hasDiscount && (
                                                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black">
                                                    وفرت {formatPrice(originalPrice - bundlePrice)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-10 pb-10 mt-auto">
                                        <button
                                            onClick={() => addToCart({
                                                kind: 'bundle',
                                                bundleId: bundle.id,
                                                name: bundle.name,
                                                price: bundlePrice,
                                                image: bundle.imageUrl,
                                            })}
                                            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:bg-secondary hover:text-primary transition-all active:scale-95"
                                        >
                                            <ShoppingCart size={20} />
                                            إضافة البكج للسلة
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <footer className="pt-12 border-t border-primary/5 dark:border-white/10 flex flex-wrap justify-center gap-12 grayscale opacity-50">
                <ShieldCheck size={48} />
                <Package size={48} />
                <Sparkles size={48} />
            </footer>
        </div>
    );
}
