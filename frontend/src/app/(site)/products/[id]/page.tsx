"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Share2, ShieldCheck, Truck, RefreshCcw, Star, Plus, Minus, Package, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useProduct, useProducts } from "@/hooks/queries/use-catalog";
import { toNumber } from "@/types/common";
import { getMediaUrl } from "@/lib/media";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { ProductImage } from "@/types/catalog";

type ProductTab = "desc" | "specs" | "shipping";

const DEFAULT_FEATURES = [
    "متانة استثنائية للاستخدامات الشاقة",
    "جودة تصنيع بمعايير عالمية",
    "سهولة في الاستخدام والتخزين",
    "صديقة للبيئة وقابلة للتدوير",
    "ضمان MJM للجودة"
];

export default function ProductDetailPage() {
    const params = useParams();
    const idParam = params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { addToCart, formatPrice } = useCart();

    const { data: product, isLoading, isError } = useProduct(id);
    const { data: relatedData } = useProducts({ limit: 5 });

    useDocumentTitle(product ? product.name : 'تفاصيل المنتج');

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<ProductTab>("desc");
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-white/5">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (isError || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 space-y-6">
            <h1 className="text-2xl font-black text-primary dark:text-ink">عذراً، المنتج غير موجود</h1>
            <Link href="/" className="text-secondary font-bold underline">العودة للرئيسية</Link>
        </div>
    );

    const relatedProducts = (relatedData?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);
    const price = toNumber(product.price);
    const discountPrice = product.discountPrice != null ? toNumber(product.discountPrice) : null;
    const discountPercent = discountPrice != null && price > 0
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0;
    const gallery: (ProductImage | null)[] = product.images?.length > 0
        ? product.images
        : [null, null, null, null];

    const handleAddToCart = () => {
        setAddedToCart(true);
        addToCart({
            kind: 'product',
            productId: product.id,
            name: product.name,
            price,
            discountPrice,
            image: getMediaUrl(product.images?.[0]?.url),
            category: product.category?.name ?? undefined,
        }, quantity);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="container mx-auto px-4 py-12"
        >
            {/* Breadcrumbs */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-gray-600 dark:text-muted mb-8 font-bold uppercase tracking-wider">
                <Link href="/shop" className="hover:text-primary dark:hover:text-secondary transition-colors">المتجر</Link>
                <span>/</span>
                <Link href={`/shop?category=${product.category?.slug}`} className="hover:text-primary dark:hover:text-secondary transition-colors">{product.category?.name || "عام"}</Link>
                <span>/</span>
                <span className="text-bronze dark:text-secondary">{product.name}</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Product Gallery */}
                <motion.div variants={fadeUp} className="space-y-6">
                    <motion.div
                        className="aspect-square bg-white dark:bg-card rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 flex items-center justify-center p-12 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeImage}
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                transition={{ duration: 0.4 }}
                                className="relative z-10 w-full h-full flex items-center justify-center text-primary/10 dark:text-ink/10"
                            >
                                {product.images?.[activeImage]?.url ? (
                                    <Image src={product.images[activeImage].url} alt={product.name} width={500} height={500} className="w-full h-full object-contain" priority />
                                ) : (
                                    <Package size={200} strokeWidth={0.5} className="group-hover:scale-110 transition-transform duration-700" />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute top-8 left-8 flex flex-col gap-4 z-20">
                            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label={`أضف ${product.name} إلى المفضلة`} className="w-12 h-12 bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 dark:text-muted hover:text-red-500 shadow-sm border border-black/5 dark:border-white/10 hover:shadow-xl transition-all">
                                <Heart size={24} aria-hidden="true" />
                            </motion.button>
                            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="مشاركة المنتج" className="w-12 h-12 bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 dark:text-muted hover:text-primary shadow-sm border border-black/5 dark:border-white/10 hover:shadow-xl transition-all">
                                <Share2 size={24} aria-hidden="true" />
                            </motion.button>
                        </div>

                        {/* Special Offer Badge */}
                        <div className="absolute top-8 right-8 flex flex-col items-end gap-2 z-20">
                            {discountPercent > 0 && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", delay: 0.5 }}
                                    className="bg-accent text-primary font-black px-6 py-2 rounded-2xl shadow-xl shadow-accent/20 rotate-12"
                                >
                                    وفر {discountPercent}%
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-4 gap-4">
                        {gallery.map((img, i) => (
                            <motion.div 
                                key={i} 
                                onClick={() => setActiveImage(i)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "aspect-square bg-white dark:bg-card rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center text-primary/10 dark:text-ink/10 relative overflow-hidden", 
                                    activeImage === i ? "border-secondary shadow-lg shadow-secondary/10" : "border-primary/5 dark:border-white/10 hover:border-secondary/50 opacity-70 hover:opacity-100"
                                )}
                            >
                                {img?.url ? (
                                    <Image src={img.url} alt={product.name} width={100} height={100} className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={32} className="relative z-10" />
                                )}
                                {activeImage === i && (
                                    <motion.div layoutId="activeThumbnailBg" className="absolute inset-0 bg-secondary/5" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Product Info */}
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-secondary/10 text-bronze dark:text-secondary px-4 py-2 rounded-full text-sm font-bold">
                            <Star size={16} fill="currentColor" />
                            الأكثر مبيعاً في الأسبوع
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-primary dark:text-ink leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-muted font-bold border-r border-gray-200 dark:border-white/10 pr-4">42 تقييم</span>
                            <span className="text-sm text-bronze dark:text-secondary font-bold">في المخزن ✓</span>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[32px] border border-primary/5 dark:border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                            {discountPrice != null && (
                                <span className="text-lg text-gray-600 dark:text-muted line-through font-bold">{formatPrice(price)}</span>
                            )}
                            <div className="text-4xl lg:text-5xl font-black text-primary dark:text-ink">{formatPrice(discountPrice ?? price)}</div>
                            <div className="text-xs text-gray-500 dark:text-muted font-medium">* السعر شامل ضريبة القيمة المضافة</div>
                        </div>

                        <div className="text-left">
                            <div className="text-xs uppercase tracking-widest text-bronze dark:text-secondary font-black mb-1">SKU</div>
                            <div className="font-bold text-primary dark:text-ink">{product.sku}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Quantity Picker */}
                        <div className="bg-white dark:bg-card border-2 border-primary/5 dark:border-white/10 rounded-2xl p-2 flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                aria-label="إنقاص الكمية"
                                className="w-10 h-10 bg-gray-50 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                <Minus size={20} aria-hidden="true" />
                            </button>
                            <span className="text-xl font-black w-8 text-center">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                aria-label="زيادة الكمية"
                                className="w-10 h-10 bg-gray-50 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={20} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                            className={cn(
                                "flex-grow py-5 px-10 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                                addedToCart ? "bg-accent text-primary shadow-accent/20" : "bg-primary text-white shadow-primary/20 hover:bg-secondary hover:text-primary hover:shadow-secondary/20"
                            )}
                        >
                            {addedToCart ? (
                                <>
                                    <Check size={28} />
                                    تمت الإضافة للسلة
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={28} />
                                    أضف للسلة
                                </>
                            )}
                        </button>
                    </div>

                    {/* Features / Selling Points */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 border-y border-primary/5 dark:border-white/10">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl border border-primary/5 dark:border-white/10 flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                <Truck size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-primary dark:text-ink">توصيل سريع</div>
                                <div className="text-xs text-gray-500 dark:text-muted">خلال 24-48 ساعة بالرياض</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl border border-primary/5 dark:border-white/10 flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-primary dark:text-ink">دفع آمن</div>
                                <div className="text-xs text-gray-500 dark:text-muted">مدى، فيزا، تابل، تابي</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl border border-primary/5 dark:border-white/10 flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                <RefreshCcw size={24} />
                            </div>
                            <div>
                                <div className="font-bold text-primary dark:text-ink">إرجاع سهل</div>
                                <div className="text-xs text-gray-500 dark:text-muted">خلال 7 أيام من الاستلام</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Detailed Info */}
            <section className="py-20 mt-20 border-t border-primary/5 dark:border-white/10">
                <div className="flex flex-wrap justify-center border-b border-primary/5 dark:border-white/10 gap-12 mb-12">
                    {(
                        [
                            { id: "desc", name: "وصف المنتج" },
                            { id: "specs", name: "المواصفات الفنية" },
                            { id: "shipping", name: "سياسة التوصيل" },
                        ] as { id: ProductTab; name: string }[]
                    ).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-4 text-lg font-black transition-all relative",
                                activeTab === tab.id ? "text-primary dark:text-ink" : "text-gray-600 dark:text-muted hover:text-primary"
                            )}
                        >
                            {tab.name}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl mx-auto"
                    >
                        {activeTab === "desc" && (
                            <div className="space-y-10">
                                <p className="text-lg text-gray-600 dark:text-muted leading-relaxed text-center">{product.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-primary/5 dark:bg-white/5 p-10 rounded-[32px] space-y-6">
                                        <h2 className="text-xl font-black text-primary dark:text-ink">المميزات الرئيسية</h2>
                                        <ul className="space-y-4">
                                            {DEFAULT_FEATURES.map((f, i) => (
                                                <li key={i} className="flex items-center gap-4 text-gray-700 dark:text-muted font-medium">
                                                    <div className="w-6 h-6 bg-secondary text-primary rounded-lg flex items-center justify-center shrink-0">
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white dark:bg-card border-2 border-primary/5 dark:border-white/10 p-10 rounded-[32px] flex items-center justify-center">
                                        <Package size={120} strokeWidth={0.5} className="text-primary/10 dark:text-ink/10" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "specs" && (
                            <div className="bg-white dark:bg-card rounded-[32px] overflow-hidden border border-primary/5 dark:border-white/10">
                                <table className="w-full text-right">
                                    <tbody>
                                        {[
                                            { label: "رقم الموديل", value: product.sku },
                                            { label: "التصنيف", value: product.category?.name || "عام" },
                                            { label: "حالة المنتج", value: product.isActive ? "متوفر" : "غير متوفر" },
                                            { label: "الوزن التقريبي", value: "حسب المقاس" },
                                            { label: "المنشأ", value: "صناعة سعودية فخورة" }
                                        ].map((spec, i) => (
                                            <tr key={i} className={cn(i % 2 === 0 ? "bg-gray-50 dark:bg-white/5" : "bg-white dark:bg-card")}>
                                                <td className="py-6 px-8 font-black text-primary dark:text-ink w-1/3 border-l border-primary/5 dark:border-white/10">{spec.label}</td>
                                                <td className="py-6 px-8 text-gray-600 dark:text-muted font-medium">{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeTab === "shipping" && (
                            <div className="bg-white dark:bg-card p-12 rounded-[32px] border border-primary/5 dark:border-white/10 space-y-8 text-center">
                                <Truck size={64} className="mx-auto text-secondary mb-4" />
                                <h4 className="text-2xl font-black text-primary dark:text-ink">معلومات الشحن والتوصيل</h4>
                                <p className="text-gray-600 dark:text-muted max-w-xl mx-auto leading-relaxed">نقوم بشحن جميع الطلبات خلال 24 ساعة من تأكيد الدفع. التوصيل داخل الرياض يتم في نفس اليوم أو اليوم التالي. باقي مناطق المملكة يتم التوصيل خلال 3-5 أيام عمل عبر شركائنا (أرامكس، سعي).</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </section>

            {/* Suggested Products */}
            <section className="py-20 mt-20 border-t border-primary/5 dark:border-white/10">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl lg:text-4xl font-black text-primary dark:text-ink">منتجات قد <span className="text-bronze dark:text-secondary">تعجبك</span></h2>
                    <Link href="/categories" className="text-primary dark:text-ink font-bold hover:text-secondary underline underline-offset-8">مشاهدة الكل</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {relatedProducts.length > 0 ? relatedProducts.map((p) => (
                        <ProductCard
                            key={p.id}
                            id={p.id}
                            name={p.name}
                            price={toNumber(p.price)}
                            discountPrice={p.discountPrice != null ? toNumber(p.discountPrice) : undefined}
                            image={p.images?.[0]?.url}
                            category={p.category?.name ?? undefined}
                        />
                    )) : (
                        <div className="col-span-full py-10 text-center text-gray-400 dark:text-muted font-bold italic">لا توجد منتجات مشابهة حالياً</div>
                    )}
                </div>
            </section>
        </motion.div>
    );
}
