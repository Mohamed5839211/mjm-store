"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, CreditCard, Truck, ChevronLeft, ShieldCheck, ArrowRight, Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAddresses, useCheckout } from "@/hooks/queries/use-commerce";
import { useCmsSettings } from "@/hooks/queries/use-catalog";
import { toNumber } from "@/types/common";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { paymentMethodLabel } from "@/lib/maps";
import toast from "react-hot-toast";
import type { LocalCartItem, Order, PaymentMethod } from "@/types/commerce";

type CheckoutStep = "address" | "shipping" | "payment" | "success";

const PAYMENT_METHODS: PaymentMethod[] = ["mada", "visa", "apple_pay", "tamara", "cod"];

const CheckoutSummaryItem = ({ item }: { item: LocalCartItem }) => {
    const [imgError, setImgError] = useState(false);
    const { formatPrice } = useCart();

    return (
        <div className="flex gap-4 group">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary/10 dark:text-ink/10 group-hover:bg-primary/5 transition-colors shrink-0 overflow-hidden">
                {item.image && !imgError ? (
                    <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-2" 
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <Package size={32} />
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-xs font-bold text-primary dark:text-ink line-clamp-1">{item.name}</h3>
                <p className="text-[10px] text-gray-600 dark:text-muted font-bold">الكمية: {item.quantity}</p>
                {item.discountPrice && (
                    <span className="text-xs text-gray-600 dark:text-muted line-through font-medium">{formatPrice(item.price)}</span>
                )}
                <span className="text-sm font-black text-bronze dark:text-secondary">{formatPrice(item.discountPrice || item.price)}</span>
            </div>
        </div>
    );
};

export default function CheckoutPage() {
    useDocumentTitle('إتمام الشراء');
    const { user } = useAuth();
    const router = useRouter();
    const { items, subtotal, clearCart, formatPrice } = useCart();
    const { data: cmsSettings } = useCmsSettings();
    const [step, setStep] = useState<CheckoutStep>("address");
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("mada");
    const [orderData, setOrderData] = useState<Order | null>(null);

    const freeShippingEnabled = cmsSettings?.freeShippingEnabled === true;
    const threshold = toNumber(cmsSettings?.freeShippingThreshold, 299);
    const isFreeShipping = freeShippingEnabled && subtotal >= threshold;
    const shippingFee = isFreeShipping ? 0 : 25;

    // VAT Calculation
    const vatRate = toNumber(cmsSettings?.vatRate, 0);
    const taxAmount = subtotal * (vatRate / 100);
    const total = subtotal + shippingFee + taxAmount;

    const steps = [
        { id: "address", name: "عنوان التوصيل", icon: MapPin },
        { id: "shipping", name: "طريقة الشحن", icon: Truck },
        { id: "payment", name: "الدفع والطلب", icon: CreditCard },
        { id: "success", name: "تأكيد الطلب", icon: Check },
    ];

    useEffect(() => {
        if (!user) {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [user, router]);

    const { data: addresses = [] } = useAddresses();

    // The chosen address is a user override; when untouched it falls back to
    // the default (or first) address. Derived during render — no sync effect.
    const defaultAddressId = addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
    const activeAddressId = selectedAddressId ?? defaultAddressId;

    const checkoutMutation = useCheckout();

    const handleNext = () => {
        if (step === "address") {
            if (activeAddressId == null) {
                toast.error("يرجى اختيار عنوان توصيل");
                return;
            }
            setStep("shipping");
        }
        else if (step === "shipping") setStep("payment");
        else if (step === "payment") {
            if (activeAddressId == null) {
                toast.error("يرجى اختيار عنوان توصيل");
                return;
            }
            checkoutMutation.mutate(
                {
                    shippingAddressId: activeAddressId,
                    paymentMethod: selectedPayment,
                    items: items.map((item) => ({
                        ...(item.productId != null ? { productId: item.productId } : {}),
                        ...(item.bundleId != null ? { bundleId: item.bundleId } : {}),
                        quantity: item.quantity,
                    })),
                },
                {
                    onSuccess: (order) => {
                        setOrderData(order);
                        clearCart();
                        setStep("success");
                        toast.success("تم إنشاء طلبك بنجاح");
                    },
                    onError: (error) => {
                        toast.error(toErrorMessage(error, "فشل إتمام الطلب، يرجى المحاولة مرة أخرى"));
                    },
                },
            );
        }
    };

    const isPlacingOrder = checkoutMutation.isPending;

    if (step === "success") {
        return (
            <div className="container mx-auto px-4 py-32 text-center space-y-12">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
                    <Check size={56} />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-3xl lg:text-5xl font-black text-primary dark:text-ink">تم استلام <span className="text-bronze dark:text-secondary">طلبك!</span></h1>
                    <p className="text-xl text-gray-500 dark:text-muted font-medium">رقم طلبك هو <span className="text-primary dark:text-ink font-black">#MJM-{orderData?.id || '2026-XXXX'}</span>. سيتم شحنه قريباً جداً.</p>
                </div>

                <div className="bg-white dark:bg-card max-w-xl mx-auto p-10 rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-6">
                    <div className="flex justify-between items-center text-sm font-bold border-b border-primary/5 dark:border-white/10 pb-4">
                        <span className="text-gray-400 dark:text-muted">طريقة الدفع</span>
                        <span className="text-primary dark:text-ink uppercase">{paymentMethodLabel(selectedPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-b border-primary/5 dark:border-white/10 pb-4">
                        <span className="text-gray-400 dark:text-muted">الإجمالي</span>
                        <span className="text-secondary text-lg">{formatPrice(orderData?.totalAmount || total)}</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/profile" className="flex-1 bg-gray-100 dark:bg-white/10 text-primary dark:text-ink py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all text-center">تتبع طلباتي</Link>
                        <Link href="/" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-primary/20 text-center">العودة للرئيسية</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="sr-only">إتمام الشراء</h1>
            {/* Stepper */}
            <div className="max-w-3xl mx-auto flex items-center justify-between mb-16 relative">
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-100 dark:bg-white/10 -translate-y-1/2 -z-10" />
                {steps.map((s, i) => {
                    const isActive = s.id === step;
                    const isCompleted = steps.findIndex(x => x.id === step) > i;
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-4 bg-[#FAFBFC] dark:bg-background px-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                                isActive ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-110" :
                                    isCompleted ? "bg-secondary text-primary border-secondary scale-100" : "bg-white dark:bg-card text-gray-300 dark:text-muted border-gray-100 dark:border-white/10"
                            )}>
                                {isCompleted ? <Check size={24} /> : <s.icon size={24} />}
                            </div>
                            <span className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-primary dark:text-ink" : "text-gray-600 dark:text-muted")}>{s.name}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
                {/* Main Step Content */}
                <div className="flex-grow space-y-8">
                    <AnimatePresence mode="wait">
                        {step === "address" && (
                            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-primary dark:text-ink">عنوان <span className="text-bronze dark:text-secondary">التوصيل</span></h2>
                                </div>

                                <div className="space-y-6">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-10 space-y-4 border-2 border-dashed border-primary/10 dark:border-white/10 rounded-3xl">
                                            <p className="text-gray-600 dark:text-muted font-bold">لا توجد عناوين محفوظة</p>
                                            <Link href="/profile" className="inline-block bg-primary/10 text-primary dark:text-ink px-6 py-2 rounded-xl text-sm font-black hover:bg-primary hover:text-white transition-all">إضافة عنوان جديد</Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4" role="radiogroup" aria-label="اختر عنوان التوصيل">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    role="radio"
                                                    aria-checked={activeAddressId === addr.id}
                                                    tabIndex={0}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            setSelectedAddressId(addr.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center",
                                                        activeAddressId === addr.id ? "border-secondary bg-secondary/5" : "border-primary/5 dark:border-white/10 hover:border-primary/10"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeAddressId === addr.id ? "bg-secondary text-primary" : "bg-primary/5 dark:bg-white/5 text-primary dark:text-ink")}>
                                                            <MapPin size={22} aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-primary dark:text-ink">{addr.city} - {addr.district}</h3>
                                                            <p className="text-xs text-gray-600 dark:text-muted font-medium">{addr.street}, {addr.buildingNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", activeAddressId === addr.id ? "border-secondary bg-secondary text-primary" : "border-gray-100 dark:border-white/10")}>
                                                        {activeAddressId === addr.id && <Check size={14} strokeWidth={4} aria-hidden="true" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === "shipping" && (
                            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h2 className="text-2xl font-black text-primary dark:text-ink">طريقة <span className="text-bronze dark:text-secondary">الشحن</span></h2>

                                <div className="space-y-4">
                                    {[
                                        { id: "aramex", name: "أرامكس (توصيل سريع)", time: "24-48 ساعة", price: isFreeShipping ? 0 : 25 },
                                        { id: "saee", name: "ساعي", time: "2-3 أيام", price: isFreeShipping ? 0 : 20 },
                                        { id: "box_co", name: "شركة الصندوق (للنقل الثقيل)", time: "3-5 أيام", price: isFreeShipping ? 0 : 50 },
                                    ].map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => { }} // Future: set state
                                            className="p-8 rounded-[32px] border-2 border-primary/5 dark:border-white/10 bg-white dark:bg-card hover:border-secondary transition-all flex items-center justify-between group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-ink group-hover:bg-secondary group-hover:text-primary transition-all">
                                                    <Truck size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-black text-primary dark:text-ink">{m.name}</div>
                                                    <div className="text-xs text-gray-600 dark:text-muted font-bold uppercase">{m.time}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-bronze dark:text-secondary">{m.price === 0 ? "مجاني" : formatPrice(m.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === "payment" && (
                            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <h2 className="text-2xl font-black text-primary dark:text-ink">طريقة <span className="text-bronze dark:text-secondary">الدفع</span></h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="radiogroup" aria-label="اختر طريقة الدفع">
                                    {PAYMENT_METHODS.map((method) => (
                                        <div
                                            key={method}
                                            role="radio"
                                            aria-checked={selectedPayment === method}
                                            tabIndex={0}
                                            onClick={() => setSelectedPayment(method)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    setSelectedPayment(method);
                                                }
                                            }}
                                            className={cn(
                                                "p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center justify-between gap-4 bg-white dark:bg-card",
                                                selectedPayment === method ? "border-secondary shadow-xl shadow-secondary/5" : "border-primary/5 dark:border-white/10 hover:border-primary/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center uppercase font-black text-[10px]", selectedPayment === method ? "bg-secondary text-primary" : "bg-primary/5 dark:bg-white/5 text-primary dark:text-ink")}>
                                                    {method.charAt(0)}
                                                </div>
                                                <div className="font-bold text-primary dark:text-ink uppercase tracking-tighter">{paymentMethodLabel(method)}</div>
                                            </div>
                                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", selectedPayment === method ? "border-secondary bg-secondary text-primary shadow-lg" : "border-gray-100 dark:border-white/10")}>
                                                {selectedPayment === method && <Check size={14} strokeWidth={4} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-primary/5 dark:bg-white/5 p-8 rounded-[32px] border border-primary/5 dark:border-white/10 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white dark:bg-card w-10 h-10 rounded-xl flex items-center justify-center text-primary dark:text-ink shrink-0 shadow-sm"><ShieldCheck size={24} /></div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-primary dark:text-ink">دفع آمن بنسبة 100%</p>
                                            <p className="text-xs text-gray-600 dark:text-muted font-medium">بياناتك مشفرة تماماً عبر بروتوكولات الحماية العالمية المعتمدة في المملكة.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-12 border-t border-primary/5 dark:border-white/10">
                        <button
                            onClick={() => {
                                if (step === "payment") setStep("shipping");
                                else if (step === "shipping") setStep("address");
                            }}
                            className={cn("flex items-center gap-2 font-black text-primary dark:text-ink hover:text-secondary transition-colors", step === "address" && "invisible")}
                        >
                            <ArrowRight size={20} />
                            العودة للسابق
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isPlacingOrder}
                            className="bg-primary text-white py-5 px-12 rounded-[24px] font-black text-xl hover:bg-secondary hover:text-primary transition-all shadow-2xl shadow-primary/20 flex items-center gap-4 group disabled:opacity-50"
                        >
                            {isPlacingOrder ? "جاري الإرسال..." : step === "address" ? "المتابعة للشحن" : step === "shipping" ? "المتابعة للدفع" : "تأكيد الطلب والدفع"}
                            <ChevronLeft size={24} className="group-hover:translate-x-[-10px] transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <aside className="lg:w-96 w-full lg:sticky lg:top-28 space-y-6">
                    <div className="bg-white dark:bg-card rounded-[40px] p-8 lg:p-10 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-8">
                        <h2 className="text-xl font-black text-primary dark:text-ink">ملخص <span className="text-bronze dark:text-secondary">الطلب</span></h2>

                        <div
                            className="space-y-6 max-h-[300px] overflow-auto pr-2 scrollbar-hide"
                            tabIndex={0}
                            aria-label="ملخص الطلب"
                        >
                            {items.map((item) => (
                                <CheckoutSummaryItem key={item.id} item={item} />
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-primary/5 dark:border-white/10">
                            <div className="flex justify-between items-center text-gray-600 dark:text-muted font-bold text-sm">
                                <span>المجموع الفرعي</span>
                                <span className="text-primary dark:text-ink">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 dark:text-muted font-bold text-sm">
                                <span>رسوم الشحن</span>
                                <span className={cn(shippingFee === 0 ? "text-green-700" : "text-primary dark:text-ink")}>
                                    {shippingFee === 0 ? "مجاني" : formatPrice(shippingFee)}
                                </span>
                            </div>
                            {taxAmount > 0 && (
                                <div className="flex justify-between items-center text-gray-600 dark:text-muted font-bold text-sm">
                                    <span>الضريبة ({vatRate}%)</span>
                                    <span className="text-primary dark:text-ink">{formatPrice(taxAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-black text-primary dark:text-ink">الإجمالي</span>
                                <span className="text-2xl font-black text-bronze dark:text-secondary">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/10 flex items-center gap-4 group cursor-pointer hover:bg-secondary/20 transition-all">
                        <div className="w-10 h-10 bg-white dark:bg-card text-secondary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Truck size={22} strokeWidth={2.5} />
                        </div>
                        <div className="text-xs font-black text-bronze dark:text-secondary uppercase tracking-widest">توصيل متوقع خلال 24 ساعة</div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
