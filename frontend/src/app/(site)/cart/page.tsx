"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Package, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";



import { useCart } from "@/context/CartContext";
import { useCmsSettings } from "@/hooks/queries/use-catalog";
import { toNumber } from "@/types/common";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { LocalCartItem } from "@/types/commerce";

const CartItemComponent = ({ item, updateQuantity, removeFromCart }: { item: LocalCartItem; updateQuantity: (id: string, delta: number) => void; removeFromCart: (id: string) => void }) => {
    const [imgError, setImgError] = useState(false);
    const { formatPrice } = useCart();

    return (
        <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-card rounded-3xl p-6 shadow-xl shadow-primary/5 border border-primary/5 dark:border-white/10 flex items-center gap-6 group hover:border-secondary transition-colors"
        >
            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary/10 dark:text-ink/10 shrink-0 overflow-hidden">
                {item.image && !imgError ? (
                    <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={96}
                        height={96}
                        className="w-full h-full object-contain p-2" 
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <Package size={48} />
                )}
            </div>

            <div className="flex-grow space-y-2">
                <div className="text-[10px] font-bold text-bronze dark:text-secondary uppercase tracking-widest">{item.category}</div>
                <h2 className="font-bold text-primary dark:text-ink group-hover:text-secondary transition-colors">{item.name}</h2>
                <div className="text-sm font-black text-primary dark:text-ink">{formatPrice(item.price)}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-1 flex items-center gap-4 border border-primary/5 dark:border-white/10">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={`إنقاص كمية ${item.name}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-primary dark:text-ink hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all"><Minus size={16} aria-hidden="true" /></button>
                    <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`زيادة كمية ${item.name}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-primary dark:text-ink hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all"><Plus size={16} aria-hidden="true" /></button>
                </div>

                <div className="text-right min-w-[100px]">
                    <div className="text-xs text-gray-600 dark:text-muted font-bold mb-1">المجموع</div>
                    <div className="font-black text-primary dark:text-ink">{formatPrice(item.price * item.quantity)}</div>
                </div>

                <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`حذف ${item.name} من السلة`}
                    className="p-3 text-gray-300 dark:text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all rounded-xl"
                >
                    <Trash2 size={20} aria-hidden="true" />
                </button>
            </div>
        </motion.div>
    );
};

export default function CartPage() {
    useDocumentTitle('سلة التسوق');
    const { user } = useAuth();
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, subtotal, formatPrice } = useCart();
    const { data: cmsSettings } = useCmsSettings();
    const [promoCode, setPromoCode] = useState("");

    const freeShippingEnabled = cmsSettings?.freeShippingEnabled === true;
    const threshold = toNumber(cmsSettings?.freeShippingThreshold, 299);
    const isFreeShipping = freeShippingEnabled && subtotal >= threshold;
    const shippingFee = isFreeShipping ? 0 : 25;
    const total = subtotal + shippingFee;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center space-y-8">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-32 h-32 bg-primary/5 dark:bg-white/5 text-primary/20 dark:text-ink/20 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag size={64} />
                </motion.div>
                <div className="space-y-4">
                    <h1 className="text-3xl lg:text-5xl font-black text-primary dark:text-ink">سلة المشتريات <span className="text-bronze dark:text-secondary">فارغة</span></h1>
                    <p className="text-gray-500 dark:text-muted text-lg">يبدو أنك لم تضف أي منتجات إلى سلتك بعد. ابدأ التسوق الآن واكتشف عروضنا!</p>
                </div>
                <Link href="/shop" className="bg-primary text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-primary/20 inline-flex items-center gap-3">
                    تصفح المتجر
                    <ArrowRight size={20} className="rotate-180" />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Cart List */}
                <div className="flex-grow space-y-6">
                    <div className="flex justify-between items-end mb-8">
                        <h1 className="text-3xl lg:text-4xl font-black text-primary dark:text-ink">سلة <span className="text-bronze dark:text-secondary">التسوق</span></h1>
                        <span className="text-gray-500 dark:text-muted font-bold">{items.length} منتجات في السلة</span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {items.map((item) => (
                                <CartItemComponent 
                                    key={item.id} 
                                    item={item} 
                                    updateQuantity={updateQuantity} 
                                    removeFromCart={removeFromCart} 
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Free Shipping Progress */}
                    {freeShippingEnabled && (
                        <div className="bg-primary/5 dark:bg-white/5 rounded-[32px] p-8 border border-primary/5 dark:border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-primary dark:text-ink flex items-center gap-2">
                                    <Truck size={18} className="text-secondary" />
                                    {subtotal >= threshold ? "لقد حصلت على شحن مجاني!" : `تحتاج إلى ${formatPrice(threshold - subtotal)} إضافية للشحن المجاني`}
                                </span>
                                <span className="text-bronze dark:text-secondary">{formatPrice(threshold)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
                                    className="h-full bg-secondary rounded-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Card */}
                <aside className="lg:w-96 w-full lg:sticky lg:top-28 space-y-6">
                    <div className="bg-white dark:bg-card rounded-[40px] p-8 lg:p-10 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-8">
                        <h2 className="text-2xl font-black text-primary dark:text-ink">ملخص <span className="text-bronze dark:text-secondary">الطلب</span></h2>

                        <div className="space-y-4 border-b border-primary/5 dark:border-white/10 pb-8">
                            <div className="flex justify-between items-center text-gray-500 dark:text-muted font-bold">
                                <span>المجموع الفرعي</span>
                                <span className="font-black text-primary dark:text-ink">{formatPrice(subtotal)}</span>
                            </div>
                             <div className="flex justify-between items-center text-gray-500 dark:text-muted font-bold">
                                <span>رسوم الشحن</span>
                                <span className={cn("font-black", isFreeShipping ? "text-green-500" : "text-primary dark:text-ink")}>
                                    {isFreeShipping ? "مجاني" : formatPrice(shippingFee)}
                                </span>
                            </div>
                        </div>

                        {/* Promo Code */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary dark:text-ink font-bold text-sm">
                                <Tag size={16} className="text-secondary" />
                                لديك كوبون خصم؟
                            </div>
                            <div className="flex gap-2">
                                <label htmlFor="promo-code" className="sr-only">كود الخصم</label>
                                <input
                                    id="promo-code"
                                    type="text"
                                    placeholder="أدخل الكود"
                                    className="flex-grow bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-sm text-center font-inter text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                />
                                <button type="button" className="bg-gray-100 dark:bg-white/10 text-primary dark:text-ink px-6 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">تطبيق</button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xl font-black text-primary dark:text-ink">الإجمالي</span>
                            <span className="text-3xl font-black text-bronze dark:text-secondary">{formatPrice(total)}</span>
                        </div>

                        <button 
                            onClick={() => {
                                if (!user) {
                                    router.push('/auth/login?redirect=/checkout');
                                } else {
                                    router.push('/checkout');
                                }
                            }}
                            className="block w-full bg-primary text-white py-5 rounded-[24px] font-black text-xl text-center hover:bg-secondary hover:text-primary transition-all shadow-2xl shadow-primary/20 hover:shadow-secondary/20 active:scale-95"
                        >
                            إتمام الشراء
                        </button>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-600 dark:text-muted font-bold grayscale hover:grayscale-0 transition-all">
                        <ShieldCheck size={16} />
                        <span>تسوق آمن ومدفوعات مشفرة 100%</span>
                    </div>
                </aside>
            </div>
        </div>
    );
}
